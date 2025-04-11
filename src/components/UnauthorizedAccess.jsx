import React from 'react';
import { MdLockOutline } from 'react-icons/md';
import { useTheme } from '../contexts/ThemeContext';

const UnauthorizedAccess = ({ message = 'Bu sayfayı görüntüleme yetkiniz bulunmamaktadır.' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col items-center justify-center h-full p-10 rounded-lg shadow-lg backdrop-blur-sm ${isDark ? 'bg-gray-800/70 text-gray-200' : 'bg-white/70 text-gray-700'}`}>
      <MdLockOutline className={`w-16 h-16 mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
      <h2 className="text-2xl font-semibold mb-2">Erişim Engellendi</h2>
      <p className="text-center">{message}</p>
      {/* İsteğe bağlı olarak Anasayfa'ya veya başka bir yere yönlendirme butonu eklenebilir */}
      {/* 
      <Link to="/dashboard" className="mt-6 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-500">
        Anasayfa'ya Dön
      </Link> 
      */}
    </div>
  );
};

export default UnauthorizedAccess; 