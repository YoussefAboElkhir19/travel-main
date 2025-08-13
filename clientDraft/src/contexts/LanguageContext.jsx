import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = { en, ar };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(storedLanguage);
    document.documentElement.setAttribute('lang', storedLanguage);
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.setAttribute('lang', newLanguage);
  };

  const t = (key, options = {}) => {
    let translation = key.split('.').reduce((acc, currentKey) => {
        return acc && acc[currentKey] ? acc[currentKey] : null;
    }, translations[language]);

    if (!translation) {
      const enTranslation = key.split('.').reduce((acc, currentKey) => {
          return acc && acc[currentKey] ? acc[currentKey] : null;
      }, translations.en);
      translation = enTranslation || key;
    }
    
    if (typeof translation === 'string' && options) {
        Object.keys(options).forEach(optionKey => {
            translation = translation.replace(`{${optionKey}}`, options[optionKey]);
        });
    }

    return translation;
  };

  const value = {
    language,
    direction: 'ltr',
    changeLanguage,
    t,
    isRTL: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};