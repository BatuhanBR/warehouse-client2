import React from 'react';
import { MdSecurity, MdSpeed, MdAutorenew, MdAnalytics } from 'react-icons/md';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const About = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();

  const features = [
    {
      icon: MdSecurity,
      titleKey: 'aboutFeatureSecureTitle',
      descriptionKey: 'aboutFeatureSecureDesc'
    },
    {
      icon: MdSpeed,
      titleKey: 'aboutFeatureFastTitle',
      descriptionKey: 'aboutFeatureFastDesc'
    },
    {
      icon: MdAutorenew,
      titleKey: 'aboutFeatureUpToDateTitle',
      descriptionKey: 'aboutFeatureUpToDateDesc'
    },
    {
      icon: MdAnalytics,
      titleKey: 'aboutFeatureAnalyticsTitle',
      descriptionKey: 'aboutFeatureAnalyticsDesc'
    }
  ];

  return (
    <div className={`max-w-4xl mx-auto py-8 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
      <div className="text-center mb-12">
        <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('aboutTitle')}
        </h1>
        <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('aboutDescription')}
        </p>
      </div>

      {/* Özellikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((feature, index) => (
          <div key={index} className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <feature.icon className={`w-12 h-12 mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t(feature.titleKey)}</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t(feature.descriptionKey)}</p>
          </div>
        ))}
      </div>

      {/* Misyon & Vizyon - Kartlara tema class'ları eklendi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('aboutMissionTitle')}</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('aboutMissionDesc')}
          </p>
        </div>

        <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('aboutVisionTitle')}</h2>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('aboutVisionDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About; 