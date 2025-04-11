import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, 
  MdInventory, 
  MdSwapHoriz,
  MdPeople,
  MdViewInAr,
  MdGridView,
  MdAttachMoney
} from 'react-icons/md';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const menuItems = [
    {
      title: theme === 'dark' ? 'WAREHOUSE MANAGEMENT' : 'DEPO YÖNETİM SİSTEMİ',
      isHeader: true
    },
    {
      title: t('dashboard').toUpperCase(),
      path: 'dashboard',
      icon: <MdDashboard className="w-6 h-6" />
    },
    {
      title: t('products').toUpperCase(),
      path: 'products',
      icon: <MdInventory className="w-6 h-6" />
    },
    {
      title: t('stockMovements').toUpperCase(),
      path: 'stock-movements',
      icon: <MdSwapHoriz className="w-6 h-6" />
    },
    {
      title: t('expenses').toUpperCase(),
      path: 'expenses',
      icon: <MdAttachMoney className="w-6 h-6" />
    },
    {
      title: t('users').toUpperCase(),
      path: 'users',
      icon: <MdPeople className="w-6 h-6" />
    },
    {
      title: t('warehouseView').toUpperCase(),
      path: 'warehouse-3d',
      icon: <MdViewInAr className="w-6 h-6" />
    },
    {
      title: 'ASCII ' + t('warehouseView').toUpperCase(),
      path: 'warehouse-ascii',
      icon: <MdGridView className="w-6 h-6" />
    }
  ];

  return (
    <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900 h-full shadow-xl border-r border-gray-700' : 'bg-gradient-to-br from-blue-50 to-indigo-50 h-full shadow-xl border-r border-blue-100'}`}>
      {menuItems.map((item, index) => (
        item.isHeader ? (
          <div key={index} className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-blue-100'}`}>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'}`}>
              {item.title}
            </h2>
          </div>
        ) : (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-4 border-b transition-all duration-300 group
              ${theme === 'dark' ? 'border-gray-700' : 'border-blue-100'}
              ${isActive 
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-800 to-indigo-900 text-white font-medium shadow-lg' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-lg'
                : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-800'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100'}`
            }
          >
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </div>
            <span className="ml-3 text-sm font-medium tracking-wide">{item.title}</span>
          </NavLink>
        )
      ))}
    </div>
  );
};

export default Sidebar; 