import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const resources = {
  en: {
    translation: enTranslations
  },
  ar: {
    translation: arTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'], // cache user language on localStorage
    }
  });

// Add RTL language detection
export const isRTL = (lng: string = i18n.language): boolean => {
  return lng === 'ar';
};

// Add direction switching
export const setDocumentDirection = (lng: string = i18n.language) => {
  document.documentElement.dir = isRTL(lng) ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
};

// Set initial direction
setDocumentDirection();

// Update direction on language change
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});

export default i18n;