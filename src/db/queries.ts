import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from './index.ts';
import {
  cartoonGenres,
  cartoonLanguages,
  cartoons,
  children,
  contentRatings,
  favorites,
  genres,
  languages,
  preferenceGenres,
  preferenceLanguages,
  preferences,
  ratings,
  recommendations,
  users,
} from './schema.ts';
import { calculateAgeFromBirthDate } from '../services/ageClassification.ts';
import {
  EngineCartoonInput,
  EngineChildContext,
  evaluateCartoonForChild,
} from '../services/recommendationEngine.ts';
import { ensureCatalogSeeded } from '../services/seedCatalog.ts';
import {
  buildSafeTrailerPayload,
  extractYouTubeVideoId,
  searchOfficialCartoonTrailer,
  TrailerResult,
} from '../services/youtube.ts';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName: string | null
) {
  try {
    const result = await db
      .insert(users)
      .values({ uid, email, displayName })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email, displayName },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to upsert user:', error);
    throw new Error('Failed to synchronize parent account.', { cause: error });
  }
}

export async function listChildrenForUser(userId: number) {
  try {
    await ensureCatalogSeeded();
    const rows = await db
      .select()
      .from(children)
      .where(eq(children.userId, userId))
      .orderBy(children.createdAt);

    const childIds = rows.map((c) => c.id);
    if (childIds.length === 0) return [];

    const [prefsRows, prefGenreRows, prefLangRows, allGenres, allLanguages] =
      await Promise.all([
        db.select().from(preferences).where(inArray(preferences.childId, childIds)),
        db
          .select()
          .from(preferenceGenres)
          .where(inArray(preferenceGenres.childId, childIds)),
        db
          .select()
          .from(preferenceLanguages)
          .where(inArray(preferenceLanguages.childId, childIds)),
        db.select().from(genres),
        db.select().from(languages),
      ]);

    const genreMap = new Map(allGenres.map((g) => [g.id, g.name]));
    const langMap = new Map(allLanguages.map((l) => [l.code, l.name]));

    return rows.map((child) => {
      const pref = prefsRows.find((p) => p.childId === child.id);
      const gIds = prefGenreRows
        .filter((pg) => pg.childId === child.id)
        .map((pg) => pg.genreId);
      const lCodes = prefLangRows
        .filter((pl) => pl.childId === child.id)
        .map((pl) => pl.languageCode);

      return {
        ...child,
        age: calculateAgeFromBirthDate(child.birthDate),
        preferences: pref
          ? {
              ...pref,
              genreIds: gIds,
              genreNames: gIds.map((id) => genreMap.get(id) || `Genre ${id}`),
              languageCodes: lCodes,
              languageNames: lCodes.map((code) => langMap.get(code) || code.toUpperCase()),
            }
          : null,
      };
    });
  } catch (error) {
    console.error('Failed to list children:', error);
    throw new Error('Failed to load child profiles.', { cause: error });
  }
}

export async function getOwnedChild(childId: string, userId: number) {
  try {
    const rows = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.userId, userId)));
    return rows[0] ?? null;
  } catch (error) {
    console.error('Failed to verify child ownership:', error);
    throw new Error('Failed to retrieve child profile.', { cause: error });
  }
}

export async function createChildProfile(
  userId: number,
  input: {
    nickname: string;
    birthDate: string;
    gender?: string | null;
  }
) {
  try {
    await ensureCatalogSeeded();
    const inserted = await db
      .insert(children)
      .values({
        userId,
        nickname: input.nickname.trim(),
        birthDate: input.birthDate,
        gender: input.gender || null,
      })
      .returning();

    const child = inserted[0];
    // Create default preferences record
    await db
      .insert(preferences)
      .values({
        childId: child.id,
        educational: false,
        minRating: 0,
        strictCountry: 'DE',
        allowParentalReview: true,
      })
      .onConflictDoNothing();

    // Default English language preference
    await db
      .insert(preferenceLanguages)
      .values({ childId: child.id, languageCode: 'en' })
      .onConflictDoNothing();

    return {
      ...child,
      age: calculateAgeFromBirthDate(child.birthDate),
    };
  } catch (error) {
    console.error('Failed to create child profile:', error);
    throw new Error('Failed to create child profile.', { cause: error });
  }
}

export async function updateChildProfile(
  childId: string,
  userId: number,
  input: {
    nickname: string;
    birthDate: string;
    gender?: string | null;
  }
) {
  try {
    const updated = await db
      .update(children)
      .set({
        nickname: input.nickname.trim(),
        birthDate: input.birthDate,
        gender: input.gender || null,
        updatedAt: new Date(),
      })
      .where(and(eq(children.id, childId), eq(children.userId, userId)))
      .returning();

    if (!updated[0]) return null;
    return {
      ...updated[0],
      age: calculateAgeFromBirthDate(updated[0].birthDate),
    };
  } catch (error) {
    console.error('Failed to update child profile:', error);
    throw new Error('Failed to update child profile.', { cause: error });
  }
}

export async function deleteChildProfile(childId: string, userId: number) {
  try {
    const deleted = await db
      .delete(children)
      .where(and(eq(children.id, childId), eq(children.userId, userId)))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    console.error('Failed to delete child profile:', error);
    throw new Error('Failed to delete child profile.', { cause: error });
  }
}

export async function getChildPreferences(childId: string, userId: number) {
  try {
    await ensureCatalogSeeded();
    const owned = await getOwnedChild(childId, userId);
    if (!owned) return null;

    const [prefRows, pgRows, plRows, allGenres, allLangs] = await Promise.all([
      db.select().from(preferences).where(eq(preferences.childId, childId)),
      db.select().from(preferenceGenres).where(eq(preferenceGenres.childId, childId)),
      db.select().from(preferenceLanguages).where(eq(preferenceLanguages.childId, childId)),
      db.select().from(genres),
      db.select().from(languages),
    ]);

    let pref = prefRows[0];
    if (!pref) {
      const inserted = await db
        .insert(preferences)
        .values({
          childId,
          educational: false,
          minRating: 0,
          strictCountry: 'DE',
          allowParentalReview: true,
        })
        .returning();
      pref = inserted[0];
    }

    const genreMap = new Map(allGenres.map((g) => [g.id, g.name]));
    const langMap = new Map(allLangs.map((l) => [l.code, l.name]));

    const genreIds = pgRows.map((r) => r.genreId);
    const languageCodes = plRows.map((r) => r.languageCode);

    return {
      child: {
        ...owned,
        age: calculateAgeFromBirthDate(owned.birthDate),
      },
      preferences: {
        ...pref,
        genreIds,
        genreNames: genreIds.map((id) => genreMap.get(id) || `Genre ${id}`),
        languageCodes,
        languageNames: languageCodes.map((c) => langMap.get(c) || c.toUpperCase()),
      },
    };
  } catch (error) {
    console.error('Failed to fetch child preferences:', error);
    throw new Error('Failed to load child preferences.', { cause: error });
  }
}

export async function updateChildPreferences(
  childId: string,
  userId: number,
  input: {
    educational: boolean;
    minRating: number;
    maxAgeOverride: number | null;
    strictCountry: string;
    allowParentalReview: boolean;
    genreIds: number[];
    languageCodes: string[];
  }
) {
  try {
    const owned = await getOwnedChild(childId, userId);
    if (!owned) return null;

    await db
      .insert(preferences)
      .values({
        childId,
        educational: input.educational,
        minRating: input.minRating,
        maxAgeOverride: input.maxAgeOverride,
        strictCountry: input.strictCountry.toUpperCase(),
        allowParentalReview: input.allowParentalReview,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: preferences.childId,
        set: {
          educational: input.educational,
          minRating: input.minRating,
          maxAgeOverride: input.maxAgeOverride,
          strictCountry: input.strictCountry.toUpperCase(),
          allowParentalReview: input.allowParentalReview,
          updatedAt: new Date(),
        },
      });

    await db.delete(preferenceGenres).where(eq(preferenceGenres.childId, childId));
    if (input.genreIds.length > 0) {
      const uniqueGenreIds = Array.from(new Set(input.genreIds));
      await db.insert(preferenceGenres).values(
        uniqueGenreIds.map((genreId) => ({ childId, genreId }))
      );
    }

    await db.delete(preferenceLanguages).where(eq(preferenceLanguages.childId, childId));
    if (input.languageCodes.length > 0) {
      const uniqueLangs = Array.from(
        new Set(input.languageCodes.map((c) => c.toLowerCase()))
      );
      await db.insert(preferenceLanguages).values(
        uniqueLangs.map((languageCode) => ({ childId, languageCode }))
      );
    }

    // Automatically refresh recommendations when preferences change
    await refreshRecommendationsForChild(childId, userId);

    return await getChildPreferences(childId, userId);
  } catch (error) {
    console.error('Failed to update child preferences:', error);
    throw new Error('Failed to save preferences.', { cause: error });
  }
}

export async function listGenres() {
  try {
    await ensureCatalogSeeded();
    return await db.select().from(genres).orderBy(genres.name);
  } catch (error) {
    console.error('Failed to fetch genres:', error);
    throw new Error('Failed to load genres.', { cause: error });
  }
}

export async function listLanguages() {
  try {
    await ensureCatalogSeeded();
    return await db.select().from(languages).orderBy(languages.name);
  } catch (error) {
    console.error('Failed to fetch languages:', error);
    throw new Error('Failed to load languages.', { cause: error });
  }
}

export async function listCartoonsHydrated(filters?: {
  search?: string;
  mediaType?: string;
  genreId?: number;
  languageCode?: string;
  maxAge?: number;
  verifiedOnly?: boolean;
}) {
  try {
    await ensureCatalogSeeded();
    const [allCartoons, allCG, allCL, allCR, allGenres, allLangs] =
      await Promise.all([
        db.select().from(cartoons).orderBy(desc(cartoons.tmdbRating)),
        db.select().from(cartoonGenres),
        db.select().from(cartoonLanguages),
        db.select().from(contentRatings),
        db.select().from(genres),
        db.select().from(languages),
      ]);

    const genreMap = new Map(allGenres.map((g) => [g.id, g.name]));
    const langMap = new Map(allLangs.map((l) => [l.code, l.name]));

    let hydrated = allCartoons.map((c) => {
      const cGenres = allCG
        .filter((cg) => cg.cartoonId === c.id)
        .map((cg) => ({
          id: cg.genreId,
          name: genreMap.get(cg.genreId) || `Genre ${cg.genreId}`,
        }));

      const cLangs = allCL
        .filter((cl) => cl.cartoonId === c.id)
        .map((cl) => ({
          code: cl.languageCode,
          name: langMap.get(cl.languageCode) || cl.languageCode.toUpperCase(),
          audioType: cl.audioType,
        }));

      const cRatings = allCR.filter((cr) => cr.cartoonId === c.id);

      return {
        ...c,
        genres: cGenres,
        languages: cLangs,
        contentRatings: cRatings,
      };
    });

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase();
      hydrated = hydrated.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.overview.toLowerCase().includes(q)
      );
    }

    if (filters?.mediaType && (filters.mediaType === 'MOVIE' || filters.mediaType === 'TV')) {
      hydrated = hydrated.filter((c) => c.mediaType === filters.mediaType);
    }

    if (filters?.genreId !== undefined && !Number.isNaN(filters.genreId)) {
      hydrated = hydrated.filter((c) =>
        c.genres.some((g) => g.id === filters.genreId)
      );
    }

    if (filters?.languageCode && filters.languageCode.trim().length > 0) {
      const code = filters.languageCode.trim().toLowerCase();
      hydrated = hydrated.filter(
        (c) =>
          c.originalLanguage.toLowerCase() === code ||
          c.languages.some((l) => l.code.toLowerCase() === code)
      );
    }

    if (filters?.verifiedOnly) {
      hydrated = hydrated.filter((c) =>
        c.contentRatings.some((r) => r.verified && r.minimumAge !== null)
      );
    }

    if (filters?.maxAge !== undefined && !Number.isNaN(filters.maxAge)) {
      hydrated = hydrated.filter((c) =>
        c.contentRatings.some(
          (r) =>
            r.verified &&
            r.minimumAge !== null &&
            r.minimumAge <= (filters.maxAge ?? 18)
        )
      );
    }

    return hydrated;
  } catch (error) {
    console.error('Failed to fetch cartoons:', error);
    throw new Error('Failed to load cartoon catalog.', { cause: error });
  }
}

export async function getCartoonByIdHydrated(cartoonId: string) {
  try {
    await ensureCatalogSeeded();
    const rows = await db
      .select()
      .from(cartoons)
      .where(eq(cartoons.id, cartoonId));
    const c = rows[0];
    if (!c) return null;

    const [cGenres, cLangs, cRatings, allGenres, allLangs] = await Promise.all([
      db.select().from(cartoonGenres).where(eq(cartoonGenres.cartoonId, c.id)),
      db
        .select()
        .from(cartoonLanguages)
        .where(eq(cartoonLanguages.cartoonId, c.id)),
      db.select().from(contentRatings).where(eq(contentRatings.cartoonId, c.id)),
      db.select().from(genres),
      db.select().from(languages),
    ]);

    const genreMap = new Map(allGenres.map((g) => [g.id, g.name]));
    const langMap = new Map(allLangs.map((l) => [l.code, l.name]));

    return {
      ...c,
      genres: cGenres.map((cg) => ({
        id: cg.genreId,
        name: genreMap.get(cg.genreId) || `Genre ${cg.genreId}`,
      })),
      languages: cLangs.map((cl) => ({
        code: cl.languageCode,
        name: langMap.get(cl.languageCode) || cl.languageCode.toUpperCase(),
        audioType: cl.audioType,
      })),
      contentRatings: cRatings,
    };
  } catch (error) {
    console.error('Failed to fetch cartoon details:', error);
    throw new Error('Failed to load cartoon details.', { cause: error });
  }
}

export interface ChildRecommendationsResult {
  child: typeof children.$inferSelect & { age: number };
  preferences: NonNullable<Awaited<ReturnType<typeof getChildPreferences>>>['preferences'] | null;
  recommendations: Array<{
    id: string;
    cartoonId: string;
    score: number;
    status: 'APPROVED' | 'PARENTAL_REVIEW';
    reasons: string[];
    scoreBreakdown: {
      age: number;
      genre: number;
      language: number;
      educational: number;
      feedback: number;
    };
    matchedCountry: string | null;
    matchedRating: string | null;
    matchedSource: string | null;
    favoriteId: string | null;
    parentRating: {
      score: number;
      feedbackNote: string | null;
    } | null;
    cartoon: Awaited<ReturnType<typeof listCartoonsHydrated>>[number];
  }>;
}

export async function refreshRecommendationsForChild(
  childId: string,
  userId: number
): Promise<ChildRecommendationsResult | null> {
  try {
    await ensureCatalogSeeded();
    const owned = await getOwnedChild(childId, userId);
    if (!owned) return null;

    const [
      prefData,
      hydratedCartoons,
      childRatings,
    ] = await Promise.all([
      getChildPreferences(childId, userId),
      listCartoonsHydrated(),
      db.select().from(ratings).where(eq(ratings.childId, childId)),
    ]);

    if (!prefData) return null;

    const parentRatingsByCartoonId = new Map<string, number>();
    const likedGenreIds = new Set<number>();
    const dislikedGenreIds = new Set<number>();

    const cartoonGenreLookup = new Map(
      hydratedCartoons.map((c) => [c.id, c.genres.map((g) => g.id)])
    );

    for (const r of childRatings) {
      parentRatingsByCartoonId.set(r.cartoonId, r.score);
      const gIds = cartoonGenreLookup.get(r.cartoonId) || [];
      if (r.score >= 4) {
        gIds.forEach((id) => likedGenreIds.add(id));
      } else if (r.score <= 2) {
        gIds.forEach((id) => dislikedGenreIds.add(id));
      }
    }

    const childCtx: EngineChildContext = {
      id: owned.id,
      nickname: owned.nickname,
      birthDate: owned.birthDate,
      gender: owned.gender,
      educational: prefData.preferences.educational,
      minRating: prefData.preferences.minRating,
      maxAgeOverride: prefData.preferences.maxAgeOverride,
      strictCountry: prefData.preferences.strictCountry,
      allowParentalReview: prefData.preferences.allowParentalReview,
      favoriteGenreIds: prefData.preferences.genreIds,
      favoriteGenreNames: prefData.preferences.genreNames,
      preferredLanguageCodes: prefData.preferences.languageCodes,
      parentRatingsByCartoonId,
      likedGenreIds,
      dislikedGenreIds,
    };

    const evaluated = hydratedCartoons
      .map((c) => {
        const input: EngineCartoonInput = {
          id: c.id,
          title: c.title,
          isAnimation: c.isAnimation,
          isAdult: c.isAdult,
          isEducational: c.isEducational,
          originalLanguage: c.originalLanguage,
          tmdbRating: c.tmdbRating,
          genreIds: c.genres.map((g) => g.id),
          genreNames: c.genres.map((g) => g.name),
          languages: c.languages,
          contentRatings: c.contentRatings,
        };
        return evaluateCartoonForChild(childCtx, input);
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.score - a.score);

    // Replace persisted recommendations for this child
    await db
      .delete(recommendations)
      .where(eq(recommendations.childId, childId));

    if (evaluated.length > 0) {
      await db.insert(recommendations).values(
        evaluated.map((rec) => ({
          childId,
          cartoonId: rec.cartoonId,
          score: rec.score,
          status: rec.status,
          reasons: JSON.stringify(rec.reasons),
          scoreBreakdown: JSON.stringify(rec.scoreBreakdown),
          matchedCountry: rec.matchedCountry,
          matchedRating: rec.matchedRating,
          matchedSource: rec.matchedSource,
        }))
      );
    }

    return await getRecommendationsForChild(childId, userId, true);
  } catch (error) {
    console.error('Failed to refresh recommendations:', error);
    throw new Error('Failed to generate recommendations.', { cause: error });
  }
}

export async function getRecommendationsForChild(
  childId: string,
  userId: number,
  skipAutoRefresh = false
): Promise<ChildRecommendationsResult | null> {
  try {
    const owned = await getOwnedChild(childId, userId);
    if (!owned) return null;

    let rows = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.childId, childId))
      .orderBy(desc(recommendations.score));

    if (rows.length === 0 && !skipAutoRefresh) {
      return await refreshRecommendationsForChild(childId, userId);
    }

    const [hydratedCartoons, childFavorites, childRatings, prefData] =
      await Promise.all([
        listCartoonsHydrated(),
        db.select().from(favorites).where(eq(favorites.childId, childId)),
        db.select().from(ratings).where(eq(ratings.childId, childId)),
        getChildPreferences(childId, userId),
      ]);

    const cartoonMap = new Map(hydratedCartoons.map((c) => [c.id, c]));
    const favMap = new Map(childFavorites.map((f) => [f.cartoonId, f.id]));
    const ratingMap = new Map(childRatings.map((r) => [r.cartoonId, r]));

    const items = rows
      .map((rec) => {
        const cartoon = cartoonMap.get(rec.cartoonId);
        if (!cartoon) return null;

        let reasons: string[] = [];
        let scoreBreakdown = {
          age: 0,
          genre: 0,
          language: 0,
          educational: 0,
          feedback: 0,
        };
        try {
          reasons = JSON.parse(rec.reasons);
        } catch {
          reasons = [];
        }
        try {
          scoreBreakdown = JSON.parse(rec.scoreBreakdown);
        } catch {
          // keep default
        }

        const parentRating = ratingMap.get(rec.cartoonId);
        const favoriteId = favMap.get(rec.cartoonId) ?? null;

        return {
          id: rec.id,
          cartoonId: rec.cartoonId,
          score: rec.score,
          status: rec.status as 'APPROVED' | 'PARENTAL_REVIEW',
          reasons,
          scoreBreakdown,
          matchedCountry: rec.matchedCountry,
          matchedRating: rec.matchedRating,
          matchedSource: rec.matchedSource,
          favoriteId,
          parentRating: parentRating
            ? {
                score: parentRating.score,
                feedbackNote: parentRating.feedbackNote,
              }
            : null,
          cartoon,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    return {
      child: {
        ...owned,
        age: calculateAgeFromBirthDate(owned.birthDate),
      },
      preferences: prefData?.preferences ?? null,
      recommendations: items,
    };
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    throw new Error('Failed to load recommendations.', { cause: error });
  }
}

export async function listFavoritesForChild(childId: string, userId: number) {
  try {
    const owned = await getOwnedChild(childId, userId);
    if (!owned) return null;

    const [favRows, hydratedCartoons, childRatings] = await Promise.all([
      db
        .select()
        .from(favorites)
        .where(eq(favorites.childId, childId))
        .orderBy(desc(favorites.createdAt)),
      listCartoonsHydrated(),
      db.select().from(ratings).where(eq(ratings.childId, childId)),
    ]);

    const cartoonMap = new Map(hydratedCartoons.map((c) => [c.id, c]));
    const ratingMap = new Map(childRatings.map((r) => [r.cartoonId, r]));

    return favRows
      .map((f) => {
        const cartoon = cartoonMap.get(f.cartoonId);
        if (!cartoon) return null;
        return {
          id: f.id,
          childId: f.childId,
          cartoonId: f.cartoonId,
          createdAt: f.createdAt,
          cartoon,
          parentRating: ratingMap.get(f.cartoonId) ?? null,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    throw new Error('Failed to load favorites.', { cause: error });
  }
}

export async function addFavoriteForChild(
  childId: string,
  cartoonId: string,
  userId: number
) {
  try {
    const owned = await getOwnedChild(childId, userId);
    if (!owned) return null;

    const inserted = await db
      .insert(favorites)
      .values({ childId, cartoonId })
      .onConflictDoNothing({
        target: [favorites.childId, favorites.cartoonId],
      })
      .returning();

    if (inserted[0]) return inserted[0];

    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(eq(favorites.childId, childId), eq(favorites.cartoonId, cartoonId))
      );
    return existing[0] ?? null;
  } catch (error) {
    console.error('Failed to add favorite:', error);
    throw new Error('Failed to save favorite.', { cause: error });
  }
}

export async function deleteFavoriteById(favoriteId: string, userId: number) {
  try {
    const existing = await db
      .select({
        id: favorites.id,
        childId: favorites.childId,
        ownerId: children.userId,
      })
      .from(favorites)
      .innerJoin(children, eq(favorites.childId, children.id))
      .where(eq(favorites.id, favoriteId));

    const match = existing[0];
    if (!match || match.ownerId !== userId) {
      return null;
    }

    const deleted = await db
      .delete(favorites)
      .where(eq(favorites.id, favoriteId))
      .returning();
    return deleted[0] ?? null;
  } catch (error) {
    console.error('Failed to delete favorite:', error);
    throw new Error('Failed to remove favorite.', { cause: error });
  }
}

export async function listRatingsForChild(childId: string, userId: number) {
  try {
    const owned = await getOwnedChild(childId, userId);
    if (!owned) return null;

    const [ratingRows, allCartoons] = await Promise.all([
      db
        .select()
        .from(ratings)
        .where(eq(ratings.childId, childId))
        .orderBy(desc(ratings.updatedAt)),
      db.select().from(cartoons),
    ]);

    const cartoonMap = new Map(allCartoons.map((c) => [c.id, c]));

    return ratingRows.map((r) => {
      const cartoon = cartoonMap.get(r.cartoonId);
      return {
        ...r,
        cartoon: cartoon
          ? {
              id: cartoon.id,
              title: cartoon.title,
              posterPath: cartoon.posterPath,
              mediaType: cartoon.mediaType,
            }
          : null,
      };
    });
  } catch (error) {
    console.error('Failed to load ratings:', error);
    throw new Error('Failed to load parent ratings.', { cause: error });
  }
}

export async function getOrFindCartoonTrailer(
  cartoonId: string
): Promise<TrailerResult | null> {
  try {
    await ensureCatalogSeeded();
    const rows = await db
      .select()
      .from(cartoons)
      .where(eq(cartoons.id, cartoonId));
    const cartoon = rows[0];
    if (!cartoon) return null;

    const cachedId = extractYouTubeVideoId(cartoon.trailerUrl);
    if (cachedId) {
      return buildSafeTrailerPayload(
        cachedId,
        'CACHED',
        `${cartoon.title} — Official Trailer`,
        'YouTube'
      );
    }

    const searched = await searchOfficialCartoonTrailer({
      title: cartoon.title,
      mediaType: cartoon.mediaType,
      releaseDate: cartoon.releaseDate,
    });

    if (searched.available && searched.watchUrl) {
      await db
        .update(cartoons)
        .set({ trailerUrl: searched.watchUrl })
        .where(eq(cartoons.id, cartoon.id));
    }

    return searched;
  } catch (error) {
    console.error('Failed to fetch official cartoon trailer:', error);
    throw new Error('Failed to load official trailer.', { cause: error });
  }
}

export async function upsertRatingForChild(
  userId: number,
  input: {
    childId: string;
    cartoonId: string;
    score: number;
    feedbackNote?: string | null;
  }
) {
  try {
    const owned = await getOwnedChild(input.childId, userId);
    if (!owned) return null;

    const saved = await db
      .insert(ratings)
      .values({
        childId: input.childId,
        cartoonId: input.cartoonId,
        score: input.score,
        feedbackNote: input.feedbackNote?.trim() || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [ratings.childId, ratings.cartoonId],
        set: {
          score: input.score,
          feedbackNote: input.feedbackNote?.trim() || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Update recommendation scores to incorporate new feedback
    await refreshRecommendationsForChild(input.childId, userId);

    return saved[0];
  } catch (error) {
    console.error('Failed to save rating:', error);
    throw new Error('Failed to save parent rating.', { cause: error });
  }
}
