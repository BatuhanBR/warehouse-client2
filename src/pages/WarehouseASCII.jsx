import React from 'react';
import WarehouseASCIIView from '../components/WarehouseASCIIView';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const WarehouseASCII = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDark = theme === 'dark';
    
    return (
        <div className={`h-full ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
            <div className="mb-4">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>ASCII Depo Görünümü</h1>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Depo raflarının basit metin tabanlı görünümü</p>
            </div>
            <div className={`rounded-lg shadow-lg p-4 ${isDark ? 'bg-gray-800 shadow-gray-800' : 'bg-white shadow-gray-200'}`}>
                <WarehouseASCIIView isDark={isDark} />
            </div>
        </div>
    );
};

export default WarehouseASCII; 