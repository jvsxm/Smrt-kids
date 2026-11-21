import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Heart,
  MessageSquare,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { RecommendationItem } from '../types';
import { ChildSwitcher } from '../components/ChildSwitcher';
import { CartoonPoster } from '../components/CartoonPoster';
import { StarRatingInput } from '../components/StarRatingInput';

export function RecommendationsPage() {
  const { childId: routeChildId } = useParams<{ childId?: string }>();
  const { activeChild, setActiveChildId, childrenList, getFreshToken } =
    useAuth();
  const { t } = useLanguage();

  const targetChildId = routeChildId || activeChild?.id || null;

  useEffect(() => {
    if (routeChildId && routeChildId !== activeChild?.id) {
      setActiveChildId(routeChildId);
    }
  }, [routeChildId, activeChild?.id, setActiveChildId]);

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [tab, setTab] = useState<'APPROVED' | 'PARENTAL_REVIEW'>('APPROVED');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyCartoonId, setBusyCartoonId] = useState<string | null>(null);
  const [openReviewCartoonId, setOpenReviewCartoonId] = useState<string | null>(
    null
  );
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});

  const loadRecommendations = useCallback(async () => {
    if (!targetChildId) return;
    setLoading(true);
    setError(null);
    try {
      const idToken = await getFreshToken();
      if (!idToken) return;
      const res = await apiRequest<{ recommendations: RecommendationItem[] }>(
        `/api/recommendations/${targetChildId}`,
        {},
        idToken
      );
      setRecommendations(res.recommendations);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load recommendations.'
      );
    } finally {
      setLoading(false);
    }
  }, [targetChildId, getFreshToken]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleRefresh = async () => {
    if (!targetChildId) return;
    setRefreshing(true);
    setError(null);
    try {
      const idToken = await getFreshToken();
      if (!idToken) return;
      const res = await apiRequest<{ recommendations: RecommendationItem[] }>(
        `/api/recommendations/${targetChildId}/refresh`,
        { method: 'POST' },
        idToken
      );
      setRecommendations(res.recommendations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to refresh recommendations.'
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleFavorite = async (rec: RecommendationItem) => {
    if (!targetChildId) return;
    setBusyCartoonId(rec.cartoonId);
    try {
      const idToken = await getFreshToken();
      if (!idToken) return;

      if (rec.favoriteId) {
        await apiRequest(
          `/api/favorites/${rec.favoriteId}`,
          { method: 'DELETE' },
          idToken
        );
        setRecommendations((prev) =>
          prev.map((item) =>
            item.cartoonId === rec.cartoonId
              ? { ...item, favoriteId: null }
              : item
          )
        );
      } else {
        const res = await apiRequest<{ favorite: { id: string } }>(
          '/api/favorites',
          {
            method: 'POST',
            body: JSON.stringify({
              childId: targetChildId,
              cartoonId: rec.cartoonId,
            }),
          },
          idToken
        );
        setRecommendations((prev) =>
          prev.map((item) =>
            item.cartoonId === rec.cartoonId
              ? { ...item, favoriteId: res.favorite.id }
              : item
          )
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update favorite.'
      );
    } finally {
      setBusyCartoonId(null);
    }
  };

  const handleRateCartoon = async (
    rec: RecommendationItem,
    score: number,
    noteOverride?: string
  ) => {
    if (!targetChildId) return;
    setBusyCartoonId(rec.cartoonId);
    try {
      const idToken = await getFreshToken();
      if (!idToken) return;

      const note =
        noteOverride !== undefined
          ? noteOverride
          : draftNotes[rec.cartoonId] ?? rec.parentRating?.feedbackNote ?? '';

      await apiRequest(
        '/api/ratings',
        {
          method: 'POST',
          body: JSON.stringify({
            childId: targetChildId,
            cartoonId: rec.cartoonId,
            score,
            feedbackNote: note.trim() || null,
          }),
        },
        idToken
      );
      setOpenReviewCartoonId(null);
      await loadRecommendations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save rating.');
    } finally {
      setBusyCartoonId(null);
    }
  };

  const currentChild =
    childrenList.find((c) => c.id === targetChildId) || activeChild;

  const approvedItems = recommendations.filter((r) => r.status === 'APPROVED');
  const reviewItems = recommendations.filter(
    (r) => r.status === 'PARENTAL_REVIEW'
  );
  const visibleItems = tab === 'APPROVED' ? approvedItems : reviewItems;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {t.recommendations.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {t.recommendations.subtitle}
          </p>
        </div>

        {currentChild && (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/children/${currentChild.id}/preferences`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap"
            >
              <Sliders className="w-4 h-4" />
              {t.recommendations.adjustPreferences}
            </Link>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg whitespace-nowrap"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              {refreshing
                ? t.recommendations.recalculating
                : t.recommendations.recalculate}
            </button>
          </div>
        )}
      </div>

      <ChildSwitcher />

      {currentChild && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Recommendation classification filter"
              className="inline-flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'APPROVED'}
                onClick={() => setTab('APPROVED')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  tab === 'APPROVED'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.recommendations.approvedTab} ({approvedItems.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'PARENTAL_REVIEW'}
                onClick={() => setTab('PARENTAL_REVIEW')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  tab === 'PARENTAL_REVIEW'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.recommendations.reviewTab} ({reviewItems.length})
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {currentChild.preferences?.strictCountry || 'DE'} ·{' '}
              <span className="font-mono-tabular font-semibold text-slate-700">
                {currentChild.age}y
              </span>
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 bg-slate-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
              <p className="text-sm font-semibold text-slate-900">
                {tab === 'APPROVED'
                  ? t.recommendations.emptyApproved
                  : t.recommendations.emptyReview}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleItems.map((rec) => {
                const isBusy = busyCartoonId === rec.cartoonId;
                const isReviewOpen = openReviewCartoonId === rec.cartoonId;
                const draftText =
                  draftNotes[rec.cartoonId] ??
                  rec.parentRating?.feedbackNote ??
                  '';

                return (
                  <article
                    key={rec.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col md:flex-row"
                  >
                    <Link
                      to={`/cartoons/${rec.cartoon.id}`}
                      className="md:w-44 shrink-0 aspect-[3/4] md:aspect-auto bg-slate-100"
                    >
                      <CartoonPoster
                        src={rec.cartoon.posterPath}
                        title={rec.cartoon.title}
                        className="w-full h-full"
                      />
                    </Link>

                    <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-medium">
                              {rec.status === 'APPROVED' ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {t.recommendations.verifiedSuitable}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-700">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  {t.recommendations.reviewRequired}
                                </span>
                              )}
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-500">
                                {rec.cartoon.mediaType === 'TV'
                                  ? t.discover.tvSeries
                                  : t.discover.movies}
                              </span>
                              {rec.matchedCountry && rec.matchedRating && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="text-slate-600">
                                    {rec.matchedCountry} {rec.matchedRating} (
                                    {rec.matchedSource})
                                  </span>
                                </>
                              )}
                            </div>

                            <Link
                              to={`/cartoons/${rec.cartoon.id}`}
                              className="mt-1 block font-display text-xl font-bold text-slate-900 hover:text-teal-800 transition-colors"
                            >
                              {rec.cartoon.title}
                            </Link>
                          </div>

                          <div className="text-end">
                            <p className="font-mono-tabular text-2xl font-bold text-teal-800">
                              {rec.score}
                              <span className="text-sm font-normal text-slate-400">
                                /100
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {t.recommendations.compatibilityScore}
                            </p>
                          </div>
                        </div>

                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                          {rec.cartoon.overview}
                        </p>

                        <div className="mt-4">
                          <p className="text-xs font-semibold text-slate-800">
                            {t.recommendations.whyRecommended}
                          </p>
                          <ul className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                            {rec.reasons.map((reason, idx) => (
                              <li key={idx}>· {reason}</li>
                            ))}
                          </ul>
                        </div>

                        {rec.parentRating?.feedbackNote && !isReviewOpen && (
                          <p className="mt-3 text-xs text-slate-600 italic">
                            &ldquo;{rec.parentRating.feedbackNote}&rdquo;
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="font-mono-tabular text-xs text-slate-500">
                            Age {rec.scoreBreakdown.age}/40 · Genre{' '}
                            {rec.scoreBreakdown.genre}/25 · Language{' '}
                            {rec.scoreBreakdown.language}/20 · Edu{' '}
                            {rec.scoreBreakdown.educational}/10 · Feedback{' '}
                            {rec.scoreBreakdown.feedback}/5
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <StarRatingInput
                              value={rec.parentRating?.score || 0}
                              onChange={(score) => handleRateCartoon(rec, score)}
                              disabled={isBusy}
                              label={`Rate ${rec.cartoon.title}`}
                            />

                            <button
                              type="button"
                              onClick={() => {
                                setDraftNotes((prev) => ({
                                  ...prev,
                                  [rec.cartoonId]:
                                    prev[rec.cartoonId] ??
                                    rec.parentRating?.feedbackNote ??
                                    '',
                                }));
                                setOpenReviewCartoonId(
                                  isReviewOpen ? null : rec.cartoonId
                                );
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg whitespace-nowrap"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              {isReviewOpen
                                ? t.recommendations.hideReview
                                : t.recommendations.writeReview}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleFavorite(rec)}
                              disabled={isBusy}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                                rec.favoriteId
                                  ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  rec.favoriteId
                                    ? 'fill-teal-700 text-teal-700'
                                    : ''
                                }`}
                              />
                              {rec.favoriteId
                                ? t.recommendations.savedFavorite
                                : t.recommendations.saveFavorite}
                            </button>
                          </div>
                        </div>

                        {isReviewOpen && (
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <input
                              type="text"
                              maxLength={500}
                              value={draftText}
                              onChange={(e) =>
                                setDraftNotes((prev) => ({
                                  ...prev,
                                  [rec.cartoonId]: e.target.value,
                                }))
                              }
                              placeholder={t.recommendations.reviewPlaceholder}
                              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                            />
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                handleRateCartoon(
                                  rec,
                                  rec.parentRating?.score || 5,
                                  draftText
                                )
                              }
                              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg whitespace-nowrap"
                            >
                              {t.recommendations.saveReview}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
