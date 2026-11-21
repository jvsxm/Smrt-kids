import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="font-display text-sm font-bold text-slate-900">
            Smart Kids
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            {t.footer.tagline}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <Link to="/discover" className="hover:text-slate-900 whitespace-nowrap">
            {t.footer.catalogDiscovery}
          </Link>
          <Link to="/dashboard" className="hover:text-slate-900 whitespace-nowrap">
            {t.footer.parentDashboard}
          </Link>
          <Link to="/children" className="hover:text-slate-900 whitespace-nowrap">
            {t.footer.childProfiles}
          </Link>
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">{t.footer.gdprNote}</span>
        </div>
      </div>
    </footer>
  );
}
