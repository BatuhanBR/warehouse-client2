import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdLogout, MdInfo, MdEmail, MdLanguage, MdDarkMode, MdLightMode, MdCloud, MdWaterDrop, MdAir } from 'react-icons/md';
import { UserOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Popover, Dropdown, Avatar, Menu, Space, Button, Tooltip } from 'antd';
import { WifiOutlined, CloudOutlined, SettingOutlined, LogoutOutlined, SunOutlined, MoonOutlined, GlobalOutlined } from '@ant-design/icons';

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
    <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-700 border-b border-blue-100 flex items-center justify-between px-4 md:px-6 lg:px-8 shadow-md dark:bg-gradient-to-r dark:from-gray-700 dark:to-gray-900 dark:border-gray-600">
      {/* Sol taraf - Logo veya başlık */}
      <div className="flex items-center">
        <Link to="/welcome" className="text-xl font-bold text-white dark:text-blue-300">
          WADSS64
        </Link>
      </div>
      
      {/* Sağ taraf - Butonlar, Dil, Tema, Kullanıcı */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Hava Durumu Göstergesi (Popover ile) */}
        <Popover content={weatherDetailsContent} title="Hava Durumu Detayları" trigger="hover" placement="bottomLeft">
          <div className="flex items-center mr-2 p-2 rounded-lg bg-white/20 dark:bg-black/20 shadow-sm cursor-pointer">
            {weatherLoading ? (
              <MdCloud className="w-5 h-5 text-white/70 animate-pulse" />
            ) : weather ? (
              <>
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`} 
                  alt={weather.weather[0].description}
                  className="w-6 h-6 mr-1"
                />
                <span className="text-sm font-medium text-white dark:text-gray-200">
                  {Math.round(weather.main.temp)}°C
                </span>
                <span className="text-xs text-white/80 dark:text-gray-300 ml-2 hidden sm:inline">
                  {weather.name}
                </span>
              </>
            ) : (
              <MdCloud className="w-5 h-5 text-red-300" title="Hava durumu alınamadı" />
            )}
          </div>
        </Popover>

        {/* Dil Değiştirme Butonları */}
        <Tooltip title={language === 'tr' ? 'Switch to English' : 'Türkçe\'ye Geç'}>
          <Button 
            shape="circle"
            icon={<GlobalOutlined />} 
            onClick={() => changeLanguage(language === 'tr' ? 'en' : 'tr')} 
            className={`${theme === 'dark' ? 'text-white bg-gray-700 hover:bg-gray-600 border-gray-600' : 'text-gray-600 bg-white hover:bg-gray-100 border-gray-300'}`}
          />
        </Tooltip>

        {/* Tema Değiştirme Butonu */}
        <Tooltip title={theme === 'dark' ? 'Açık Mod' : 'Karanlık Mod'}>
          <Button 
            shape="circle"
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            className={`${theme === 'dark' ? 'text-yellow-300 bg-gray-700 hover:bg-gray-600 border-gray-600' : 'text-blue-500 bg-white hover:bg-gray-100 border-gray-300'}`}
          />
        </Tooltip>

        <Link
          to="/contact"
          className="flex items-center px-3 md:px-4 py-4 text-sm font-medium text-white dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all duration-200 group"
        >
          <MdEmail className="w-5 h-5 md:mr-2 group-hover:text-blue-300 transition-colors" />
          <span className="hidden md:inline">{t('contact')}</span>
        </Link>

        <Link
          to="/about"
          className="flex items-center px-3 md:px-4 py-4 text-sm font-medium text-white dark:text-gray-200 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-all duration-200 group"
        >
          <MdInfo className="w-5 h-5 md:mr-2 group-hover:text-blue-300 transition-colors" />
          <span className="hidden md:inline">{t('about')}</span>
        </Link>

        {/* Profil Dropdown */}
        <Dropdown overlay={profileMenu} trigger={['click']} placement="bottomRight">
          <a onClick={e => e.preventDefault()} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-white/10 dark:hover:bg-white/5">
            <Space>
              <Avatar 
                src={profilePictureFullUrl} 
                icon={!profilePictureFullUrl ? <UserOutlined /> : null} 
                size="small" 
                className="border border-white/50 dark:border-gray-500"
              /> 
              <span className="text-sm font-medium text-white dark:text-gray-200 hidden md:inline">
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