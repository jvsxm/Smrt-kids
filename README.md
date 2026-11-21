# Smart Kids — Intelligent Cartoon Recommendation System

Smart Kids is a parent-controlled web platform for discovering age-verified animated movies and TV series tailored to each child's developmental age, preferred genres, audio/subtitle languages, and educational goals.

## Architecture

1. **Frontend (React + TypeScript + Tailwind CSS + React Router)**:
   - Landing page, parent sign-in (Firebase Auth Google Sign-In), parent dashboard, child profile management, preferences editor, catalog discovery, explainable recommendation results (`Approved Matches` vs `Parental Review Queue`), cartoon detail pages, and per-child favorites.
2. **Backend (Node.js + Express + TypeScript + Zod)**:
   - REST API verifying Firebase ID tokens on protected routes, enforcing child ownership (`user_id`), validating payloads with Zod, normalizing regional age ratings (`DE` FSK, `US` MPAA/TV, `GB` BBFC, `FR` CSA), and syncing animated titles from TMDB v3.
3. **Database (PostgreSQL / Cloud SQL + Drizzle ORM)**:
   - 14 relational tables: `users`, `children`, `preferences`, `genres`, `languages`, `preference_genres`, `preference_languages`, `cartoons`, `cartoon_genres`, `cartoon_languages`, `content_ratings`, `favorites`, `ratings`, and `recommendations`.
4. **Hybrid Recommendation Engine (`src/services/recommendationEngine.ts`)**:
   - **Stage 1 (Mandatory Safety Filters)**: Excludes non-animation, adult content, and verified age ratings exceeding the child's dynamically calculated age (or stricter parent cap). Unverified or missing-country ratings are isolated into a dedicated **Parental Review** queue.
   - **Stage 2 (100-Point Transparent Scoring)**:
     - Age Suitability: `40 pts`
     - Favorite Genres: `25 pts`
     - Preferred Languages (Audio vs. Subtitle): `20 pts`
     - Educational Focus: `10 pts`
     - Parent Feedback & Genre Affinity: `5 pts`
   - Optional child gender is strictly excluded from filtering and scoring.

## REST API Endpoints

- `GET /api/health` — Server and TMDB configuration status
- `GET /api/auth/me` — Current authenticated parent record
- `GET /api/children`, `POST /api/children`, `PUT /api/children/:id`, `DELETE /api/children/:id` — Child profile CRUD
- `GET /api/children/:id/preferences`, `PUT /api/children/:id/preferences` — Child preferences CRUD
- `GET /api/genres`, `GET /api/languages` — Catalog metadata
- `GET /api/cartoons`, `GET /api/cartoons/:id`, `GET /api/cartoons/:id/trailer`, `POST /api/cartoons/sync` — Catalog browse, official YouTube trailer lookup, and TMDB sync
- `GET /api/recommendations/:childId`, `POST /api/recommendations/:childId/refresh` — Recommendations & recalculation
- `GET /api/favorites/:childId`, `POST /api/favorites`, `DELETE /api/favorites/:id` — Favorites management
- `GET /api/ratings/:childId`, `POST /api/ratings` — Parent ratings & feedback notes

## Environment & Firebase Setup

1. Copy `.env.example` to `.env` and configure your PostgreSQL (`SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`, `SQL_ADMIN_USER`, `SQL_ADMIN_PASSWORD`) and optional API secrets:
   - `TMDB_API_KEY` (optional, server-side): Live synchronization of animated movies, TV series, and regional certifications from The Movie Database (TMDB v3).
   - `YOUTUBE_API_KEY` (optional, server-side): Official trailer search via YouTube Data API v3.
2. Copy `firebase-applet-config.example.json` to `firebase-applet-config.json` and fill in your Firebase web app configuration. Both `.env*` and `firebase-applet-config.json` are excluded from Git via `.gitignore`.

## Running Unit Tests

```bash
npx tsx --test tests/recommendationEngine.test.ts
```
