export interface ParentUser {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  createdAt: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface ContentRating {
  id: string;
  cartoonId: string;
  countryCode: string;
  originalRating: string;
  minimumAge: number | null;
  source: string;
  verified: boolean;
  verifiedAt: string | null;
}

export interface CartoonLanguage {
  code: string;
  name: string;
  audioType: string;
}

export interface Cartoon {
  id: string;
  tmdbId: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  mediaType: 'MOVIE' | 'TV';
  originalLanguage: string;
  metadataLanguage: string;
  releaseDate: string | null;
  runtimeMinutes: number | null;
  isAdult: boolean;
  isAnimation: boolean;
  isEducational: boolean;
  tmdbRating: number | null;
  trailerUrl: string | null;
  source: string;
  lastSyncedAt: string;
  genres: Genre[];
  languages: CartoonLanguage[];
  contentRatings: ContentRating[];
}

export interface ChildPreferences {
  id: string;
  childId: string;
  educational: boolean;
  minRating: number;
  maxAgeOverride: number | null;
  strictCountry: string;
  allowParentalReview: boolean;
  updatedAt: string;
  genreIds: number[];
  genreNames: string[];
  languageCodes: string[];
  languageNames: string[];
}

export interface ChildProfile {
  id: string;
  userId: number;
  nickname: string;
  birthDate: string;
  gender: 'BOY' | 'GIRL' | 'OTHER' | null;
  age: number;
  createdAt: string;
  updatedAt: string;
  preferences?: ChildPreferences | null;
}

export interface ScoreBreakdown {
  age: number;
  genre: number;
  language: number;
  educational: number;
  feedback: number;
}

export interface RecommendationItem {
  id: string;
  cartoonId: string;
  score: number;
  status: 'APPROVED' | 'PARENTAL_REVIEW';
  reasons: string[];
  scoreBreakdown: ScoreBreakdown;
  matchedCountry: string | null;
  matchedRating: string | null;
  matchedSource: string | null;
  favoriteId: string | null;
  parentRating: {
    score: number;
    feedbackNote: string | null;
  } | null;
  cartoon: Cartoon;
}

export interface FavoriteItem {
  id: string;
  childId: string;
  cartoonId: string;
  createdAt: string;
  cartoon: Cartoon;
  parentRating: {
    id: string;
    score: number;
    feedbackNote: string | null;
  } | null;
}
