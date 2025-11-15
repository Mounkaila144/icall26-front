'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>('fr');

  // Initialize language from localStorage or browser
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language');
    console.log('📚 [LanguageProvider] Initializing:', { savedLang, browserLang: navigator.language });
    if (savedLang) {
      setLanguageState(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      setLanguageState(browserLang || 'fr');
    }
  }, []);

  const setLanguage = useCallback((lang: string) => {
    console.log('📚 [LanguageProvider] Language changed:', lang);
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  }, []);

  useEffect(() => {
    console.log('📚 [LanguageProvider] Current language:', language);
  }, [language]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    language,
    setLanguage
  }), [language, setLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
