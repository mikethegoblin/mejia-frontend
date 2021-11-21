import i18n from "i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from "react-i18next";



i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .use(LanguageDetector)
    .init({
        ns: ['translation'],
        defaultNS: 'translation',
        supportedLngs: ['en', 'es'],
        fallbackLng: "en",
        detection: {
            order: ['cookie', 'htmlTag', 'localStorage','path', 'subdomain'],
            caches: ['cookie'],
        },
        resources: {
            en: {
                translation: require('../locales/en/translation.json')
            },
            es: {
                translation: require('../locales/es/translation.json')
            }
        }
    });

export default i18n;