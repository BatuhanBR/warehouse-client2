import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Kendi çeviri objemizi kaldırıyoruz, artık i18next yönetecek
/*
const translations = {
  tr: { ... },
  en: { ... }
};
*/

const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
  // useTranslation hook'unu kullanarak i18next'in t fonksiyonunu ve i18n örneğini al
  const { t, i18n } = useTranslation();

  // Dil state'ini ve localStorage'ı i18next'in yönetmesine izin veriyoruz,
  // bu yüzden kendi state'imizi ve getInitialLanguage fonksiyonumuzu kaldırıyoruz.
  /*
  const getInitialLanguage = () => { ... };
  const [language, setLanguage] = useState(getInitialLanguage);
  */

  // i18next'in dil değiştirme fonksiyonunu kullanacağız
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    // localStorage güncellemesini i18next zaten yapıyor (detection ayarı sayesinde)
  };

  // Kendi t fonksiyonumuzu kaldırıyoruz, useTranslation'dan gelen t'yi kullanacağız
  /*
  const t = (key) => {
    return translations[language][key] || key;
  };
  */

  // Context değeri olarak i18n'in dilini ve değiştirme fonksiyonunu, 
  // ve useTranslation'dan gelen t fonksiyonunu sağlıyoruz.
  const value = {
    language: i18n.language, // Mevcut dili i18n'den al
    changeLanguage,
    t
  };

  // i18n dili değiştiğinde context'i güncellemek için (opsiyonel, bileşenler zaten yeniden render olacak)
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      // Gerekirse burada ek işlemler yapılabilir ama genellikle gerekmez
      console.log('Dil değişti (Context üzerinden):', lng);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}; 