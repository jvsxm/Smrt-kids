import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AppLanguage,
  TRANSLATIONS,
  TranslationDict,
} from '../i18n/translations';

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  dir: 'ltr' | 'rtl';
  t: TranslationDict;
}

const STORAGE_KEY = 'smartkids_ui_language';

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

function getInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'fr' || saved === 'de' || saved === 'ar') {
    return saved;
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLanguage>(getInitialLanguage);
  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang, dir]);

  const setLang = (next: AppLanguage) => {
    setLangState(next);
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        dir,
        t: TRANSLATIONS[lang],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
