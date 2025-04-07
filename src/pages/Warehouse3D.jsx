import React from 'react';
import WarehouseView3D from '../components/WarehouseView3D';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Warehouse3D = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const isDark = theme === 'dark';

    return (
        <div className={`h-full ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
            <div className="mb-4">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>3D Depo Görünümü</h1>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Depo raflarının 3 boyutlu görünümü</p>
            </div>
            <div className={`rounded-lg shadow-lg p-4 h-[calc(100vh-200px)] ${isDark ? 'bg-gray-800 shadow-gray-800' : 'bg-white shadow-gray-200'}`}>
                <WarehouseView3D />
            </div>
        </div>
    );
};

export default Warehouse3D; 