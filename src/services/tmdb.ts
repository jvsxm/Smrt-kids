import { db } from '../db/index.ts';
import {
  cartoonGenres,
  cartoonLanguages,
  cartoons,
  contentRatings,
  genres,
  languages,
} from '../db/schema.ts';
import { normalizeAgeRating } from './ageClassification.ts';
import { ensureCatalogSeeded } from './seedCatalog.ts';
import { extractYouTubeVideoId } from './youtube.ts';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TARGET_COUNTRIES = ['DE', 'US', 'FR', 'GB'];
const EDUCATIONAL_KEYWORDS = [
  'learn',
  'science',
  'ocean',
  'nature',
  'math',
  'space',
  'explore',
  'school',
  'family',
  'curious',
  'discover',
];

export function isTmdbConfigured(): boolean {
  return Boolean(
    process.env.TMDB_API_KEY && process.env.TMDB_API_KEY.trim().length > 0
  );
}

async function tmdbFetch<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T> {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is not configured');
  }

  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('include_adult', 'false');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}

interface TmdbDiscoverMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string;
  release_date?: string;
  adult?: boolean;
  vote_average?: number;
  genre_ids?: number[];
}

interface TmdbDiscoverTv {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string;
  first_air_date?: string;
  adult?: boolean;
  vote_average?: number;
  genre_ids?: number[];
}

interface TmdbDetailPayload {
  runtime?: number;
  episode_run_time?: number[];
  genres?: Array<{ id: number; name: string }>;
  spoken_languages?: Array<{ iso_639_1: string; english_name?: string; name?: string }>;
  translations?: {
    translations?: Array<{ iso_639_1: string; english_name?: string }>;
  };
  videos?: {
    results?: Array<{ site: string; type: string; key: string; official?: boolean }>;
  };
  release_dates?: {
    results?: Array<{
      iso_3166_1: string;
      release_dates: Array<{ certification: string }>;
    }>;
  };
  content_ratings?: {
    results?: Array<{
      iso_3166_1: string;
      rating: string;
    }>;
  };
}

function inferEducational(overview: string, genreIds: number[]): boolean {
  if (genreIds.includes(99) || genreIds.includes(10762)) return true;
  const lower = overview.toLowerCase();
  return EDUCATIONAL_KEYWORDS.some((kw) => lower.includes(kw));
}

function pickTrailerFromTmdbVideos(
  videos?: TmdbDetailPayload['videos']
): string | null {
  const candidates = (videos?.results || []).filter(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const official = candidates.find((v) => v.official) || candidates[0];
  const validId = extractYouTubeVideoId(official?.key);
  return validId ? `https://www.youtube.com/watch?v=${validId}` : null;
}

async function upsertNormalizedCartoon(params: {
  tmdbId: number;
  mediaType: 'MOVIE' | 'TV';
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  originalLanguage: string;
  releaseDate: string | null;
  isAdult: boolean;
  tmdbRating: number | null;
  genreIds: number[];
}) {
  const detailPath =
    params.mediaType === 'MOVIE'
      ? `/movie/${params.tmdbId}`
      : `/tv/${params.tmdbId}`;

  let detail: TmdbDetailPayload | null = null;
  try {
    const append =
      params.mediaType === 'MOVIE'
        ? 'release_dates,translations,videos'
        : 'content_ratings,translations,videos';
    detail = await tmdbFetch<TmdbDetailPayload>(detailPath, {
      append_to_response: append,
    });
  } catch (err) {
    console.error(`Failed to fetch TMDB details for ${detailPath}:`, err);
  }

  const normalizedGenreList =
    detail?.genres && detail.genres.length > 0
      ? detail.genres
      : params.genreIds.map((id) => ({ id, name: `Genre ${id}` }));

  const effectiveGenreIds = normalizedGenreList.map((g) => g.id);
  const runtimeMinutes =
    params.mediaType === 'MOVIE'
      ? detail?.runtime ?? null
      : detail?.episode_run_time?.[0] ?? null;

  const trailerUrl = pickTrailerFromTmdbVideos(detail?.videos);
  const origLang = (params.originalLanguage || 'en').trim().toLowerCase();
  await upsertLanguageIfMissing(origLang);

  const saved = await db
    .insert(cartoons)
    .values({
      tmdbId: params.tmdbId,
      title: params.title,
      overview: params.overview || 'Animated family title.',
      posterPath: params.posterPath,
      backdropPath: params.backdropPath,
      mediaType: params.mediaType,
      originalLanguage: origLang,
      metadataLanguage: 'en',
      releaseDate: params.releaseDate,
      runtimeMinutes,
      isAdult: params.isAdult,
      isAnimation: effectiveGenreIds.includes(16),
      isEducational: inferEducational(params.overview || '', effectiveGenreIds),
      tmdbRating: params.tmdbRating,
      trailerUrl,
      source: 'TMDB',
      lastSyncedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [cartoons.tmdbId, cartoons.mediaType],
      set: {
        title: params.title,
        overview: params.overview || 'Animated family title.',
        posterPath: params.posterPath,
        backdropPath: params.backdropPath,
        runtimeMinutes,
        isEducational: inferEducational(params.overview || '', effectiveGenreIds),
        tmdbRating: params.tmdbRating,
        ...(trailerUrl ? { trailerUrl } : {}),
        source: 'TMDB',
        lastSyncedAt: new Date(),
      },
    })
    .returning();

  const cartoonId = saved[0]?.id;
  if (!cartoonId) return null;

  // Link normalized genres
  for (const g of normalizedGenreList) {
    await db
      .insert(genres)
      .values({ id: g.id, name: g.name })
      .onConflictDoNothing({ target: genres.id });
    await db
      .insert(cartoonGenres)
      .values({ cartoonId, genreId: g.id })
      .onConflictDoNothing();
  }

  // Link original + spoken audio languages
  const audioCodes = new Set<string>([origLang]);
  for (const sl of detail?.spoken_languages || []) {
    if (sl.iso_639_1) {
      const code = sl.iso_639_1.trim().toLowerCase();
      await upsertLanguageIfMissing(code, sl.english_name || sl.name);
      audioCodes.add(code);
    }
  }
  for (const code of audioCodes) {
    await db
      .insert(cartoonLanguages)
      .values({ cartoonId, languageCode: code, audioType: 'AUDIO' })
      .onConflictDoNothing();
  }

  // Link available translation/subtitle languages
  const translationCodes = (detail?.translations?.translations || [])
    .map((t) => t.iso_639_1?.trim().toLowerCase())
    .filter((c): c is string => Boolean(c) && ['en', 'ar', 'de', 'fr', 'es', 'ja'].includes(c));
  for (const code of translationCodes) {
    await upsertLanguageIfMissing(code);
    await db
      .insert(cartoonLanguages)
      .values({ cartoonId, languageCode: code, audioType: 'SUBTITLE' })
      .onConflictDoNothing();
  }

  // Normalize regional age certifications
  if (params.mediaType === 'MOVIE') {
    for (const entry of detail?.release_dates?.results || []) {
      if (!TARGET_COUNTRIES.includes(entry.iso_3166_1)) continue;
      const cert = entry.release_dates.find(
        (rd) => rd.certification && rd.certification.trim().length > 0
      );
      if (!cert) continue;
      const normalized = normalizeAgeRating(entry.iso_3166_1, cert.certification);
      await upsertNormalizedRating(
        cartoonId,
        entry.iso_3166_1,
        normalized.normalizedLabel,
        normalized.minimumAge,
        'TMDB Release Dates',
        normalized.verified
      );
    }
  } else {
    for (const entry of detail?.content_ratings?.results || []) {
      if (!TARGET_COUNTRIES.includes(entry.iso_3166_1)) continue;
      if (!entry.rating) continue;
      const normalized = normalizeAgeRating(entry.iso_3166_1, entry.rating);
      await upsertNormalizedRating(
        cartoonId,
        entry.iso_3166_1,
        normalized.normalizedLabel,
        normalized.minimumAge,
        'TMDB Content Ratings',
        normalized.verified
      );
    }
  }

  return cartoonId;
}

async function upsertNormalizedRating(
  cartoonId: string,
  countryCode: string,
  originalRating: string,
  minimumAge: number | null,
  source: string,
  verified: boolean
) {
  await db
    .insert(contentRatings)
    .values({
      cartoonId,
      countryCode,
      originalRating,
      minimumAge,
      source,
      verified,
      verifiedAt: verified ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: [contentRatings.cartoonId, contentRatings.countryCode, contentRatings.source],
      set: {
        originalRating,
        minimumAge,
        verified,
        verifiedAt: verified ? new Date() : null,
      },
    });
}

export async function syncCatalogFromTmdb(options?: { query?: string }): Promise<{
  syncedCount: number;
  source: string;
}> {
  await ensureCatalogSeeded();

  if (!isTmdbConfigured()) {
    throw new Error('TMDB_API_KEY is not configured in server secrets');
  }

  let movies: TmdbDiscoverMovie[] = [];
  let tvShows: TmdbDiscoverTv[] = [];

  if (options?.query && options.query.trim().length > 0) {
    const q = options.query.trim();
    const [movieSearch, tvSearch] = await Promise.all([
      tmdbFetch<{ results: TmdbDiscoverMovie[] }>('/search/movie', {
        query: q,
        page: '1',
      }),
      tmdbFetch<{ results: TmdbDiscoverTv[] }>('/search/tv', {
        query: q,
        page: '1',
      }),
    ]);
    movies = (movieSearch.results || [])
      .filter((m) => (m.genre_ids || []).includes(16) && !m.adult)
      .slice(0, 6);
    tvShows = (tvSearch.results || [])
      .filter((t) => (t.genre_ids || []).includes(16) && !t.adult)
      .slice(0, 6);
  } else {
    const [movieDiscover, tvDiscover] = await Promise.all([
      tmdbFetch<{ results: TmdbDiscoverMovie[] }>('/discover/movie', {
        with_genres: '16',
        sort_by: 'popularity.desc',
        certification_country: 'DE',
        'certification.lte': '6',
        page: '1',
      }),
      tmdbFetch<{ results: TmdbDiscoverTv[] }>('/discover/tv', {
        with_genres: '16',
        sort_by: 'popularity.desc',
        page: '1',
      }),
    ]);
    movies = (movieDiscover.results || [])
      .filter((m) => !m.adult)
      .slice(0, 8);
    tvShows = (tvDiscover.results || [])
      .filter((t) => !t.adult)
      .slice(0, 8);
  }

  let syncedCount = 0;

  for (const m of movies) {
    const id = await upsertNormalizedCartoon({
      tmdbId: m.id,
      mediaType: 'MOVIE',
      title: m.title,
      overview: m.overview || 'Animated feature film.',
      posterPath: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : null,
      backdropPath: m.backdrop_path
        ? `${TMDB_IMAGE_BASE}${m.backdrop_path}`
        : null,
      originalLanguage: m.original_language || 'en',
      releaseDate: m.release_date || null,
      isAdult: Boolean(m.adult),
      tmdbRating: m.vote_average ?? null,
      genreIds: m.genre_ids || [16],
    });
    if (id) syncedCount += 1;
  }

  for (const t of tvShows) {
    const id = await upsertNormalizedCartoon({
      tmdbId: t.id,
      mediaType: 'TV',
      title: t.name,
      overview: t.overview || 'Animated television series.',
      posterPath: t.poster_path ? `${TMDB_IMAGE_BASE}${t.poster_path}` : null,
      backdropPath: t.backdrop_path
        ? `${TMDB_IMAGE_BASE}${t.backdrop_path}`
        : null,
      originalLanguage: t.original_language || 'en',
      releaseDate: t.first_air_date || null,
      isAdult: Boolean(t.adult),
      tmdbRating: t.vote_average ?? null,
      genreIds: t.genre_ids || [16],
    });
    if (id) syncedCount += 1;
  }

  return { syncedCount, source: 'TMDB' };
}

async function upsertLanguageIfMissing(code: string | undefined, name?: string) {
  const clean = (code || 'en').trim().toLowerCase();
  await db
    .insert(languages)
    .values({ code: clean, name: name || clean.toUpperCase() })
    .onConflictDoNothing({ target: languages.code });
}
