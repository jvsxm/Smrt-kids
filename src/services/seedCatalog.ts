import { count } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  cartoonGenres,
  cartoonLanguages,
  cartoons,
  contentRatings,
  genres,
  languages,
} from '../db/schema.ts';

export const STANDARD_GENRES = [
  { id: 16, name: 'Animation' },
  { id: 12, name: 'Adventure' },
  { id: 35, name: 'Comedy' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 878, name: 'Science Fiction' },
  { id: 9648, name: 'Mystery' },
  { id: 10402, name: 'Music' },
  { id: 10762, name: 'Kids' },
  { id: 99, name: 'Educational & Nature' },
];

export const STANDARD_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' },
];

interface SeedCartoonItem {
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  mediaType: 'MOVIE' | 'TV';
  originalLanguage: string;
  releaseDate: string;
  runtimeMinutes: number;
  isEducational: boolean;
  tmdbRating: number;
  genreIds: number[];
  audioLanguages: string[];
  subtitleLanguages: string[];
  ratings: Array<{
    countryCode: string;
    originalRating: string;
    minimumAge: number | null;
    source: string;
    verified: boolean;
  }>;
}

const STARTER_CARTOONS: SeedCartoonItem[] = [
  {
    tmdbId: 82728,
    title: 'Bluey',
    overview:
      'Bluey, an inexhaustible six-year-old Blue Heeler dog, lives with her dad, mum, and four-year-old little sister Bingo, turning everyday family moments into playful imaginative adventures.',
    posterPath: '/src/assets/images/poster_forest_explorers_1795218110607.jpg',
    mediaType: 'TV',
    originalLanguage: 'en',
    releaseDate: '2018-10-01',
    runtimeMinutes: 7,
    isEducational: true,
    tmdbRating: 8.6,
    genreIds: [16, 10751, 35, 10762],
    audioLanguages: ['en', 'de', 'fr', 'ar', 'es'],
    subtitleLanguages: ['en', 'de', 'fr', 'ar'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'TV-Y', minimumAge: 0, source: 'TV Parental Guidelines', verified: true },
      { countryCode: 'GB', originalRating: 'U', minimumAge: 0, source: 'BBFC', verified: true },
    ],
  },
  {
    tmdbId: 61550,
    title: 'Octonauts',
    overview:
      'A team of eight intrepid underwater explorers dive into uncharted oceans to rescue marine creatures, study habitats, and protect coral reefs.',
    posterPath: '/src/assets/images/poster_ocean_odyssey_1795218110397.jpg',
    mediaType: 'TV',
    originalLanguage: 'en',
    releaseDate: '2010-10-04',
    runtimeMinutes: 11,
    isEducational: true,
    tmdbRating: 7.8,
    genreIds: [16, 12, 10762, 99],
    audioLanguages: ['en', 'ar', 'de', 'fr', 'es'],
    subtitleLanguages: ['en', 'de', 'ar'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'TV-Y', minimumAge: 0, source: 'TV Parental Guidelines', verified: true },
    ],
  },
  {
    tmdbId: 8392,
    title: 'My Neighbor Totoro',
    overview:
      'Two young sisters move to the Japanese countryside with their father and discover gentle forest spirits, including the giant guardian Totoro.',
    posterPath: '/src/assets/images/poster_forest_explorers_1795218110607.jpg',
    mediaType: 'MOVIE',
    originalLanguage: 'ja',
    releaseDate: '1988-04-16',
    runtimeMinutes: 86,
    isEducational: false,
    tmdbRating: 8.1,
    genreIds: [16, 14, 10751, 12],
    audioLanguages: ['ja', 'en', 'de', 'fr', 'es'],
    subtitleLanguages: ['en', 'de', 'fr', 'ar'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'G', minimumAge: 0, source: 'MPAA', verified: true },
      { countryCode: 'FR', originalRating: 'U', minimumAge: 0, source: 'CNC', verified: true },
    ],
  },
  {
    tmdbId: 900101,
    title: 'Starlight Rooftop Academy',
    overview:
      'Two curious neighborhood friends build a homemade observatory and map constellations while learning real astronomy, teamwork, and patience.',
    posterPath: '/src/assets/images/poster_starlight_academy_1795218110847.jpg',
    mediaType: 'TV',
    originalLanguage: 'en',
    releaseDate: '2023-03-14',
    runtimeMinutes: 15,
    isEducational: true,
    tmdbRating: 8.2,
    genreIds: [16, 878, 12, 10762, 99],
    audioLanguages: ['en', 'de', 'ar', 'fr'],
    subtitleLanguages: ['en', 'de', 'ar', 'es'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'TV-G', minimumAge: 0, source: 'TV Parental Guidelines', verified: true },
    ],
  },
  {
    tmdbId: 900102,
    title: 'Kitchen Lab Inventors',
    overview:
      'A young maker and her lively workshop beakers explore safe everyday chemistry, buoyancy, and creative problem-solving at home.',
    posterPath: '/src/assets/images/poster_kitchen_science_1795218110800.jpg',
    mediaType: 'TV',
    originalLanguage: 'en',
    releaseDate: '2024-01-20',
    runtimeMinutes: 12,
    isEducational: true,
    tmdbRating: 8.4,
    genreIds: [16, 35, 99, 10762],
    audioLanguages: ['en', 'ar', 'fr', 'de'],
    subtitleLanguages: ['en', 'ar', 'de'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'TV-Y', minimumAge: 0, source: 'TV Parental Guidelines', verified: true },
    ],
  },
  {
    tmdbId: 79242,
    title: 'Hilda',
    overview:
      'Fearless, blue-haired Hilda leaves her enchanted wilderness cabin for the bustling city of Trolberg, befriending mythical creatures along the way.',
    posterPath: '/src/assets/images/poster_starlight_academy_1795218110847.jpg',
    mediaType: 'TV',
    originalLanguage: 'en',
    releaseDate: '2018-09-21',
    runtimeMinutes: 24,
    isEducational: false,
    tmdbRating: 8.4,
    genreIds: [16, 12, 14, 9648, 10751],
    audioLanguages: ['en', 'de', 'fr', 'es', 'ar'],
    subtitleLanguages: ['en', 'de', 'fr', 'ar', 'es'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 6', minimumAge: 6, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'TV-Y7', minimumAge: 7, source: 'TV Parental Guidelines', verified: true },
    ],
  },
  {
    tmdbId: 508965,
    title: 'Klaus',
    overview:
      'A selfish postman stationed in a frozen northern town forms an unlikely friendship with a reclusive toymaker, sparking warmth and generosity.',
    posterPath: '/src/assets/images/poster_starlight_academy_1795218110847.jpg',
    mediaType: 'MOVIE',
    originalLanguage: 'en',
    releaseDate: '2019-11-08',
    runtimeMinutes: 97,
    isEducational: false,
    tmdbRating: 8.2,
    genreIds: [16, 12, 35, 10751],
    audioLanguages: ['en', 'de', 'fr', 'es', 'ar'],
    subtitleLanguages: ['en', 'de', 'fr', 'ar'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 6', minimumAge: 6, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'PG', minimumAge: 6, source: 'MPAA', verified: true },
      { countryCode: 'GB', originalRating: 'PG', minimumAge: 6, source: 'BBFC', verified: true },
    ],
  },
  {
    tmdbId: 12,
    title: 'Finding Nemo',
    overview:
      'After his son is swept away to Sydney, a cautious clownfish embarks on an unforgettable ocean journey with a cheerful forgetful friend.',
    posterPath: '/src/assets/images/poster_ocean_odyssey_1795218110397.jpg',
    mediaType: 'MOVIE',
    originalLanguage: 'en',
    releaseDate: '2003-05-30',
    runtimeMinutes: 100,
    isEducational: false,
    tmdbRating: 7.8,
    genreIds: [16, 12, 35, 10751],
    audioLanguages: ['en', 'de', 'fr', 'es', 'ar'],
    subtitleLanguages: ['en', 'de', 'fr', 'ar'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'G', minimumAge: 0, source: 'MPAA', verified: true },
    ],
  },
  {
    tmdbId: 263109,
    title: 'Shaun the Sheep Movie',
    overview:
      'When Shaun takes a day off for some mischief on the farm, things escalate into a slapstick silent-comedy rescue mission in the big city.',
    posterPath: '/src/assets/images/poster_forest_explorers_1795218110607.jpg',
    mediaType: 'MOVIE',
    originalLanguage: 'en',
    releaseDate: '2015-02-05',
    runtimeMinutes: 85,
    isEducational: false,
    tmdbRating: 7.1,
    genreIds: [16, 35, 12, 10751],
    audioLanguages: ['en', 'de', 'fr', 'ar', 'es'],
    subtitleLanguages: ['en', 'de'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'PG', minimumAge: 6, source: 'MPAA', verified: true },
      { countryCode: 'GB', originalRating: 'U', minimumAge: 0, source: 'BBFC', verified: true },
    ],
  },
  {
    tmdbId: 265712,
    title: 'Song of the Sea',
    overview:
      'Ben and his little sister Saoirse embark on an enchanting journey across Irish folklore to save magical sea creatures and find their way home.',
    posterPath: '/src/assets/images/poster_ocean_odyssey_1795218110397.jpg',
    mediaType: 'MOVIE',
    originalLanguage: 'en',
    releaseDate: '2014-12-10',
    runtimeMinutes: 93,
    isEducational: false,
    tmdbRating: 8.0,
    genreIds: [16, 14, 10751, 10402],
    audioLanguages: ['en', 'fr', 'de'],
    subtitleLanguages: ['en', 'de', 'fr', 'ar'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'PG', minimumAge: 6, source: 'MPAA', verified: true },
    ],
  },
  {
    tmdbId: 129,
    title: 'Spirited Away',
    overview:
      'Ten-year-old Chihiro wanders into a mysterious spirit realm and must show courage and resourcefulness to reunite with her parents.',
    posterPath: '/src/assets/images/poster_starlight_academy_1795218110847.jpg',
    mediaType: 'MOVIE',
    originalLanguage: 'ja',
    releaseDate: '2001-07-20',
    runtimeMinutes: 125,
    isEducational: false,
    tmdbRating: 8.5,
    genreIds: [16, 14, 12, 10751],
    audioLanguages: ['ja', 'en', 'de', 'fr'],
    subtitleLanguages: ['en', 'de', 'fr', 'ar', 'es'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 6', minimumAge: 6, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'PG', minimumAge: 6, source: 'MPAA', verified: true },
    ],
  },
  {
    tmdbId: 324857,
    title: 'Spider-Man: Into the Spider-Verse',
    overview:
      'Teenager Miles Morales discovers boundless possibilities across alternate dimensions when multiple Spider-heroes team up to protect reality.',
    posterPath: '/src/assets/images/poster_kitchen_science_1795218110800.jpg',
    mediaType: 'MOVIE',
    originalLanguage: 'en',
    releaseDate: '2018-12-14',
    runtimeMinutes: 117,
    isEducational: false,
    tmdbRating: 8.4,
    genreIds: [16, 12, 878],
    audioLanguages: ['en', 'de', 'fr', 'es', 'ar'],
    subtitleLanguages: ['en', 'de', 'fr', 'ar'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 6', minimumAge: 6, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'PG', minimumAge: 6, source: 'MPAA', verified: true },
    ],
  },
  {
    tmdbId: 900103,
    title: 'Amber Valley Chronicles',
    overview:
      'An independent animated anthology of woodland folktales whose regional age rating is still awaiting formal national board verification.',
    posterPath: '/src/assets/images/poster_forest_explorers_1795218110607.jpg',
    mediaType: 'TV',
    originalLanguage: 'fr',
    releaseDate: '2024-06-01',
    runtimeMinutes: 18,
    isEducational: true,
    tmdbRating: 7.6,
    genreIds: [16, 12, 14],
    audioLanguages: ['fr', 'en'],
    subtitleLanguages: ['en', 'de', 'ar'],
    ratings: [
      { countryCode: 'DE', originalRating: 'Pending Review', minimumAge: null, source: 'Unverified Submission', verified: false },
    ],
  },
  {
    tmdbId: 109445,
    title: 'Frozen',
    overview:
      'Fearless optimist Anna sets off on an epic alpine journey alongside rugged mountain man Kristoff and a cheerful snowman to find her sister Elsa.',
    posterPath: '/src/assets/images/poster_starlight_academy_1795218110847.jpg',
    mediaType: 'MOVIE',
    originalLanguage: 'en',
    releaseDate: '2013-11-27',
    runtimeMinutes: 102,
    isEducational: false,
    tmdbRating: 7.2,
    genreIds: [16, 12, 14, 10751, 10402],
    audioLanguages: ['en', 'de', 'fr', 'es', 'ar'],
    subtitleLanguages: ['en', 'de', 'fr', 'ar'],
    ratings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK Official', verified: true },
      { countryCode: 'US', originalRating: 'PG', minimumAge: 6, source: 'MPAA', verified: true },
    ],
  },
];

let seedPromise: Promise<void> | null = null;

export async function ensureCatalogSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

async function runSeed(): Promise<void> {
  for (const g of STANDARD_GENRES) {
    await db
      .insert(genres)
      .values(g)
      .onConflictDoNothing({ target: genres.id });
  }

  for (const l of STANDARD_LANGUAGES) {
    await db
      .insert(languages)
      .values(l)
      .onConflictDoNothing({ target: languages.code });
  }

  const existing = await db.select({ total: count() }).from(cartoons);
  if ((existing[0]?.total ?? 0) > 0) {
    return;
  }

  for (const item of STARTER_CARTOONS) {
    const inserted = await db
      .insert(cartoons)
      .values({
        tmdbId: item.tmdbId,
        title: item.title,
        overview: item.overview,
        posterPath: item.posterPath,
        mediaType: item.mediaType,
        originalLanguage: item.originalLanguage,
        metadataLanguage: 'en',
        releaseDate: item.releaseDate,
        runtimeMinutes: item.runtimeMinutes,
        isAdult: false,
        isAnimation: true,
        isEducational: item.isEducational,
        tmdbRating: item.tmdbRating,
        source: 'CURATED',
      })
      .onConflictDoNothing({
        target: [cartoons.tmdbId, cartoons.mediaType],
      })
      .returning();

    const cartoonId = inserted[0]?.id;
    if (!cartoonId) continue;

    for (const genreId of item.genreIds) {
      await db
        .insert(cartoonGenres)
        .values({ cartoonId, genreId })
        .onConflictDoNothing();
    }

    for (const code of item.audioLanguages) {
      await db
        .insert(cartoonLanguages)
        .values({ cartoonId, languageCode: code, audioType: 'AUDIO' })
        .onConflictDoNothing();
    }

    for (const code of item.subtitleLanguages) {
      await db
        .insert(cartoonLanguages)
        .values({ cartoonId, languageCode: code, audioType: 'SUBTITLE' })
        .onConflictDoNothing();
    }

    for (const r of item.ratings) {
      await db
        .insert(contentRatings)
        .values({
          cartoonId,
          countryCode: r.countryCode,
          originalRating: r.originalRating,
          minimumAge: r.minimumAge,
          source: r.source,
          verified: r.verified,
          verifiedAt: r.verified ? new Date() : null,
        })
        .onConflictDoNothing();
    }
  }
}
