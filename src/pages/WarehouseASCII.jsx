import React from 'react';
import WarehouseASCIIView from '../components/WarehouseASCIIView';
import { useTheme } from '../contexts/ThemeContext';

const WarehouseASCII = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    return (
        <div style={{ 
            backgroundColor: isDark ? '#111827' : '#f9fafb',
            minHeight: 'calc(100vh - 64px)'
        }}>
            <WarehouseASCIIView />
        </div>
    );
};

export default WarehouseASCII; 