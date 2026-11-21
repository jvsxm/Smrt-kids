import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Heart,
  Play,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { Cartoon, RecommendationItem } from '../types';
import { CartoonPoster } from '../components/CartoonPoster';
import { StarRatingInput } from '../components/StarRatingInput';

interface TrailerResponse {
  available: boolean;
  videoId: string | null;
  embedUrl: string | null;
  watchUrl: string | null;
  title: string | null;
  channelTitle: string | null;
  source: string;
  youtubeConfigured: boolean;
  message?: string;
}

export function CartoonDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { firebaseUser, activeChild, getFreshToken } = useAuth();
  const { t } = useLanguage();

  const [cartoon, setCartoon] = useState<Cartoon | null>(null);
  const [childRec, setChildRec] = useState<RecommendationItem | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [trailerLoading, setTrailerLoading] = useState(false);
  const [trailerData, setTrailerData] = useState<TrailerResponse | null>(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerError, setTrailerError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(null);
    setTrailerData(null);
    setTrailerOpen(false);
    setTrailerError(null);

    apiRequest<{ cartoon: Cartoon }>(`/api/cartoons/${id}`)
      .then((res) => {
        if (active) setCartoon(res.cartoon);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load cartoon.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!firebaseUser || !activeChild || !id) {
      setChildRec(null);
      return;
    }
    let active = true;
    getFreshToken()
      .then((token) =>
        token
          ? apiRequest<{ recommendations: RecommendationItem[] }>(
              `/api/recommendations/${activeChild.id}`,
              {},
              token
            )
          : null
      )
      .then((res) => {
        if (!active || !res) return;
        const match =
          res.recommendations.find((r) => r.cartoonId === id) ?? null;
        setChildRec(match);
        setScore(match?.parentRating?.score || 0);
        setFeedbackNote(match?.parentRating?.feedbackNote || '');
      })
      .catch(() => {
        // Non-blocking enrichment
      });

    return () => {
      active = false;
    };
  }, [firebaseUser, activeChild, id, getFreshToken]);

  const handlePlayTrailer = async () => {
    if (!id) return;
    if (trailerData?.available && trailerData.embedUrl) {
      setTrailerOpen(true);
      return;
    }

    setTrailerLoading(true);
    setTrailerError(null);
    try {
      const res = await apiRequest<TrailerResponse>(
        `/api/cartoons/${id}/trailer`
      );
      setTrailerData(res);
      if (res.available && res.embedUrl) {
        setTrailerOpen(true);
      } else {
        setTrailerError(
          res.message || 'Official trailer unavailable for this title.'
        );
      }
    } catch (err) {
      setTrailerError(
        err instanceof Error ? err.message : 'Failed to load official trailer.'
      );
    } finally {
      setTrailerLoading(false);
    }
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChild || !cartoon || score < 1) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const token = await getFreshToken();
      if (!token) return;
      await apiRequest(
        '/api/ratings',
        {
          method: 'POST',
          body: JSON.stringify({
            childId: activeChild.id,
            cartoonId: cartoon.id,
            score,
            feedbackNote: feedbackNote.trim() || null,
          }),
        },
        token
      );
      setMessage(
        `Saved parent feedback for ${activeChild.nickname} and updated recommendation score.`
      );
      const refreshed = await apiRequest<{
        recommendations: RecommendationItem[];
      }>(`/api/recommendations/${activeChild.id}`, {}, token);
      setChildRec(
        refreshed.recommendations.find((r) => r.cartoonId === cartoon.id) ?? null
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to save parent rating.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!activeChild || !cartoon) return;
    setSaving(true);
    setError(null);
    try {
      const token = await getFreshToken();
      if (!token) return;

      if (childRec?.favoriteId) {
        await apiRequest(
          `/api/favorites/${childRec.favoriteId}`,
          { method: 'DELETE' },
          token
        );
        setChildRec((prev) => (prev ? { ...prev, favoriteId: null } : null));
      } else {
        const res = await apiRequest<{ favorite: { id: string } }>(
          '/api/favorites',
          {
            method: 'POST',
            body: JSON.stringify({
              childId: activeChild.id,
              cartoonId: cartoon.id,
            }),
          },
          token
        );
        setChildRec((prev) =>
          prev ? { ...prev, favoriteId: res.favorite.id } : null
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update favorite.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!cartoon) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-base font-semibold text-slate-900">
          {error || 'Cartoon not found.'}
        </p>
        <Link
          to="/discover"
          className="mt-4 inline-block text-sm font-medium text-teal-800 hover:underline"
        >
          {t.details.backToDiscovery}
        </Link>
      </div>
    );
  }

  const audioLangs = cartoon.languages
    .filter((l) => l.audioType === 'AUDIO')
    .map((l) => l.name);
  const subLangs = cartoon.languages
    .filter((l) => l.audioType === 'SUBTITLE')
    .map((l) => l.name);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/discover"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t.details.backToDiscovery}
      </Link>

      {/* Embedded Official Trailer Player */}
      {trailerOpen && trailerData?.available && trailerData.embedUrl && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 flex items-center justify-between gap-4 border-b border-slate-800">
            <div>
              <p className="text-xs font-medium text-teal-300">
                {t.details.officialTrailer}
                {trailerData.channelTitle
                  ? ` · ${trailerData.channelTitle}`
                  : ''}
              </p>
              <p className="text-sm font-semibold text-white">
                {trailerData.title || cartoon.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTrailerOpen(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-4 h-4" />
              {t.details.closeTrailer}
            </button>
          </div>
          <div className="aspect-video w-full bg-black">
            <iframe
              src={trailerData.embedUrl}
              title={trailerData.title || `${cartoon.title} trailer`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-4 aspect-[3/4] md:aspect-auto bg-slate-100">
          <CartoonPoster
            src={cartoon.posterPath}
            title={cartoon.title}
            className="w-full h-full"
          />
        </div>

        <div className="md:col-span-8 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500">
                {cartoon.mediaType === 'TV' ? t.discover.tvSeries : t.discover.movies}
                {cartoon.releaseDate ? ` · ${cartoon.releaseDate}` : ''}
                {cartoon.runtimeMinutes
                  ? ` · ${cartoon.runtimeMinutes} min`
                  : ''}
                {cartoon.isEducational ? ' · Educational' : ''}
              </p>
              <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {cartoon.title}
              </h1>
              <p className="mt-2 text-xs text-slate-600">
                {t.details.genresLabel}:{' '}
                {cartoon.genres.map((g) => g.name).join(', ') || 'Animation'}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlayTrailer}
              disabled={trailerLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              {trailerLoading
                ? t.details.loadingTrailer
                : t.details.playTrailer}
            </button>
          </div>

          {trailerError && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900"
            >
              {trailerError}
            </div>
          )}

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            {cartoon.overview}
          </p>

          {/* Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <p className="font-semibold text-slate-900">
                {t.details.audioLanguages}
              </p>
              <p className="mt-1 text-slate-600">
                {audioLangs.length > 0
                  ? audioLangs.join(', ')
                  : cartoon.originalLanguage.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {t.details.subtitlesAvailable}
              </p>
              <p className="mt-1 text-slate-600">
                {subLangs.length > 0 ? subLangs.join(', ') : t.details.noneListed}
              </p>
            </div>
          </div>

          {/* Official Age Classifications */}
          <div className="pt-4 border-t border-slate-100">
            <h2 className="font-display text-sm font-semibold text-slate-900">
              {t.details.classificationsTitle}
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-start text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pe-4 font-medium">{t.details.countryCol}</th>
                    <th className="py-2 pe-4 font-medium">{t.details.ratingCol}</th>
                    <th className="py-2 pe-4 font-medium">{t.details.minAgeCol}</th>
                    <th className="py-2 pe-4 font-medium">{t.details.sourceCol}</th>
                    <th className="py-2 font-medium">{t.details.statusCol}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cartoon.contentRatings.map((cr) => (
                    <tr key={cr.id}>
                      <td className="py-2.5 pe-4 font-mono-tabular font-semibold text-slate-900">
                        {cr.countryCode}
                      </td>
                      <td className="py-2.5 pe-4 text-slate-700">
                        {cr.originalRating}
                      </td>
                      <td className="py-2.5 pe-4 font-mono-tabular text-slate-700">
                        {cr.minimumAge !== null
                          ? `${cr.minimumAge}+`
                          : t.details.unknown}
                      </td>
                      <td className="py-2.5 pe-4 text-slate-600">{cr.source}</td>
                      <td className="py-2.5">
                        {cr.verified ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {t.details.verified}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {t.details.unverified}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Child Compatibility + Feedback */}
          {firebaseUser && activeChild && (
            <div className="pt-5 border-t border-slate-200 space-y-5">
              {childRec && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.details.compatibilityFor} {activeChild.nickname} (
                      {activeChild.age}y)
                    </p>
                    <p className="font-mono-tabular text-lg font-bold text-teal-800">
                      {childRec.score}/100
                    </p>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {childRec.reasons.map((r, i) => (
                      <li key={i}>· {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {message && (
                <div
                  role="status"
                  className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800"
                >
                  {message}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSaveFeedback} className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t.details.parentRatingFor} {activeChild.nickname}
                    </p>
                    <div className="mt-1">
                      <StarRatingInput
                        value={score}
                        onChange={setScore}
                        disabled={saving}
                      />
                    </div>
                  </div>

                  {childRec && (
                    <button
                      type="button"
                      onClick={handleToggleFavorite}
                      disabled={saving}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                        childRec.favoriteId
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          childRec.favoriteId ? 'fill-teal-700 text-teal-700' : ''
                        }`}
                      />
                      {childRec.favoriteId
                        ? t.details.savedInFavorites
                        : t.details.addToFavorites}
                    </button>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="feedbackNote"
                    className="block text-xs font-medium text-slate-700 mb-1"
                  >
                    {t.details.reviewLabel}
                  </label>
                  <textarea
                    id="feedbackNote"
                    rows={2}
                    maxLength={500}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder={t.details.reviewPlaceholder}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || score < 1}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {saving ? t.details.savingBtn : t.details.saveFeedbackBtn}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
