import React from 'react';
import WarehouseView3D from '../components/WarehouseView3D';
// ThemeContext ve LanguageContext kullanımını kaldırıyorum
// import { useTheme } from '../contexts/ThemeContext';
// import { useLanguage } from '../contexts/LanguageContext';

const Warehouse3D = () => {
  // Sabit tema ve dil kullanımı
  // const { theme } = useTheme();
  // const { t } = useLanguage();
  
  return (
    <div>
      <WarehouseView3D />
    </div>
  );
};

export default Warehouse3D; 