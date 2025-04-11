import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdLogout, MdInfo, MdEmail, MdLanguage, MdDarkMode, MdLightMode, MdCloud, MdWaterDrop, MdAir } from 'react-icons/md';
import { UserOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Popover, Dropdown, Avatar, Menu, Space } from 'antd';

// API URL'sini tanımla (AuthContext ve Profile ile aynı olmalı)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = 'cddeafa68fd200c73758e521e81a82c7';
      const lat = 38.45;
      const lon = 27.20;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr`;

      try {
        setWeatherLoading(true);
        const response = await axios.get(url);
        setWeather(response.data);
      } catch (error) {
        console.error("Hava durumu verisi alınamadı:", error);
        setWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const handleLanguageChange = () => {
    const newLang = language === 'tr' ? 'en' : 'tr';
    changeLanguage(newLang);
    toast.success(newLang === 'tr' ? 'Dil Türkçe olarak değiştirildi' : 'Language changed to English');
  };

  const weatherDetailsContent = (
    <div className="text-sm">
      {weather ? (
        <ul className="space-y-1">
          <li className="capitalize font-medium">{weather.weather[0].description}</li>
          <li>Hissedilen: {Math.round(weather.main.feels_like)}°C</li>
          <li><MdWaterDrop className="inline mr-1 mb-0.5" /> Nem: {weather.main.humidity}%</li>
          <li><MdAir className="inline mr-1 mb-0.5" /> Rüzgar: {weather.wind.speed.toFixed(1)} m/s</li>
        </ul>
      ) : (
        <p>Detaylar yükleniyor...</p>
      )}
    </div>
  );

  const profileMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          label: (
            <Link to="/profile">
              Profilim
            </Link>
          ),
          icon: <UserOutlined />,
        },
        {
          key: 'logout',
          label: 'Çıkış Yap',
          icon: <MdLogout />,
          danger: true,
          onClick: () => {
            logout();
            toast.success(t('logout') + ' başarılı.');
            navigate('/login');
          }
        },
      ]}
    />
  );

  // Avatar için tam URL'yi oluştur
  const profilePictureFullUrl = user?.profilePictureUrl
    ? `${API_BASE_URL}${user.profilePictureUrl}`
    : null;

  return (
    <div className="h-24 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between px-4 md:px-6 lg:px-8 shadow-sm dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 dark:border-gray-700">
      {/* Sol taraf - Logo veya başlık */}
      <div className="flex items-center">
        <Link to="/welcome" className="text-xl font-bold text-blue-600 dark:text-blue-400">
          WADSS64
        </Link>
      </div>
      
      {/* Sağ taraf - Butonlar ve Hava Durumu */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Hava Durumu Göstergesi (Popover ile) */}
        <Popover content={weatherDetailsContent} title="Hava Durumu Detayları" trigger="hover" placement="bottomLeft">
          <div className="flex items-center mr-2 p-2 rounded-lg bg-white/30 dark:bg-black/20 shadow-sm cursor-pointer">
            {weatherLoading ? (
              <MdCloud className="w-5 h-5 text-gray-500 animate-pulse" />
            ) : weather ? (
              <>
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} 
                  alt={weather.weather[0].description}
                  className="w-6 h-6 mr-1"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {Math.round(weather.main.temp)}°C
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 hidden sm:inline">
                  {weather.name}
                </span>
              </>
            ) : (
              <MdCloud className="w-5 h-5 text-red-500" title="Hava durumu alınamadı" />
            )}
          </div>
        </Popover>

        {/* Tema Değiştirme Butonu */}
        <button
          onClick={toggleTheme}
          className="flex items-center px-3 md:px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-300 hover:scale-105 group"
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
          className="flex items-center px-3 md:px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-300 hover:scale-105 group"
          aria-label={language === 'tr' ? 'English' : 'Türkçe'}
        >
          <MdLanguage className="w-5 h-5 md:mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">{language === 'tr' ? 'ENGLISH' : 'TÜRKÇE'}</span>
        </button>

        <Link
          to="/contact"
          className="flex items-center px-3 md:px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-300 hover:scale-105 group"
        >
          <MdEmail className="w-5 h-5 md:mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">{t('contact')}</span>
        </Link>

        <Link
          to="/about"
          className="flex items-center px-3 md:px-4 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-300 hover:scale-105 group"
        >
          <MdInfo className="w-5 h-5 md:mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">{t('about')}</span>
        </Link>

        {/* Profil Dropdown */}
        <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
          <a onClick={e => e.preventDefault()} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50">
            <Space>
              <Avatar 
                src={profilePictureFullUrl} 
                icon={!profilePictureFullUrl ? <UserOutlined /> : null} 
                size="small" 
                className="border border-gray-300 dark:border-gray-600"
              /> 
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
                {user?.username || 'Kullanıcı'}
              </span>
            </Space>
          </a>
        </Dropdown>
      </div>
    </div>
  );
};

export default Navbar; 