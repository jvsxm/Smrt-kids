const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export interface TrailerResult {
  available: boolean;
  videoId: string | null;
  embedUrl: string | null;
  watchUrl: string | null;
  title: string | null;
  channelTitle: string | null;
  source: 'CACHED' | 'YOUTUBE_API' | 'TMDB' | 'UNCONFIGURED' | 'NOT_FOUND';
  youtubeConfigured: boolean;
  message?: string;
}

export function isYouTubeConfigured(): boolean {
  return Boolean(
    process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY.trim().length > 0
  );
}

export function extractYouTubeVideoId(
  urlOrId: string | null | undefined
): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (VIDEO_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'www.youtube.com' ||
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'www.youtube-nocookie.com'
    ) {
      const v = parsed.searchParams.get('v');
      if (v && VIDEO_ID_REGEX.test(v)) return v;

      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (
        (pathParts[0] === 'embed' || pathParts[0] === 'shorts') &&
        pathParts[1] &&
        VIDEO_ID_REGEX.test(pathParts[1])
      ) {
        return pathParts[1];
      }
    }
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      if (id && VIDEO_ID_REGEX.test(id)) return id;
    }
  } catch {
    return null;
  }

  return null;
}

export function buildSafeTrailerPayload(
  videoId: string,
  source: TrailerResult['source'],
  title: string | null = null,
  channelTitle: string | null = null
): TrailerResult {
  return {
    available: true,
    videoId,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    title,
    channelTitle,
    source,
    youtubeConfigured: isYouTubeConfigured(),
  };
}

interface YouTubeSearchResponse {
  items?: Array<{
    id?: { videoId?: string };
    snippet?: {
      title?: string;
      channelTitle?: string;
    };
  }>;
}

export async function searchOfficialCartoonTrailer(options: {
  title: string;
  mediaType: 'MOVIE' | 'TV' | string;
  releaseDate?: string | null;
}): Promise<TrailerResult> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    return {
      available: false,
      videoId: null,
      embedUrl: null,
      watchUrl: null,
      title: null,
      channelTitle: null,
      source: 'UNCONFIGURED',
      youtubeConfigured: false,
      message:
        'YOUTUBE_API_KEY is not configured in server secrets. Configure YOUTUBE_API_KEY in Settings -> Secrets to search official trailers.',
    };
  }

  const year = options.releaseDate ? options.releaseDate.slice(0, 4) : '';
  const typeWord = options.mediaType === 'TV' ? 'animated series' : 'animated movie';
  const query = `${options.title} ${year} ${typeWord} official trailer`.trim();

  const url = new URL(YOUTUBE_SEARCH_URL);
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('safeSearch', 'strict');
  url.searchParams.set('maxResults', '3');
  url.searchParams.set('q', query);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`YouTube Data API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as YouTubeSearchResponse;
  const candidate = (data.items || []).find((item) =>
    Boolean(extractYouTubeVideoId(item.id?.videoId))
  );

  const videoId = extractYouTubeVideoId(candidate?.id?.videoId);
  if (!videoId) {
    return {
      available: false,
      videoId: null,
      embedUrl: null,
      watchUrl: null,
      title: null,
      channelTitle: null,
      source: 'NOT_FOUND',
      youtubeConfigured: true,
      message: 'No embeddable official trailer was found on YouTube for this title.',
    };
  }

  return buildSafeTrailerPayload(
    videoId,
    'YOUTUBE_API',
    candidate?.snippet?.title || `${options.title} — Official Trailer`,
    candidate?.snippet?.channelTitle || 'YouTube'
  );
}
