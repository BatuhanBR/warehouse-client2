import React, { createContext, useContext, useState, useEffect } from 'react';

// Dil çevirileri
const translations = {
  tr: {
    welcome: 'Hoş Geldiniz',
    dashboard: 'Dashboard',
    products: 'Ürünler',
    stockMovements: 'Stok Hareketleri',
    users: 'Kullanıcılar',
    warehouseView: 'Depo Görünümü',
    expenses: 'Giderler',
    contact: 'İletişim',
    logout: 'Çıkış Yap',
    about: 'Hakkında',
    generalStatus: 'Genel durumu görüntüleyin',
    manageProducts: 'Ürünleri yönetin',
    trackStock: 'Stok hareketlerini takip edin',
    view3D: '3D depo düzenini inceleyin',
    manageUsers: 'Kullanıcı hesaplarını yönetin',
    contactUs: 'Destek ekibimizle iletişime geçin',
    goodMorning: 'günaydın',
    goodAfternoon: 'iyi günler',
    goodEvening: 'iyi akşamlar',
    welcomeMessage: 'Depo Yönetim Sistemine hoş geldiniz. Deponuzu daha verimli ve düzenli yönetmek için aşağıdaki modülleri kullanabilirsiniz.',
    view: 'Görüntüle',
    copyright: '© 2025 Depo Yönetim Sistemi. Tüm hakları saklıdır.'
  },
  en: {
    welcome: 'Welcome',
    dashboard: 'Dashboard',
    products: 'Products',
    stockMovements: 'Stock Movements',
    users: 'Users',
    warehouseView: 'Warehouse View',
    expenses: 'Expenses',
    contact: 'Contact',
    logout: 'Logout',
    about: 'About',
    generalStatus: 'View general status',
    manageProducts: 'Manage products',
    trackStock: 'Track stock movements',
    view3D: 'Explore 3D warehouse layout',
    manageUsers: 'Manage user accounts',
    contactUs: 'Contact support team',
    goodMorning: 'good morning',
    goodAfternoon: 'good afternoon',
    goodEvening: 'good evening',
    welcomeMessage: 'Welcome to the Warehouse Management System. You can use the modules below to manage your warehouse more efficiently and organized.',
    view: 'View',
    copyright: '© 2025 Warehouse Management System. All rights reserved.'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  return useContext(LanguageContext);
};

export const LanguageProvider = ({ children }) => {
  // localStorage'dan dil tercihi varsa oku, yoksa tarayıcı diline bak
  const getInitialLanguage = () => {
    const savedLanguage = localStorage.getItem('language');
    
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Tarayıcı dilini kontrol et (basitleştirilmiş)
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'tr' ? 'tr' : 'en';
  };

  const [language, setLanguage] = useState(getInitialLanguage);

  // Dil değişimini işleyen fonksiyon
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Tercüme fonksiyonu
  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    changeLanguage,
    t
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}; 