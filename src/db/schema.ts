import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

// 1. Users (Parents) - linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Children - indirect beneficiaries managed by parents
export const children = pgTable(
  'children',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    nickname: text('nickname').notNull(),
    birthDate: text('birth_date').notNull(), // ISO YYYY-MM-DD; age computed dynamically
    gender: text('gender'), // Optional: 'BOY' | 'GIRL' | 'OTHER' | null; never used to exclude recommendations
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('children_user_id_idx').on(table.userId)]
);

// 3. Preferences - 1:1 per child
export const preferences = pgTable('preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  childId: uuid('child_id')
    .references(() => children.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  educational: boolean('educational').default(false).notNull(),
  minRating: integer('min_rating').default(0).notNull(), // Minimum parent/TMDB threshold (0..5)
  maxAgeOverride: integer('max_age_override'), // Optional stricter parent cap (e.g. 6 even if child is 8)
  strictCountry: text('strict_country').default('DE').notNull(), // Default German FSK
  allowParentalReview: boolean('allow_parental_review').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Genres
export const genres = pgTable('genres', {
  id: integer('id').primaryKey(), // TMDB genre IDs or curated IDs
  name: text('name').notNull().unique(),
});

// 5. Languages (ISO 639-1)
export const languages = pgTable('languages', {
  code: text('code').primaryKey(),
  name: text('name').notNull(),
});

// 6. PreferenceGenres (M:N child preferences -> genres)
export const preferenceGenres = pgTable(
  'preference_genres',
  {
    childId: uuid('child_id')
      .references(() => children.id, { onDelete: 'cascade' })
      .notNull(),
    genreId: integer('genre_id')
      .references(() => genres.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.childId, table.genreId] })]
);

// 7. PreferenceLanguages (M:N child preferences -> languages)
export const preferenceLanguages = pgTable(
  'preference_languages',
  {
    childId: uuid('child_id')
      .references(() => children.id, { onDelete: 'cascade' })
      .notNull(),
    languageCode: text('language_code')
      .references(() => languages.code, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.childId, table.languageCode] })]
);

// 8. Cartoons (Animated Movies and TV Series)
export const cartoons = pgTable(
  'cartoons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tmdbId: integer('tmdb_id').notNull(),
    title: text('title').notNull(),
    overview: text('overview').notNull(),
    posterPath: text('poster_path'),
    backdropPath: text('backdrop_path'),
    mediaType: text('media_type').notNull(), // 'MOVIE' | 'TV'
    originalLanguage: text('original_language').notNull(),
    metadataLanguage: text('metadata_language').default('en').notNull(),
    releaseDate: text('release_date'),
    runtimeMinutes: integer('runtime_minutes'),
    isAdult: boolean('is_adult').default(false).notNull(),
    isAnimation: boolean('is_animation').default(true).notNull(),
    isEducational: boolean('is_educational').default(false).notNull(),
    tmdbRating: doublePrecision('tmdb_rating'),
    trailerUrl: text('trailer_url'),
    source: text('source').default('CURATED').notNull(), // 'TMDB' | 'CURATED'
    lastSyncedAt: timestamp('last_synced_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('cartoons_tmdb_media_unique').on(table.tmdbId, table.mediaType),
    index('cartoons_media_type_idx').on(table.mediaType),
  ]
);

// 9. CartoonGenres (M:N)
export const cartoonGenres = pgTable(
  'cartoon_genres',
  {
    cartoonId: uuid('cartoon_id')
      .references(() => cartoons.id, { onDelete: 'cascade' })
      .notNull(),
    genreId: integer('genre_id')
      .references(() => genres.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.cartoonId, table.genreId] })]
);

// 10. CartoonLanguages (M:N with audio/subtitle type)
export const cartoonLanguages = pgTable(
  'cartoon_languages',
  {
    cartoonId: uuid('cartoon_id')
      .references(() => cartoons.id, { onDelete: 'cascade' })
      .notNull(),
    languageCode: text('language_code')
      .references(() => languages.code, { onDelete: 'cascade' })
      .notNull(),
    audioType: text('audio_type').notNull(), // 'AUDIO' | 'SUBTITLE'
  },
  (table) => [primaryKey({ columns: [table.cartoonId, table.languageCode, table.audioType] })]
);

// 11. ContentRatings (Country-specific certifications such as DE FSK, US MPAA/TV, FR CSA)
export const contentRatings = pgTable(
  'content_ratings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cartoonId: uuid('cartoon_id')
      .references(() => cartoons.id, { onDelete: 'cascade' })
      .notNull(),
    countryCode: text('country_code').notNull(), // e.g., 'DE', 'US', 'FR', 'GB'
    originalRating: text('original_rating').notNull(), // e.g., 'FSK 0', 'FSK 6', 'TV-Y', 'PG'
    minimumAge: integer('minimum_age'), // Normalized minimum age; null if unknown/unverified
    source: text('source').notNull(), // e.g., 'FSK / TMDB', 'MPAA / TMDB', 'Official Registry'
    verified: boolean('verified').default(false).notNull(),
    verifiedAt: timestamp('verified_at'),
  },
  (table) => [
    uniqueIndex('content_ratings_unique').on(table.cartoonId, table.countryCode, table.source),
    index('content_ratings_cartoon_idx').on(table.cartoonId),
  ]
);

// 12. Favorites (unique per child + cartoon)
export const favorites = pgTable(
  'favorites',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    childId: uuid('child_id')
      .references(() => children.id, { onDelete: 'cascade' })
      .notNull(),
    cartoonId: uuid('cartoon_id')
      .references(() => cartoons.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('favorites_child_cartoon_unique').on(table.childId, table.cartoonId)]
);

// 13. Ratings (Parent feedback 1..5 per child + cartoon)
export const ratings = pgTable(
  'ratings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    childId: uuid('child_id')
      .references(() => children.id, { onDelete: 'cascade' })
      .notNull(),
    cartoonId: uuid('cartoon_id')
      .references(() => cartoons.id, { onDelete: 'cascade' })
      .notNull(),
    score: integer('score').notNull(), // 1..5
    feedbackNote: text('feedback_note'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('ratings_child_cartoon_unique').on(table.childId, table.cartoonId)]
);

// 14. Recommendations (Persisted engine results with explainable reasons & breakdown)
export const recommendations = pgTable(
  'recommendations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    childId: uuid('child_id')
      .references(() => children.id, { onDelete: 'cascade' })
      .notNull(),
    cartoonId: uuid('cartoon_id')
      .references(() => cartoons.id, { onDelete: 'cascade' })
      .notNull(),
    score: doublePrecision('score').notNull(), // 0..100
    status: text('status').notNull(), // 'APPROVED' | 'PARENTAL_REVIEW'
    reasons: text('reasons').notNull(), // JSON string[]
    scoreBreakdown: text('score_breakdown').notNull(), // JSON { age, genre, language, educational, feedback }
    matchedCountry: text('matched_country'),
    matchedRating: text('matched_rating'),
    matchedSource: text('matched_source'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('recommendations_child_cartoon_unique').on(table.childId, table.cartoonId),
    index('recommendations_child_score_idx').on(table.childId, table.score),
  ]
);

// Drizzle Relations
export const usersRelations = relations(users, ({ many }) => ({
  children: many(children),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  parent: one(users, {
    fields: [children.userId],
    references: [users.id],
  }),
  preference: one(preferences, {
    fields: [children.id],
    references: [preferences.childId],
  }),
  favoriteGenres: many(preferenceGenres),
  favoriteLanguages: many(preferenceLanguages),
  favorites: many(favorites),
  ratings: many(ratings),
  recommendations: many(recommendations),
}));

export const preferencesRelations = relations(preferences, ({ one }) => ({
  child: one(children, {
    fields: [preferences.childId],
    references: [children.id],
  }),
}));

export const cartoonsRelations = relations(cartoons, ({ many }) => ({
  genres: many(cartoonGenres),
  languages: many(cartoonLanguages),
  contentRatings: many(contentRatings),
  favorites: many(favorites),
  ratings: many(ratings),
  recommendations: many(recommendations),
}));
