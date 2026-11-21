import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { Cartoon, Genre, Language } from '../types';
import { CartoonPoster } from '../components/CartoonPoster';

export function DiscoverPage() {
  const { firebaseUser, getFreshToken } = useAuth();
  const { t } = useLanguage();
  const [cartoons, setCartoons] = useState<Cartoon[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [tmdbConfigured, setTmdbConfigured] = useState(false);

  const [search, setSearch] = useState('');
  const [mediaType, setMediaType] = useState<'ALL' | 'MOVIE' | 'TV'>('ALL');
  const [genreId, setGenreId] = useState('');
  const [languageCode, setLanguageCode] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (mediaType !== 'ALL') params.set('mediaType', mediaType);
      if (genreId) params.set('genreId', genreId);
      if (languageCode) params.set('languageCode', languageCode);
      if (verifiedOnly) params.set('verifiedOnly', 'true');

      const res = await apiRequest<{
        cartoons: Cartoon[];
        tmdbConfigured: boolean;
      }>(`/api/cartoons?${params.toString()}`);

      setCartoons(res.cartoons);
      setTmdbConfigured(res.tmdbConfigured);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load cartoon catalog.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, mediaType, genreId, languageCode, verifiedOnly]);

  useEffect(() => {
    Promise.all([
      apiRequest<{ genres: Genre[] }>('/api/genres'),
      apiRequest<{ languages: Language[] }>('/api/languages'),
    ])
      .then(([gRes, lRes]) => {
        setGenres(gRes.genres);
        setLanguages(lRes.languages);
      })
      .catch(() => {
        // Non-blocking
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchCatalog]);

  const handleTmdbSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    setError(null);
    try {
      const idToken = await getFreshToken();
      if (!idToken) return;

      const res = await apiRequest<{ syncedCount: number }>(
        '/api/cartoons/sync',
        {
          method: 'POST',
          body: JSON.stringify({ query: search.trim() || undefined }),
        },
        idToken
      );
      setSyncMessage(`Synchronized ${res.syncedCount} titles from TMDB.`);
      await fetchCatalog();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'TMDB synchronization failed.'
      );
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {t.discover.title}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{t.discover.subtitle}</p>
        </div>

        {firebaseUser && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTmdbSync}
              disabled={syncing || !tmdbConfigured}
              title={
                tmdbConfigured
                  ? 'Fetch and normalize animated titles from TMDB'
                  : 'Add TMDB_API_KEY in server secrets to enable live TMDB sync'
              }
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 disabled:text-slate-600 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`}
              />
              {syncing ? t.discover.syncingBtn : t.discover.syncBtn}
            </button>
          </div>
        )}
      </div>

      {!tmdbConfigured && firebaseUser && (
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600">
          {t.discover.tmdbHint}
        </div>
      )}

      {syncMessage && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800"
        >
          {syncMessage}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.discover.searchPlaceholder}
            aria-label={t.discover.searchPlaceholder}
            className="w-full ps-10 pe-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>

        <div className="md:col-span-3 flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {(['ALL', 'TV', 'MOVIE'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMediaType(type)}
              className={`flex-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                mediaType === type
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'ALL'
                ? t.discover.all
                : type === 'TV'
                  ? t.discover.tvSeries
                  : t.discover.movies}
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          <select
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
            aria-label={t.discover.allGenres}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
          >
            <option value="">{t.discover.allGenres}</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={languageCode}
            onChange={(e) => setLanguageCode(e.target.value)}
            aria-label={t.discover.allLanguages}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
          >
            <option value="">{t.discover.allLanguages}</option>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <label className="md:col-span-1 flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer whitespace-nowrap">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
          />
          {t.discover.verifiedOnly}
        </label>
      </div>

      <p className="text-xs font-medium text-slate-500">
        {t.discover.showingCount}{' '}
        <span className="font-mono-tabular text-slate-800">
          {cartoons.length}
        </span>{' '}
        {t.discover.titlesLabel}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-80 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : cartoons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-sm font-semibold text-slate-900">
            {t.discover.emptyTitle}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t.discover.emptyHint}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cartoons.map((cartoon) => {
            const deRating = cartoon.contentRatings.find(
              (r) => r.countryCode === 'DE'
            );
            const fallbackRating = cartoon.contentRatings[0];
            const ratingDisplay = deRating || fallbackRating;
            const year = cartoon.releaseDate
              ? cartoon.releaseDate.slice(0, 4)
              : 'N/A';

            return (
              <Link
                key={cartoon.id}
                to={`/cartoons/${cartoon.id}`}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-teal-700/50 transition-colors flex flex-col"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-slate-100">
                  <CartoonPoster
                    src={cartoon.posterPath}
                    title={cartoon.title}
                    className="w-full h-full group-hover:scale-[1.02] transition-transform duration-200"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-display text-base font-semibold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {cartoon.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {cartoon.mediaType === 'TV'
                        ? t.discover.tvSeries
                        : t.discover.movies}
                      {' · '}
                      <span className="font-mono-tabular">{year}</span>
                      {ratingDisplay
                        ? ` · ${ratingDisplay.countryCode} ${ratingDisplay.originalRating}`
                        : ''}
                    </p>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {cartoon.overview}
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">
                      {cartoon.genres.map((g) => g.name).slice(0, 2).join(', ')}
                    </span>
                    <span
                      className={`font-medium shrink-0 ms-2 ${
                        ratingDisplay?.verified
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {ratingDisplay?.verified
                        ? t.discover.verifiedBadge
                        : t.discover.reviewBadge}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
