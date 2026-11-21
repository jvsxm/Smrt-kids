import {
  calculateAgeFromBirthDate,
  selectClassificationForCountry,
  StoredContentRating,
} from './ageClassification.ts';

export interface ScoreBreakdown {
  age: number; // max 40
  genre: number; // max 25
  language: number; // max 20
  educational: number; // max 10
  feedback: number; // max 5
}

export interface EngineChildContext {
  id: string;
  nickname: string;
  birthDate: string;
  gender: string | null; // Strictly ignored in filtering and scoring
  educational: boolean;
  minRating: number;
  maxAgeOverride: number | null;
  strictCountry: string;
  allowParentalReview: boolean;
  favoriteGenreIds: number[];
  favoriteGenreNames: string[];
  preferredLanguageCodes: string[];
  parentRatingsByCartoonId: Map<string, number>;
  likedGenreIds: Set<number>;
  dislikedGenreIds: Set<number>;
}

export interface EngineCartoonInput {
  id: string;
  title: string;
  isAnimation: boolean;
  isAdult: boolean;
  isEducational: boolean;
  originalLanguage: string;
  tmdbRating: number | null;
  genreIds: number[];
  genreNames: string[];
  languages: Array<{ code: string; name: string; audioType: string }>;
  contentRatings: StoredContentRating[];
}

export interface EngineRecommendationOutput {
  cartoonId: string;
  score: number;
  status: 'APPROVED' | 'PARENTAL_REVIEW';
  reasons: string[];
  scoreBreakdown: ScoreBreakdown;
  matchedCountry: string | null;
  matchedRating: string | null;
  matchedSource: string | null;
}

export function evaluateCartoonForChild(
  child: EngineChildContext,
  cartoon: EngineCartoonInput
): EngineRecommendationOutput | null {
  // Stage 1: Mandatory Hard Safety Filters
  if (!cartoon.isAnimation) {
    return null;
  }
  if (cartoon.isAdult) {
    return null;
  }

  const childAge = calculateAgeFromBirthDate(child.birthDate);
  const effectiveMaxAge =
    child.maxAgeOverride !== null && child.maxAgeOverride !== undefined
      ? Math.min(childAge, child.maxAgeOverride)
      : childAge;

  const { primary: rating, matchedRequestedCountry } = selectClassificationForCountry(
    cartoon.contentRatings,
    child.strictCountry
  );

  // Determine verification & age eligibility
  const isVerifiedRating =
    rating !== null && rating.verified && rating.minimumAge !== null;

  if (isVerifiedRating && rating.minimumAge !== null && rating.minimumAge > effectiveMaxAge) {
    // Strictly exclude content exceeding child's age or parent cap
    return null;
  }

  const requiresParentalReview =
    !isVerifiedRating || !matchedRequestedCountry;

  if (requiresParentalReview && !child.allowParentalReview) {
    return null;
  }

  // Stage 2: Transparent 100-Point Scoring
  const reasons: string[] = [];

  // 1. Age Suitability (40 points)
  let ageScore = 0;
  if (isVerifiedRating && rating.minimumAge !== null) {
    const gap = effectiveMaxAge - rating.minimumAge;
    if (gap <= 3) {
      ageScore = 40;
    } else if (gap <= 6) {
      ageScore = 36;
    } else {
      ageScore = 32;
    }

    if (matchedRequestedCountry) {
      reasons.push(
        `Verified ${rating.countryCode} ${rating.originalRating} classification (safe for age ${childAge})`
      );
    } else {
      reasons.push(
        `Verified ${rating.countryCode} ${rating.originalRating} classification (${child.strictCountry} rating pending review)`
      );
    }
  } else {
    ageScore = 0;
    reasons.push(
      `Age classification unverified in ${child.strictCountry} — placed in Parental Review`
    );
  }

  // 2. Genre Matching (25 points)
  let genreScore = 0;
  const matchedGenres = cartoon.genreNames.filter((_, idx) =>
    child.favoriteGenreIds.includes(cartoon.genreIds[idx])
  );

  if (child.favoriteGenreIds.length === 0) {
    genreScore = 15;
  } else if (matchedGenres.length > 0) {
    const ratio = Math.min(1, matchedGenres.length / Math.min(2, child.favoriteGenreIds.length));
    genreScore = Math.round(ratio * 25);
    reasons.push(`Matches favorite genres: ${matchedGenres.join(', ')}`);
  }

  // 3. Language Matching (20 points)
  let languageScore = 0;
  const preferredSet = new Set(child.preferredLanguageCodes.map((c) => c.toLowerCase()));

  if (preferredSet.size === 0) {
    languageScore = 12;
  } else {
    const audioMatches = cartoon.languages.filter(
      (l) => l.audioType === 'AUDIO' && preferredSet.has(l.code.toLowerCase())
    );
    const subtitleMatches = cartoon.languages.filter(
      (l) => l.audioType === 'SUBTITLE' && preferredSet.has(l.code.toLowerCase())
    );
    const origMatch = preferredSet.has(cartoon.originalLanguage.toLowerCase());

    if (audioMatches.length > 0 || origMatch) {
      languageScore = 20;
      const names = Array.from(
        new Set([
          ...audioMatches.map((l) => l.name),
          ...(origMatch ? [cartoon.originalLanguage.toUpperCase()] : []),
        ])
      );
      reasons.push(`Preferred audio language available (${names.join(', ')})`);
    } else if (subtitleMatches.length > 0) {
      languageScore = 12;
      reasons.push(
        `Preferred subtitle language available (${subtitleMatches.map((l) => l.name).join(', ')})`
      );
    }
  }

  // 4. Educational Preference (10 points)
  let educationalScore = 0;
  if (child.educational) {
    if (cartoon.isEducational) {
      educationalScore = 10;
      reasons.push('Aligned with educational learning preference');
    } else {
      educationalScore = 0;
    }
  } else {
    educationalScore = cartoon.isEducational ? 10 : 8;
    if (cartoon.isEducational) {
      reasons.push('Includes educational storytelling themes');
    }
  }

  // 5. Parent Feedback (5 points)
  let feedbackScore = 3; // Neutral baseline
  const directRating = child.parentRatingsByCartoonId.get(cartoon.id);
  if (directRating !== undefined) {
    feedbackScore = Math.max(0, Math.min(5, directRating));
    if (directRating >= 4) {
      reasons.push(`Highly rated by parent (${directRating}/5 stars)`);
    } else if (directRating <= 2) {
      reasons.push(`Previously rated ${directRating}/5 stars by parent`);
    }
  } else {
    const hasLikedGenre = cartoon.genreIds.some((id) => child.likedGenreIds.has(id));
    const hasDislikedGenre = cartoon.genreIds.some((id) => child.dislikedGenreIds.has(id));
    if (hasLikedGenre && !hasDislikedGenre) {
      feedbackScore = 5;
      reasons.push('Matches genres from your top-rated cartoons');
    } else if (hasDislikedGenre && !hasLikedGenre) {
      feedbackScore = 1;
    }
  }

  // Apply parent minRating filter for APPROVED results if configured
  if (child.minRating > 0 && directRating !== undefined && directRating < child.minRating) {
    return null;
  }

  const totalScore = Math.round(
    ageScore + genreScore + languageScore + educationalScore + feedbackScore
  );

  return {
    cartoonId: cartoon.id,
    score: totalScore,
    status: requiresParentalReview ? 'PARENTAL_REVIEW' : 'APPROVED',
    reasons,
    scoreBreakdown: {
      age: ageScore,
      genre: genreScore,
      language: languageScore,
      educational: educationalScore,
      feedback: feedbackScore,
    },
    matchedCountry: rating?.countryCode ?? null,
    matchedRating: rating?.originalRating ?? null,
    matchedSource: rating?.source ?? null,
  };
}
