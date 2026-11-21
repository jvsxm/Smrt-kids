import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { z } from 'zod';
import { AuthRequest, requireAuth } from './src/middleware/auth.ts';
import {
  addFavoriteForChild,
  createChildProfile,
  deleteChildProfile,
  deleteFavoriteById,
  getCartoonByIdHydrated,
  getChildPreferences,
  getOrFindCartoonTrailer,
  getRecommendationsForChild,
  listCartoonsHydrated,
  listChildrenForUser,
  listFavoritesForChild,
  listGenres,
  listLanguages,
  listRatingsForChild,
  refreshRecommendationsForChild,
  updateChildPreferences,
  updateChildProfile,
  upsertRatingForChild,
} from './src/db/queries.ts';
import { isTmdbConfigured, syncCatalogFromTmdb } from './src/services/tmdb.ts';
import { isYouTubeConfigured } from './src/services/youtube.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const childSchema = z.object({
  nickname: z.string().trim().min(1, 'Nickname is required').max(50),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be YYYY-MM-DD'),
  gender: z
    .enum(['BOY', 'GIRL', 'OTHER'])
    .nullable()
    .optional(),
});

const preferencesSchema = z.object({
  educational: z.boolean(),
  minRating: z.number().int().min(0).max(5),
  maxAgeOverride: z.number().int().min(0).max(18).nullable(),
  strictCountry: z.string().trim().min(2).max(2),
  allowParentalReview: z.boolean(),
  genreIds: z.array(z.number().int()),
  languageCodes: z.array(z.string().trim().min(2).max(5)),
});

const favoriteSchema = z.object({
  childId: z.string().uuid(),
  cartoonId: z.string().uuid(),
});

const ratingSchema = z.object({
  childId: z.string().uuid(),
  cartoonId: z.string().uuid(),
  score: z.number().int().min(1).max(5),
  feedbackNote: z.string().max(500).nullable().optional(),
});

const uuidParamSchema = z.string().uuid();

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      tmdbConfigured: isTmdbConfigured(),
      youtubeConfigured: isYouTubeConfigured(),
    });
  });

  // Auth: Current Parent Account
  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    res.json({
      user: req.dbUser,
    });
  });

  // Children CRUD
  app.get('/api/children', requireAuth, async (req: AuthRequest, res) => {
    try {
      const data = await listChildrenForUser(req.dbUser!.id);
      res.json({ children: data });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load children';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/children', requireAuth, async (req: AuthRequest, res) => {
    const parsed = childSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid child profile input',
      });
    }

    const birthDateObj = new Date(parsed.data.birthDate);
    if (Number.isNaN(birthDateObj.getTime()) || birthDateObj > new Date()) {
      return res.status(400).json({ error: 'Birth date cannot be in the future' });
    }

    try {
      const child = await createChildProfile(req.dbUser!.id, parsed.data);
      res.status(201).json({ child });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create child';
      res.status(500).json({ error: msg });
    }
  });

  app.put('/api/children/:id', requireAuth, async (req: AuthRequest, res) => {
    const idCheck = uuidParamSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({ error: 'Invalid child identifier' });
    }

    const parsed = childSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid child profile input',
      });
    }

    try {
      const updated = await updateChildProfile(
        idCheck.data,
        req.dbUser!.id,
        parsed.data
      );
      if (!updated) {
        return res.status(404).json({ error: 'Child profile not found' });
      }
      res.json({ child: updated });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update child';
      res.status(500).json({ error: msg });
    }
  });

  app.delete('/api/children/:id', requireAuth, async (req: AuthRequest, res) => {
    const idCheck = uuidParamSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({ error: 'Invalid child identifier' });
    }

    try {
      const deleted = await deleteChildProfile(idCheck.data, req.dbUser!.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Child profile not found' });
      }
      res.json({ deletedId: deleted.id });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete child';
      res.status(500).json({ error: msg });
    }
  });

  // Preferences
  app.get(
    '/api/children/:id/preferences',
    requireAuth,
    async (req: AuthRequest, res) => {
      const idCheck = uuidParamSchema.safeParse(req.params.id);
      if (!idCheck.success) {
        return res.status(400).json({ error: 'Invalid child identifier' });
      }

      try {
        const result = await getChildPreferences(idCheck.data, req.dbUser!.id);
        if (!result) {
          return res.status(404).json({ error: 'Child profile not found' });
        }
        res.json(result);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed to load preferences';
        res.status(500).json({ error: msg });
      }
    }
  );

  app.put(
    '/api/children/:id/preferences',
    requireAuth,
    async (req: AuthRequest, res) => {
      const idCheck = uuidParamSchema.safeParse(req.params.id);
      if (!idCheck.success) {
        return res.status(400).json({ error: 'Invalid child identifier' });
      }

      const parsed = preferencesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid preferences payload',
        });
      }

      try {
        const updated = await updateChildPreferences(
          idCheck.data,
          req.dbUser!.id,
          parsed.data
        );
        if (!updated) {
          return res.status(404).json({ error: 'Child profile not found' });
        }
        res.json(updated);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed to save preferences';
        res.status(500).json({ error: msg });
      }
    }
  );

  // Catalog Metadata (Genres, Languages, Cartoons)
  app.get('/api/genres', async (_req, res) => {
    try {
      const data = await listGenres();
      res.json({ genres: data });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load genres';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/languages', async (_req, res) => {
    try {
      const data = await listLanguages();
      res.json({ languages: data });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load languages';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/cartoons', async (req, res) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const mediaType =
        typeof req.query.mediaType === 'string' ? req.query.mediaType : undefined;
      const genreId =
        typeof req.query.genreId === 'string' && req.query.genreId !== ''
          ? Number.parseInt(req.query.genreId, 10)
          : undefined;
      const languageCode =
        typeof req.query.languageCode === 'string'
          ? req.query.languageCode
          : undefined;
      const maxAge =
        typeof req.query.maxAge === 'string' && req.query.maxAge !== ''
          ? Number.parseInt(req.query.maxAge, 10)
          : undefined;
      const verifiedOnly = req.query.verifiedOnly === 'true';

      const data = await listCartoonsHydrated({
        search,
        mediaType,
        genreId,
        languageCode,
        maxAge,
        verifiedOnly,
      });

      res.json({
        cartoons: data,
        tmdbConfigured: isTmdbConfigured(),
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load catalog';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/cartoons/:id', async (req, res) => {
    const idCheck = uuidParamSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({ error: 'Invalid cartoon identifier' });
    }

    try {
      const cartoon = await getCartoonByIdHydrated(idCheck.data);
      if (!cartoon) {
        return res.status(404).json({ error: 'Cartoon not found' });
      }
      res.json({ cartoon });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load cartoon';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/cartoons/:id/trailer', async (req, res) => {
    const idCheck = uuidParamSchema.safeParse(req.params.id);
    if (!idCheck.success) {
      return res.status(400).json({ error: 'Invalid cartoon identifier' });
    }

    try {
      const trailer = await getOrFindCartoonTrailer(idCheck.data);
      if (!trailer) {
        return res.status(404).json({ error: 'Cartoon not found' });
      }
      res.json(trailer);
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Failed to search official trailer';
      res.status(502).json({ error: msg });
    }
  });

  app.post('/api/cartoons/sync', requireAuth, async (req: AuthRequest, res) => {
    if (!isTmdbConfigured()) {
      return res.status(503).json({
        error:
          'TMDB_API_KEY is not configured in server secrets. Configure TMDB_API_KEY in Settings -> Secrets to sync live TMDB movies and TV shows.',
        tmdbConfigured: false,
      });
    }

    try {
      const query =
        typeof req.body?.query === 'string' ? req.body.query.trim() : undefined;
      const result = await syncCatalogFromTmdb({ query });
      res.json({
        ...result,
        tmdbConfigured: true,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'TMDB synchronization failed';
      res.status(502).json({ error: msg });
    }
  });

  // Recommendations
  app.get(
    '/api/recommendations/:childId',
    requireAuth,
    async (req: AuthRequest, res) => {
      const idCheck = uuidParamSchema.safeParse(req.params.childId);
      if (!idCheck.success) {
        return res.status(400).json({ error: 'Invalid child identifier' });
      }

      try {
        const result = await getRecommendationsForChild(
          idCheck.data,
          req.dbUser!.id
        );
        if (!result) {
          return res.status(404).json({ error: 'Child profile not found' });
        }
        res.json(result);
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : 'Failed to load recommendations';
        res.status(500).json({ error: msg });
      }
    }
  );

  app.post(
    '/api/recommendations/:childId/refresh',
    requireAuth,
    async (req: AuthRequest, res) => {
      const idCheck = uuidParamSchema.safeParse(req.params.childId);
      if (!idCheck.success) {
        return res.status(400).json({ error: 'Invalid child identifier' });
      }

      try {
        const result = await refreshRecommendationsForChild(
          idCheck.data,
          req.dbUser!.id
        );
        if (!result) {
          return res.status(404).json({ error: 'Child profile not found' });
        }
        res.json(result);
      } catch (error: unknown) {
        const msg =
          error instanceof Error ? error.message : 'Failed to refresh recommendations';
        res.status(500).json({ error: msg });
      }
    }
  );

  // Favorites
  app.get(
    '/api/favorites/:childId',
    requireAuth,
    async (req: AuthRequest, res) => {
      const idCheck = uuidParamSchema.safeParse(req.params.childId);
      if (!idCheck.success) {
        return res.status(400).json({ error: 'Invalid child identifier' });
      }

      try {
        const items = await listFavoritesForChild(idCheck.data, req.dbUser!.id);
        if (!items) {
          return res.status(404).json({ error: 'Child profile not found' });
        }
        res.json({ favorites: items });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed to load favorites';
        res.status(500).json({ error: msg });
      }
    }
  );

  app.post('/api/favorites', requireAuth, async (req: AuthRequest, res) => {
    const parsed = favoriteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid favorite payload' });
    }

    try {
      const saved = await addFavoriteForChild(
        parsed.data.childId,
        parsed.data.cartoonId,
        req.dbUser!.id
      );
      if (!saved) {
        return res.status(404).json({ error: 'Child profile not found' });
      }
      res.status(201).json({ favorite: saved });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to save favorite';
      res.status(500).json({ error: msg });
    }
  });

  app.delete(
    '/api/favorites/:id',
    requireAuth,
    async (req: AuthRequest, res) => {
      const idCheck = uuidParamSchema.safeParse(req.params.id);
      if (!idCheck.success) {
        return res.status(400).json({ error: 'Invalid favorite identifier' });
      }

      try {
        const deleted = await deleteFavoriteById(idCheck.data, req.dbUser!.id);
        if (!deleted) {
          return res.status(404).json({ error: 'Favorite not found' });
        }
        res.json({ deletedId: deleted.id });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed to remove favorite';
        res.status(500).json({ error: msg });
      }
    }
  );

  // Ratings
  app.get(
    '/api/ratings/:childId',
    requireAuth,
    async (req: AuthRequest, res) => {
      const idCheck = uuidParamSchema.safeParse(req.params.childId);
      if (!idCheck.success) {
        return res.status(400).json({ error: 'Invalid child identifier' });
      }

      try {
        const data = await listRatingsForChild(idCheck.data, req.dbUser!.id);
        if (!data) {
          return res.status(404).json({ error: 'Child profile not found' });
        }
        res.json({ ratings: data });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Failed to load ratings';
        res.status(500).json({ error: msg });
      }
    }
  );

  app.post('/api/ratings', requireAuth, async (req: AuthRequest, res) => {
    const parsed = ratingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid rating payload',
      });
    }

    try {
      const saved = await upsertRatingForChild(req.dbUser!.id, parsed.data);
      if (!saved) {
        return res.status(404).json({ error: 'Child profile not found' });
      }
      res.json({ rating: saved });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to save rating';
      res.status(500).json({ error: msg });
    }
  });

  // Vite Dev Middleware or Static Production Assets
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Kids server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
