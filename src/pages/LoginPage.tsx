import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export function LoginPage() {
  const { firebaseUser, signInWithGoogle, authError, loading } = useAuth();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: string } | null)?.from || '/dashboard';

  if (!loading && firebaseUser) {
    return <Navigate to={from} replace />;
  }

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setLocalError(null);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(
        err instanceof Error
          ? err.message
          : 'Unable to complete sign-in. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <div className="flex items-center gap-2 text-teal-800 text-sm font-medium">
          <Lock className="w-4 h-4" />
          <span>{t.login.badge}</span>
        </div>

        <h1 className="mt-3 font-display text-2xl font-bold text-slate-900">
          {t.login.title}
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          {t.login.subtitle}
        </p>

        {displayError && (
          <div
            role="alert"
            className="mt-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800"
          >
            {displayError}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={submitting || loading}
          className="mt-6 w-full inline-flex items-center justify-center gap-3 px-5 py-3 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
        >
          {submitting ? t.login.signingIn : t.login.continueGoogle}
        </button>

        <div className="mt-6 pt-6 border-t border-slate-200 space-y-2.5 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span>{t.login.childNotice}</span>
          </div>
          <p>{t.login.privacyNotice}</p>
        </div>
      </div>
    </div>
  );
}
