import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Heart,
  RefreshCw,
  Sliders,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { RecommendationItem } from '../types';
import { ChildSwitcher } from '../components/ChildSwitcher';
import { CartoonPoster } from '../components/CartoonPoster';

export function DashboardPage() {
  const { parentUser, activeChild, childrenList, getFreshToken } = useAuth();
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>(
    []
  );
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeChild) {
      setRecommendations([]);
      return;
    }

    let active = true;
    setLoadingRecs(true);
    setError(null);

    getFreshToken()
      .then((idToken) => {
        if (!idToken) return null;
        return apiRequest<{ recommendations: RecommendationItem[] }>(
          `/api/recommendations/${activeChild.id}`,
          {},
          idToken
        );
      })
      .then((res) => {
        if (active && res) {
          setRecommendations(res.recommendations);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load child recommendations.'
          );
        }
      })
      .finally(() => {
        if (active) setLoadingRecs(false);
      });

    return () => {
      active = false;
    };
  }, [activeChild, getFreshToken]);

  const handleRefresh = async () => {
    if (!activeChild) return;
    setRefreshing(true);
    setError(null);
    try {
      const idToken = await getFreshToken();
      if (!idToken) return;
      const res = await apiRequest<{ recommendations: RecommendationItem[] }>(
        `/api/recommendations/${activeChild.id}/refresh`,
        { method: 'POST' },
        idToken
      );
      setRecommendations(res.recommendations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to recalculate scores.'
      );
    } finally {
      setRefreshing(false);
    }
  };

  const approvedCount = recommendations.filter(
    (r) => r.status === 'APPROVED'
  ).length;
  const reviewCount = recommendations.filter(
    (r) => r.status === 'PARENTAL_REVIEW'
  ).length;
  const topApproved = recommendations
    .filter((r) => r.status === 'APPROVED')
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {parentUser?.email}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {t.dashboard.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/children"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            {t.dashboard.manageChildren}
          </Link>
          {activeChild && (
            <Link
              to={`/children/${activeChild.id}/preferences`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg whitespace-nowrap"
            >
              <Sliders className="w-4 h-4" />
              {t.dashboard.editPreferences}
            </Link>
          )}
        </div>
      </div>

      <ChildSwitcher />

      {childrenList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-2xl mx-auto">
          <h2 className="font-display text-xl font-bold text-slate-900">
            {t.dashboard.emptyTitle}
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {t.dashboard.emptyDesc}
          </p>
          <Link
            to="/children"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
          >
            <UserPlus className="w-4 h-4" />
            {t.dashboard.createProfile}
          </Link>
        </div>
      ) : activeChild ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500">
                {t.dashboard.computedAge}
              </p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                {activeChild.age}y
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {activeChild.preferences?.strictCountry || 'DE'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500">
                {t.dashboard.approvedMatches}
              </p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-emerald-700">
                {approvedCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t.dashboard.verifiedSafe}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500">
                {t.dashboard.reviewQueue}
              </p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-amber-700">
                {reviewCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t.dashboard.reviewDesc}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-medium text-slate-500">
                {t.dashboard.activeInterests}
              </p>
              <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                {activeChild.preferences?.genreIds.length ?? 0}{' '}
                {t.dashboard.genresLabel}
              </p>
              <p className="mt-1 text-xs text-slate-500 truncate">
                {activeChild.preferences?.languageNames.join(', ') || 'English'}
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {t.dashboard.topRecsTitle} {activeChild.nickname}
                </h2>
                <p className="text-sm text-slate-600">
                  {t.dashboard.topRecsSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-60 rounded-lg whitespace-nowrap"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`}
                  />
                  {refreshing
                    ? t.dashboard.recalculating
                    : t.dashboard.refreshScores}
                </button>
                <Link
                  to={`/recommendations/${activeChild.id}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-900 whitespace-nowrap"
                >
                  {t.dashboard.fullReport}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {loadingRecs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-44 bg-slate-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : topApproved.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <p className="text-sm font-medium text-slate-900">
                  {t.dashboard.noMatches}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {t.dashboard.adjustPrefsHint}
                </p>
                <Link
                  to={`/children/${activeChild.id}/preferences`}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg"
                >
                  {t.dashboard.adjustPrefs}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topApproved.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col sm:flex-row"
                  >
                    <Link
                      to={`/cartoons/${rec.cartoon.id}`}
                      className="sm:w-36 shrink-0 aspect-[3/4] sm:aspect-auto bg-slate-100"
                    >
                      <CartoonPoster
                        src={rec.cartoon.posterPath}
                        title={rec.cartoon.title}
                        className="w-full h-full"
                      />
                    </Link>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <Link
                            to={`/cartoons/${rec.cartoon.id}`}
                            className="font-display text-lg font-semibold text-slate-900 hover:text-teal-800 transition-colors"
                          >
                            {rec.cartoon.title}
                          </Link>
                          <span className="font-mono-tabular text-sm font-semibold text-teal-800 shrink-0">
                            {rec.score}/100
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {rec.cartoon.mediaType === 'TV'
                            ? t.discover.tvSeries
                            : t.discover.movies}
                          {rec.matchedCountry && rec.matchedRating
                            ? ` · ${rec.matchedCountry} ${rec.matchedRating}`
                            : ''}
                          {rec.matchedSource ? ` · ${rec.matchedSource}` : ''}
                        </p>

                        <ul className="mt-3 space-y-1 text-xs text-slate-600">
                          {rec.reasons.slice(0, 3).map((reason, idx) => (
                            <li key={idx}>· {reason}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="font-mono-tabular text-slate-500">
                          Age {rec.scoreBreakdown.age} · Genre{' '}
                          {rec.scoreBreakdown.genre} · Lang{' '}
                          {rec.scoreBreakdown.language}
                        </span>
                        <Link
                          to={`/cartoons/${rec.cartoon.id}`}
                          className="font-semibold text-teal-800 hover:text-teal-900 whitespace-nowrap"
                        >
                          {t.dashboard.details}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link
              to="/discover"
              className="bg-white border border-slate-200 hover:border-teal-700/50 rounded-xl p-5 flex items-center justify-between gap-4 transition-colors"
            >
              <div>
                <p className="font-display text-base font-semibold text-slate-900">
                  {t.dashboard.discoveryCardTitle}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {t.dashboard.discoveryCardDesc}
                </p>
              </div>
              <Compass className="w-5 h-5 text-teal-700 shrink-0" />
            </Link>

            <Link
              to="/favorites"
              className="bg-white border border-slate-200 hover:border-teal-700/50 rounded-xl p-5 flex items-center justify-between gap-4 transition-colors"
            >
              <div>
                <p className="font-display text-base font-semibold text-slate-900">
                  {t.dashboard.favoritesCardTitle}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {t.dashboard.favoritesCardDesc} {activeChild.nickname}.
                </p>
              </div>
              <Heart className="w-5 h-5 text-teal-700 shrink-0" />
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
