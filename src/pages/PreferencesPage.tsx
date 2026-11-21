import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { ChildPreferences, ChildProfile, Genre, Language } from '../types';

export function PreferencesPage() {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const { getFreshToken, refreshChildren } = useAuth();
  const { t } = useLanguage();

  const [child, setChild] = useState<ChildProfile | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [educational, setEducational] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [maxAgeOverride, setMaxAgeOverride] = useState<string>('');
  const [strictCountry, setStrictCountry] = useState('DE');
  const [allowParentalReview, setAllowParentalReview] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!childId) return;
    let active = true;
    setLoading(true);

    Promise.all([
      getFreshToken().then((token) =>
        token
          ? apiRequest<{ child: ChildProfile; preferences: ChildPreferences }>(
              `/api/children/${childId}/preferences`,
              {},
              token
            )
          : null
      ),
      apiRequest<{ genres: Genre[] }>('/api/genres'),
      apiRequest<{ languages: Language[] }>('/api/languages'),
    ])
      .then(([prefRes, genreRes, langRes]) => {
        if (!active) return;
        setGenres(genreRes.genres);
        setLanguages(langRes.languages);
        if (prefRes) {
          setChild(prefRes.child);
          setSelectedGenres(prefRes.preferences.genreIds);
          setSelectedLanguages(prefRes.preferences.languageCodes);
          setEducational(prefRes.preferences.educational);
          setMinRating(prefRes.preferences.minRating);
          setMaxAgeOverride(
            prefRes.preferences.maxAgeOverride !== null
              ? String(prefRes.preferences.maxAgeOverride)
              : ''
          );
          setStrictCountry(prefRes.preferences.strictCountry);
          setAllowParentalReview(prefRes.preferences.allowParentalReview);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Failed to load preferences.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [childId, getFreshToken]);

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;
    setSaving(true);
    setError(null);

    try {
      const idToken = await getFreshToken();
      if (!idToken) return;

      const parsedCap =
        maxAgeOverride.trim() === ''
          ? null
          : Math.max(0, Math.min(18, Number.parseInt(maxAgeOverride, 10)));

      await apiRequest(
        `/api/children/${childId}/preferences`,
        {
          method: 'PUT',
          body: JSON.stringify({
            educational,
            minRating,
            maxAgeOverride: Number.isNaN(parsedCap as number) ? null : parsedCap,
            strictCountry,
            allowParentalReview,
            genreIds: selectedGenres,
            languageCodes: selectedLanguages,
          }),
        },
        idToken
      );

      await refreshChildren();
      navigate(`/recommendations/${childId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save preferences.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-4 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded" />
        <div className="h-72 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            to="/children"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t.preferences.backToChildren}
          </Link>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-slate-900">
            {t.preferences.titlePrefix} {child?.nickname || 'Child'}
          </h1>
          {child && (
            <p className="mt-1 text-sm text-slate-600">
              {t.preferences.computedAge}:{' '}
              <span className="font-mono-tabular font-semibold">
                {child.age}y
              </span>
            </p>
          )}
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

      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8"
      >
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            {t.preferences.genresTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {t.preferences.genresHint}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {genres.map((genre) => {
              const selected = selectedGenres.includes(genre.id);
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    selected
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200">
          <h2 className="font-display text-base font-semibold text-slate-900">
            {t.preferences.languagesTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {t.preferences.languagesHint}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {languages.map((lang) => {
              const selected = selectedLanguages.includes(lang.code);
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggleLanguage(lang.code)}
                  aria-pressed={selected}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                    selected
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {lang.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="strictCountry"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              {t.preferences.countryLabel}
            </label>
            <select
              id="strictCountry"
              value={strictCountry}
              onChange={(e) => setStrictCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value="DE">Germany — FSK</option>
              <option value="US">United States — MPAA / TV Guidelines</option>
              <option value="GB">United Kingdom — BBFC</option>
              <option value="FR">France — CNC / ARCOM</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="maxAgeOverride"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              {t.preferences.maxAgeLabel}
            </label>
            <input
              id="maxAgeOverride"
              type="number"
              min={0}
              max={18}
              value={maxAgeOverride}
              onChange={(e) => setMaxAgeOverride(e.target.value)}
              placeholder={`${child?.age ?? 0}`}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="minRating"
              className="block text-sm font-semibold text-slate-900 mb-1.5"
            >
              {t.preferences.minRatingLabel}
            </label>
            <select
              id="minRating"
              value={minRating}
              onChange={(e) => setMinRating(Number.parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value={0}>0+</option>
              <option value={3}>3+ stars</option>
              <option value={4}>4+ stars</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={educational}
              onChange={(e) => setEducational(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                {t.preferences.educationalToggle}
              </span>
              <span className="block text-xs text-slate-500">
                {t.preferences.educationalHint}
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowParentalReview}
              onChange={(e) => setAllowParentalReview(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                {t.preferences.reviewToggle}
              </span>
              <span className="block text-xs text-slate-500">
                {t.preferences.reviewHint}
              </span>
            </span>
          </label>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <Link
            to="/dashboard"
            className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {t.children.cancel}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? t.preferences.savingBtn : t.preferences.saveBtn}
          </button>
        </div>
      </form>
    </div>
  );
}
