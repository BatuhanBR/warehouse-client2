import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // Çeviri dosyalarını backend'den yüklemek için (örneğin /locales/en/translation.json)
  .use(HttpBackend)
  // Tarayıcı dilini algıla
  .use(LanguageDetector)
  // i18n örneğini react-i18next'e geçir
  .use(initReactI18next)
  // i18n'i başlat
  .init({
    // Başlangıçta kullanılacak dil (algılanamazsa veya kaydedilmemişse)
    fallbackLng: 'tr', 
    // Desteklenen diller
    supportedLngs: ['tr', 'en'],
    // Debug modunu aç (geliştirme sırasında yararlı)
    debug: process.env.NODE_ENV === 'development',
    // react-i18next için seçenekler
    interpolation: {
      escapeValue: false, // React zaten XSS'den koruduğu için gerekli değil
    },
    // Tarayıcı dili algılama ayarları
    detection: {
      // Dilin nereden alınacağını belirle (öncelik sırası)
      order: ['localStorage', 'navigator'],
      // localStorage'da hangi anahtarın kullanılacağını belirt
      lookupLocalStorage: 'language', 
      // Sadece dili al (örneğin 'en' yerine 'en-US')
      caches: ['localStorage'], // Sadece localStorage'ı cache olarak kullan
    },
    // Backend (çeviri dosyaları) ayarları
    backend: {
      // Çeviri dosyalarının yolu (/public klasörüne göre)
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n; 