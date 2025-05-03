import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`py-4 px-6 border-t text-center ${isDark ? 'bg-gray-900 text-gray-400 border-gray-700' : 'bg-white text-gray-600 border-gray-200'}`}>
      <p>© 2025 Depo Yönetim Sistemi - Tüm hakları saklıdır.</p>
    </footer>
  );
};

export default Footer; 