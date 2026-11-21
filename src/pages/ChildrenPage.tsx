import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Sliders, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { ChildProfile } from '../types';

export function ChildrenPage() {
  const { childrenList, refreshChildren, getFreshToken, setActiveChildId } =
    useAuth();
  const { t } = useLanguage();

  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const resetForm = () => {
    setNickname('');
    setBirthDate('');
    setGender('');
    setEditingId(null);
  };

  const startEdit = (child: ChildProfile) => {
    setEditingId(child.id);
    setNickname(child.nickname);
    setBirthDate(child.birthDate);
    setGender(child.gender || '');
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const idToken = await getFreshToken();
      if (!idToken) return;

      const payload = {
        nickname: nickname.trim(),
        birthDate,
        gender: gender === '' ? null : (gender as 'BOY' | 'GIRL' | 'OTHER'),
      };

      if (editingId) {
        await apiRequest(
          `/api/children/${editingId}`,
          { method: 'PUT', body: JSON.stringify(payload) },
          idToken
        );
        setNotice(`Updated ${payload.nickname}.`);
      } else {
        const res = await apiRequest<{ child: ChildProfile }>(
          '/api/children',
          { method: 'POST', body: JSON.stringify(payload) },
          idToken
        );
        setActiveChildId(res.child.id);
        setNotice(`Created ${res.child.nickname}.`);
      }

      await refreshChildren();
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to save child profile.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (childId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const idToken = await getFreshToken();
      if (!idToken) return;

      await apiRequest(`/api/children/${childId}`, { method: 'DELETE' }, idToken);
      setConfirmDeleteId(null);
      setNotice('Profile permanently deleted.');
      await refreshChildren();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete child profile.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          {t.children.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{t.children.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-5"
        >
          <h2 className="font-display text-lg font-semibold text-slate-900">
            {editingId ? t.children.editTitle : t.children.addTitle}
          </h2>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800"
            >
              {notice}
            </div>
          )}

          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              {t.children.nicknameLabel}
            </label>
            <input
              id="nickname"
              type="text"
              required
              maxLength={50}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t.children.nicknamePlaceholder}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              {t.children.birthDateLabel}
            </label>
            <input
              id="birthDate"
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div>
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              {t.children.genderLabel}
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <option value="">{t.children.genderUnspecified}</option>
              <option value="BOY">{t.children.genderBoy}</option>
              <option value="GIRL">{t.children.genderGirl}</option>
              <option value="OTHER">{t.children.genderOther}</option>
            </select>
            <p className="mt-1.5 text-xs text-slate-500">
              {t.children.genderHelp}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              {submitting
                ? t.children.saving
                : editingId
                  ? t.children.saveChanges
                  : t.children.createProfile}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                {t.children.cancel}
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-7 space-y-4">
          {childrenList.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-sm font-medium text-slate-900">
                {t.children.noProfiles}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t.children.noProfilesHint}
              </p>
            </div>
          ) : (
            childrenList.map((child) => (
              <div
                key={child.id}
                className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      {child.nickname}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      <span className="font-mono-tabular font-semibold text-slate-700">
                        {child.age}y
                      </span>
                      {' · '}
                      <span className="font-mono-tabular">{child.birthDate}</span>
                      {child.gender ? ` · ${child.gender}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/children/${child.id}/preferences`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg whitespace-nowrap"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      {t.children.preferencesBtn}
                    </Link>

                    <button
                      type="button"
                      onClick={() => startEdit(child)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      {t.children.editBtn}
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(child.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t.children.deleteBtn}
                    </button>
                  </div>
                </div>

                {child.preferences && (
                  <p className="text-xs text-slate-600 pt-3 border-t border-slate-100">
                    {child.preferences.strictCountry}
                    {' · '}
                    {child.preferences.genreNames.length > 0
                      ? child.preferences.genreNames.join(', ')
                      : t.discover.allGenres}
                    {' · '}
                    {child.preferences.languageNames.join(', ') || 'English'}
                  </p>
                )}

                {confirmDeleteId === child.id && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-red-900">
                      {t.children.confirmDeleteMsg}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md"
                      >
                        {t.children.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(child.id)}
                        disabled={submitting}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md"
                      >
                        {t.children.confirmDeleteBtn}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
