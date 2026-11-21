import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sliders, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiRequest } from '../lib/api';
import { Cartoon } from '../types';
import { CartoonPoster } from '../components/CartoonPoster';

export function LandingPage() {
  const { firebaseUser } = useAuth();
  const { t } = useLanguage();
  const [previewCartoons, setPreviewCartoons] = useState<Cartoon[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    let active = true;
    apiRequest<{ cartoons: Cartoon[] }>('/api/cartoons?verifiedOnly=true')
      .then((res) => {
        if (active) {
          setPreviewCartoons(res.cartoons.slice(0, 4));
        }
      })
      .catch(() => {
        if (active) setPreviewCartoons([]);
      })
      .finally(() => {
        if (active) setLoadingCatalog(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-slate-50">
      {/* Hero Split */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center py-2">
            <p className="text-sm font-medium text-teal-800 mb-3">
              {t.landing.kicker}
            </p>
            <h1
              className="font-display font-bold tracking-tight text-slate-900 leading-[1.1] text-balance"
              style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)' }}
            >
              {t.landing.headline}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              {t.landing.subtitle}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                to={firebaseUser ? '/dashboard' : '/login'}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
              >
                {firebaseUser ? t.landing.ctaDashboard : t.landing.ctaSignIn}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/discover"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-teal-800 transition-colors whitespace-nowrap shrink-0"
              >
                {t.landing.ctaBrowse}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <img
                src="/src/assets/images/hero_smart_kids_1795218110999.jpg"
                alt="Parent and child exploring curated animated series together on a tablet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Summary Strip Below Hero */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="font-mono-tabular text-xs font-medium text-teal-800">
              {t.landing.strip1Kicker}
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-slate-900">
              {t.landing.strip1Title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{t.landing.strip1Desc}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="font-mono-tabular text-xs font-medium text-teal-800">
              {t.landing.strip2Kicker}
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-slate-900">
              {t.landing.strip2Title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{t.landing.strip2Desc}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="font-mono-tabular text-xs font-medium text-teal-800">
              {t.landing.strip3Kicker}
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-slate-900">
              {t.landing.strip3Title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{t.landing.strip3Desc}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="font-mono-tabular text-xs font-medium text-teal-800">
              {t.landing.strip4Kicker}
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-slate-900">
              {t.landing.strip4Title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{t.landing.strip4Desc}</p>
          </div>
        </div>
      </section>

      {/* Mechanism Section */}
      <section className="bg-white border-y border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance">
              {t.landing.howTitle}
            </h2>
            <p className="mt-2.5 text-slate-600">{t.landing.howSubtitle}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-teal-800 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>{t.landing.step1Tag}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {t.landing.step1Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.landing.step1Desc}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-teal-800 font-semibold text-sm">
                <Sliders className="w-4 h-4" />
                <span>{t.landing.step2Tag}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {t.landing.step2Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.landing.step2Desc}
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-teal-800 font-semibold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>{t.landing.step3Tag}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {t.landing.step3Title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t.landing.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Catalog Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              {t.landing.catalogTitle}
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              {t.landing.catalogSubtitle}
            </p>
          </div>
          <Link
            to="/discover"
            className="text-sm font-semibold text-teal-800 hover:text-teal-900 whitespace-nowrap"
          >
            {t.landing.exploreAll}
          </Link>
        </div>

        {loadingCatalog ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewCartoons.map((cartoon) => {
              const deRating = cartoon.contentRatings.find(
                (r) => r.countryCode === 'DE'
              );
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
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-display text-base font-semibold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {cartoon.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {cartoon.mediaType === 'TV'
                        ? t.discover.tvSeries
                        : t.discover.movies}
                      {' · '}
                      <span className="font-mono-tabular">{year}</span>
                      {deRating ? ` · DE ${deRating.originalRating}` : ''}
                    </p>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {cartoon.overview}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
