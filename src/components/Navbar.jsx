import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdLogout, MdInfo, MdEmail, MdLanguage, MdDarkMode, MdLightMode } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success(language === 'tr' ? 'Başarıyla çıkış yapıldı' : 'Successfully logged out');
    navigate('/login');
  };

  const handleLanguageChange = () => {
    const newLang = language === 'tr' ? 'en' : 'tr';
    changeLanguage(newLang);
    toast.success(newLang === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English');
  };

  return (
    <div className="h-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between px-4 md:px-6 lg:px-8 shadow-sm dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
      {/* Sol taraf - Logo veya başlık */}
      <div className="flex items-center">
        <Link to="/welcome" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          WMS
        </Link>
      </div>
      
      {/* Sağ taraf - Butonlar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Tema Değiştirme Butonu */}
        <button
          onClick={toggleTheme}
          className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-300 hover:scale-105 group"
          aria-label={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? (
            <MdLightMode className="w-5 h-5 md:mr-2 group-hover:text-yellow-500 transition-colors" />
          ) : (
            <MdDarkMode className="w-5 h-5 md:mr-2 group-hover:text-blue-500 transition-colors" />
          )}
          <span className="hidden md:inline">{theme === 'dark' ? 'AYDINLIK' : 'KARANLIK'}</span>
        </button>

        {/* Dil Değiştirme Butonu */}
        <button
          onClick={handleLanguageChange}
          className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-300 hover:scale-105 group"
          aria-label={language === 'tr' ? 'English' : 'Türkçe'}
        >
          <MdLanguage className="w-5 h-5 md:mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">{language === 'tr' ? 'ENGLISH' : 'TÜRKÇE'}</span>
        </button>

        <Link
          to="/contact"
          className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-300 hover:scale-105 group"
        >
          <MdEmail className="w-5 h-5 md:mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">{t('contact')}</span>
        </Link>

        <Link
          to="/about"
          className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-300 hover:scale-105 group"
        >
          <MdInfo className="w-5 h-5 md:mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">{t('about')}</span>
        </Link>

        <div className="h-6 w-px bg-gradient-to-b from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 mx-2" />

        <button
          onClick={handleLogout}
          className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md group"
        >
          <MdLogout className="w-5 h-5 md:mr-2 group-hover:rotate-12 transition-transform" />
          <span className="hidden md:inline">{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar; 