import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAgeFromBirthDate,
  normalizeAgeRating,
} from '../src/services/ageClassification.ts';
import {
  EngineCartoonInput,
  EngineChildContext,
  evaluateCartoonForChild,
} from '../src/services/recommendationEngine.ts';
import {
  buildSafeTrailerPayload,
  extractYouTubeVideoId,
} from '../src/services/youtube.ts';

test('normalizes German FSK and US ratings accurately', () => {
  assert.deepEqual(normalizeAgeRating('DE', 'FSK 0'), {
    minimumAge: 0,
    verified: true,
    normalizedLabel: 'FSK 0',
  });
  assert.deepEqual(normalizeAgeRating('DE', '6'), {
    minimumAge: 6,
    verified: true,
    normalizedLabel: 'FSK 6',
  });
  assert.deepEqual(normalizeAgeRating('US', 'TV-Y7'), {
    minimumAge: 7,
    verified: true,
    normalizedLabel: 'TV-Y7',
  });
  assert.equal(normalizeAgeRating('DE', 'Unknown').verified, false);
  assert.equal(normalizeAgeRating('DE', 'Unknown').minimumAge, null);
});

test('computes dynamic child age from birth date', () => {
  const refDate = new Date('2026-11-20T00:00:00Z');
  assert.equal(calculateAgeFromBirthDate('2021-05-10', refDate), 5);
  assert.equal(calculateAgeFromBirthDate('2021-12-10', refDate), 4);
});

test('excludes adult content and non-animated content in Stage 1', () => {
  const child: EngineChildContext = {
    id: 'c1',
    nickname: 'Adam',
    birthDate: '2020-01-01',
    gender: null,
    educational: true,
    minRating: 0,
    maxAgeOverride: null,
    strictCountry: 'DE',
    allowParentalReview: true,
    favoriteGenreIds: [12],
    favoriteGenreNames: ['Adventure'],
    preferredLanguageCodes: ['en'],
    parentRatingsByCartoonId: new Map(),
    likedGenreIds: new Set(),
    dislikedGenreIds: new Set(),
  };

  const adultCartoon: EngineCartoonInput = {
    id: 'k1',
    title: 'Adult Animated',
    isAnimation: true,
    isAdult: true,
    isEducational: false,
    originalLanguage: 'en',
    tmdbRating: 7.0,
    genreIds: [12],
    genreNames: ['Adventure'],
    languages: [{ code: 'en', name: 'English', audioType: 'AUDIO' }],
    contentRatings: [
      { countryCode: 'DE', originalRating: 'FSK 18', minimumAge: 18, source: 'FSK', verified: true },
    ],
  };

  assert.equal(evaluateCartoonForChild(child, adultCartoon), null);
});

test('routes unverified ratings to PARENTAL_REVIEW and scores verified matches out of 100', () => {
  const child: EngineChildContext = {
    id: 'c1',
    nickname: 'Lina',
    birthDate: '2018-01-01', // age 8 in 2026
    gender: 'GIRL',
    educational: true,
    minRating: 0,
    maxAgeOverride: null,
    strictCountry: 'DE',
    allowParentalReview: true,
    favoriteGenreIds: [12, 35],
    favoriteGenreNames: ['Adventure', 'Comedy'],
    preferredLanguageCodes: ['en', 'ar'],
    parentRatingsByCartoonId: new Map([['verified-1', 5]]),
    likedGenreIds: new Set(),
    dislikedGenreIds: new Set(),
  };

  const verifiedMatch: EngineCartoonInput = {
    id: 'verified-1',
    title: 'Bluey',
    isAnimation: true,
    isAdult: false,
    isEducational: true,
    originalLanguage: 'en',
    tmdbRating: 8.6,
    genreIds: [12, 35],
    genreNames: ['Adventure', 'Comedy'],
    languages: [
      { code: 'en', name: 'English', audioType: 'AUDIO' },
      { code: 'ar', name: 'Arabic', audioType: 'AUDIO' },
    ],
    contentRatings: [
      { countryCode: 'DE', originalRating: 'FSK 6', minimumAge: 6, source: 'FSK Official', verified: true },
    ],
  };

  const result = evaluateCartoonForChild(child, verifiedMatch);
  assert.ok(result);
  assert.equal(result.status, 'APPROVED');
  assert.equal(result.score, 100);
  assert.equal(result.scoreBreakdown.age, 40);
  assert.equal(result.scoreBreakdown.genre, 25);
  assert.equal(result.scoreBreakdown.language, 20);
  assert.equal(result.scoreBreakdown.educational, 10);
  assert.equal(result.scoreBreakdown.feedback, 5);

  const unverifiedCartoon: EngineCartoonInput = {
    ...verifiedMatch,
    id: 'unverified-1',
    contentRatings: [
      { countryCode: 'DE', originalRating: 'Pending', minimumAge: null, source: 'Unverified', verified: false },
    ],
  };

  const reviewResult = evaluateCartoonForChild(child, unverifiedCartoon);
  assert.ok(reviewResult);
  assert.equal(reviewResult.status, 'PARENTAL_REVIEW');
});

test('does not vary recommendations by gender', () => {
  const baseChild: EngineChildContext = {
    id: 'c1',
    nickname: 'Sam',
    birthDate: '2020-01-01',
    gender: 'BOY',
    educational: false,
    minRating: 0,
    maxAgeOverride: null,
    strictCountry: 'DE',
    allowParentalReview: true,
    favoriteGenreIds: [14],
    favoriteGenreNames: ['Fantasy'],
    preferredLanguageCodes: ['en'],
    parentRatingsByCartoonId: new Map(),
    likedGenreIds: new Set(),
    dislikedGenreIds: new Set(),
  };

  const cartoon: EngineCartoonInput = {
    id: 'c-fantasy',
    title: 'Magical Tale',
    isAnimation: true,
    isAdult: false,
    isEducational: false,
    originalLanguage: 'en',
    tmdbRating: 8.0,
    genreIds: [14],
    genreNames: ['Fantasy'],
    languages: [{ code: 'en', name: 'English', audioType: 'AUDIO' }],
    contentRatings: [
      { countryCode: 'DE', originalRating: 'FSK 0', minimumAge: 0, source: 'FSK', verified: true },
    ],
  };

  const boyScore = evaluateCartoonForChild(baseChild, cartoon);
  const girlScore = evaluateCartoonForChild({ ...baseChild, gender: 'GIRL' }, cartoon);
  const nullScore = evaluateCartoonForChild({ ...baseChild, gender: null }, cartoon);

  assert.equal(boyScore?.score, girlScore?.score);
  assert.equal(boyScore?.score, nullScore?.score);
});

test('validates YouTube video IDs and rejects unsafe URLs', () => {
  assert.equal(extractYouTubeVideoId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(
    extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );
  assert.equal(
    extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ'),
    'dQw4w9WgXcQ'
  );
  assert.equal(extractYouTubeVideoId('javascript:alert(1)'), null);
  assert.equal(extractYouTubeVideoId('https://evil.example.com/watch?v=dQw4w9WgXcQ'), null);

  const payload = buildSafeTrailerPayload('dQw4w9WgXcQ', 'YOUTUBE_API', 'Trailer');
  assert.equal(
    payload.embedUrl,
    'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0'
  );
});
