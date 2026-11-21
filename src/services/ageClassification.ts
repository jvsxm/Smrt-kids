export interface NormalizedClassification {
  minimumAge: number | null;
  verified: boolean;
  normalizedLabel: string;
}

export interface StoredContentRating {
  countryCode: string;
  originalRating: string;
  minimumAge: number | null;
  source: string;
  verified: boolean;
}

const FSK_MAP: Record<string, number> = {
  '0': 0,
  'FSK 0': 0,
  'FSK0': 0,
  'AB 0': 0,
  '6': 6,
  'FSK 6': 6,
  'FSK6': 6,
  'AB 6': 6,
  '12': 12,
  'FSK 12': 12,
  'FSK12': 12,
  'AB 12': 12,
  '16': 16,
  'FSK 16': 16,
  'FSK16': 16,
  'AB 16': 16,
  '18': 18,
  'FSK 18': 18,
  'FSK18': 18,
  'AB 18': 18,
};

const US_MAP: Record<string, number> = {
  'G': 0,
  'TV-Y': 0,
  'TV-G': 0,
  'PG': 6,
  'TV-Y7': 7,
  'TV-Y7-FV': 7,
  'TV-PG': 8,
  'PG-13': 13,
  'TV-14': 14,
  'R': 17,
  'NC-17': 18,
  'TV-MA': 17,
};

const FR_MAP: Record<string, number> = {
  'U': 0,
  'TP': 0,
  'TOUS PUBLICS': 0,
  '10': 10,
  '-10': 10,
  '12': 12,
  '-12': 12,
  '16': 16,
  '-16': 16,
  '18': 18,
  '-18': 18,
};

const GB_MAP: Record<string, number> = {
  'U': 0,
  'PG': 6,
  '12': 12,
  '12A': 12,
  '15': 15,
  '18': 18,
};

export function normalizeAgeRating(
  countryCode: string,
  rawRating: string | null | undefined
): NormalizedClassification {
  if (!rawRating) {
    return { minimumAge: null, verified: false, normalizedLabel: 'Unrated' };
  }

  const country = countryCode.trim().toUpperCase();
  const cleaned = rawRating.trim().toUpperCase();

  if (!cleaned || cleaned === 'NR' || cleaned === 'UNRATED' || cleaned === 'UNKNOWN') {
    return { minimumAge: null, verified: false, normalizedLabel: 'Unverified' };
  }

  let age: number | undefined;

  if (country === 'DE') {
    age = FSK_MAP[cleaned];
  } else if (country === 'US') {
    age = US_MAP[cleaned];
  } else if (country === 'FR') {
    age = FR_MAP[cleaned];
  } else if (country === 'GB' || country === 'UK') {
    age = GB_MAP[cleaned];
  } else {
    age = FSK_MAP[cleaned] ?? US_MAP[cleaned] ?? GB_MAP[cleaned];
  }

  if (age === undefined) {
    const numericMatch = cleaned.match(/^(?:FSK\s*)?(\d{1,2})\+?$/);
    if (numericMatch) {
      const parsed = Number.parseInt(numericMatch[1], 10);
      if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 18) {
        age = parsed;
      }
    }
  }

  if (age === undefined) {
    return {
      minimumAge: null,
      verified: false,
      normalizedLabel: `${country} ${rawRating.trim()} (Unverified)`,
    };
  }

  return {
    minimumAge: age,
    verified: true,
    normalizedLabel: country === 'DE' && !cleaned.startsWith('FSK') ? `FSK ${age}` : rawRating.trim(),
  };
}

export function calculateAgeFromBirthDate(birthDateIso: string, now = new Date()): number {
  const parts = birthDateIso.split('-').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return 0;
  }
  const [year, month, day] = parts;
  let age = now.getUTCFullYear() - year;
  const currentMonth = now.getUTCMonth() + 1;
  const currentDay = now.getUTCDate();

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function selectClassificationForCountry(
  ratingsList: StoredContentRating[],
  preferredCountry: string
): {
  primary: StoredContentRating | null;
  matchedRequestedCountry: boolean;
} {
  const target = preferredCountry.trim().toUpperCase();
  const verifiedPreferred = ratingsList.find(
    (r) => r.countryCode.toUpperCase() === target && r.verified && r.minimumAge !== null
  );
  if (verifiedPreferred) {
    return { primary: verifiedPreferred, matchedRequestedCountry: true };
  }

  const unverifiedPreferred = ratingsList.find((r) => r.countryCode.toUpperCase() === target);
  if (unverifiedPreferred) {
    return { primary: unverifiedPreferred, matchedRequestedCountry: true };
  }

  const anyVerified = ratingsList.find((r) => r.verified && r.minimumAge !== null);
  if (anyVerified) {
    return { primary: anyVerified, matchedRequestedCountry: false };
  }

  return { primary: ratingsList[0] ?? null, matchedRequestedCountry: false };
}
