import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { FavoriteItem } from '../types';
import { ChildSwitcher } from '../components/ChildSwitcher';
import { CartoonPoster } from '../components/CartoonPoster';

interface RatingHistoryItem {
  id: string;
  childId: string;
  cartoonId: string;
  score: number;
  feedbackNote: string | null;
  updatedAt: string;
  cartoon: {
    id: string;
    title: string;
    posterPath: string | null;
    mediaType: string;
  } | null;
}

export function FavoritesPage() {
  const { activeChild, getFreshToken } = useAuth();
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [ratingsHistory, setRatingsHistory] = useState<RatingHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFavoritesAndRatings = useCallback(async () => {
    if (!activeChild) {
      setFavorites([]);
      setRatingsHistory([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getFreshToken();
      if (!token) return;
      const [favRes, rateRes] = await Promise.all([
        apiRequest<{ favorites: FavoriteItem[] }>(
          `/api/favorites/${activeChild.id}`,
          {},
          token
        ),
        apiRequest<{ ratings: RatingHistoryItem[] }>(
          `/api/ratings/${activeChild.id}`,
          {},
          token
        ),
      ]);
      setFavorites(favRes.favorites);
      setRatingsHistory(rateRes.ratings);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load favorites.'
      );
    } finally {
      setLoading(false);
    }
  }, [activeChild, getFreshToken]);

  useEffect(() => {
    loadFavoritesAndRatings();
  }, [loadFavoritesAndRatings]);

  const handleRemove = async (favoriteId: string) => {
    try {
      const token = await getFreshToken();
      if (!token) return;
      await apiRequest(`/api/favorites/${favoriteId}`, { method: 'DELETE' }, token);
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to remove favorite.'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          {t.favorites.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t.favorites.subtitle}</p>
      </div>

      <ChildSwitcher />

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {activeChild && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-slate-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-sm font-semibold text-slate-900">
                {t.favorites.emptyTitle} {activeChild.nickname}.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t.favorites.emptyHint}
              </p>
              <Link
                to={`/recommendations/${activeChild.id}`}
                className="mt-5 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
              >
                {t.favorites.viewRecs}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.map((fav) => {
                const deRating = fav.cartoon.contentRatings.find(
                  (r) => r.countryCode === 'DE'
                );
                return (
                  <div
                    key={fav.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col"
                  >
                    <Link
                      to={`/cartoons/${fav.cartoon.id}`}
                      className="aspect-[3/4] w-full bg-slate-100 overflow-hidden"
                    >
                      <CartoonPoster
                        src={fav.cartoon.posterPath}
                        title={fav.cartoon.title}
                        className="w-full h-full hover:scale-[1.02] transition-transform duration-200"
                      />
                    </Link>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/cartoons/${fav.cartoon.id}`}
                          className="font-display text-base font-semibold text-slate-900 hover:text-teal-800"
                        >
                          {fav.cartoon.title}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">
                          {fav.cartoon.mediaType === 'TV'
                            ? t.discover.tvSeries
                            : t.discover.movies}
                          {deRating ? ` · DE ${deRating.originalRating}` : ''}
                        </p>
                        {fav.parentRating && (
                          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {t.favorites.ratedLabel} {fav.parentRating.score}/5
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <Link
                          to={`/cartoons/${fav.cartoon.id}`}
                          className="text-xs font-semibold text-teal-800 hover:underline"
                        >
                          {t.favorites.details}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemove(fav.id)}
                          aria-label={`Remove ${fav.cartoon.title} from favorites`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {t.favorites.remove}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Parent Ratings & Reviews History */}
          <section className="pt-4 space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                {t.favorites.ratingsHistoryTitle}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.favorites.ratingsHistorySubtitle}
              </p>
            </div>

            {ratingsHistory.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-xs text-slate-500">
                {t.favorites.noRatingsYet}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
                {ratingsHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <Link
                        to={`/cartoons/${item.cartoonId}`}
                        className="font-display text-sm font-semibold text-slate-900 hover:text-teal-800"
                      >
                        {item.cartoon?.title || 'Cartoon'}
                      </Link>
                      {item.feedbackNote && (
                        <p className="mt-1 text-xs text-slate-600">
                          &ldquo;{item.feedbackNote}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="inline-flex items-center gap-1 font-mono-tabular text-xs font-semibold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {item.score}/5
                      </span>
                      <Link
                        to={`/cartoons/${item.cartoonId}`}
                        className="text-xs font-medium text-teal-800 hover:underline"
                      >
                        {t.favorites.details}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
