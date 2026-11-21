import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AppLanguage, LANGUAGE_OPTIONS } from '../i18n/translations';

export function Navbar() {
  const { firebaseUser, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: t.nav.dashboard },
    { to: '/discover', label: t.nav.discovery },
    { to: '/recommendations', label: t.nav.recommendations },
    { to: '/favorites', label: t.nav.favorites },
  ];

  const handlePrimaryAction = async () => {
    setMobileOpen(false);
    if (firebaseUser) {
      await signOut();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded"
        >
          Smart Kids
        </Link>

        {/* Zone 2: 4 Single-line Localized Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {navLinks.map((link) => {
            const active =
              location.pathname === link.to ||
              location.pathname.startsWith(`${link.to}/`);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  active
                    ? 'text-teal-800 border-teal-700'
                    : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-sm`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Language Switcher + Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <select
            aria-label={t.nav.languageLabel}
            value={lang}
            onChange={(e) => setLang(e.target.value as AppLanguage)}
            className="px-2.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-700 whitespace-nowrap shrink-0"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handlePrimaryAction}
            className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
          >
            {firebaseUser ? t.nav.signOut : t.nav.signIn}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const active =
              location.pathname === link.to ||
              location.pathname.startsWith(`${link.to}/`);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-teal-50 text-teal-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="w-full mt-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
          >
            {firebaseUser ? t.nav.signOut : t.nav.signIn}
          </button>
        </div>
      )}
    </header>
  );
}
