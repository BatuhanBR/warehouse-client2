import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HomeOutlined, 
  ShoppingOutlined, 
  SwapOutlined, 
  AppstoreOutlined, 
  UserOutlined, 
  BarcodeOutlined,
  DatabaseOutlined,
  BoxPlotOutlined,
  BarChartOutlined,
  ContactsOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Welcome = () => {
  const [username, setUsername] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const { theme } = useTheme();
  const { language, t } = useLanguage();

  useEffect(() => {
    // Kullanıcı adını al
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUsername(user.name || '');
    
    // Günün saatine göre selamlama mesajı
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setTimeOfDay(t('goodMorning'));
    else if (hour >= 12 && hour < 18) setTimeOfDay(t('goodAfternoon'));
    else setTimeOfDay(t('goodEvening'));
  }, [language, t]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300 } }
  };

  const menuItems = [
    {
      title: t('dashboard'),
      description: t('generalStatus'),
      path: '/dashboard',
      icon: <BarChartOutlined style={{ fontSize: '24px', color: theme === 'dark' ? '#1890ff' : '#1890ff' }} />
    },
    {
      title: t('products'),
      description: t('manageProducts'),
      path: '/products',
      icon: <ShoppingOutlined style={{ fontSize: '24px', color: theme === 'dark' ? '#52c41a' : '#52c41a' }} />
    },
    {
      title: t('stockMovements'),
      description: t('trackStock'),
      path: '/stock-movements',
      icon: <SwapOutlined style={{ fontSize: '24px', color: theme === 'dark' ? '#faad14' : '#faad14' }} />
    },
    {
      title: t('warehouseView'),
      description: t('view3D'),
      path: '/warehouse-3d',
      icon: <BoxPlotOutlined style={{ fontSize: '24px', color: theme === 'dark' ? '#722ed1' : '#722ed1' }} />
    },
    {
      title: t('users'),
      description: t('manageUsers'),
      path: '/users',
      icon: <UserOutlined style={{ fontSize: '24px', color: theme === 'dark' ? '#eb2f96' : '#eb2f96' }} />
    },
    {
      title: t('contact'),
      description: t('contactUs'),
      path: '/contact',
      icon: <ContactsOutlined style={{ fontSize: '24px', color: theme === 'dark' ? '#13c2c2' : '#13c2c2' }} />
    }
  ];

  return (
    <div className={`py-8 px-4 sm:px-8 min-h-[calc(100vh-64px)] ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl md:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}
          >
            {username ? `${username}, ${timeOfDay}!` : t('welcome')}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}
          >
            {t('welcomeMessage')}
          </motion.p>
        </div>
        
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {menuItems.map((item, index) => (
            <motion.div 
              key={index} 
              variants={item}
              whileHover={{ 
                y: -10, 
                boxShadow: theme === 'dark' 
                  ? '0 10px 25px -5px rgba(30, 58, 138, 0.3), 0 8px 10px -6px rgba(30, 58, 138, 0.3)' 
                  : '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)' 
              }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link
                to={item.path}
                className={`flex flex-col h-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden shadow-lg hover:border-blue-500 border-2 border-transparent transition-all duration-300`}
              >
                <div className="p-8 flex flex-col h-full">
                  <div className="mb-6 flex items-center">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'} mr-4`}>
                      {item.icon}
                    </div>
                    <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h2>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} flex-grow`}>{item.description}</p>
                  <div className="mt-6 text-blue-600 font-medium flex items-center">
                    {t('view')}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-1" 
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-16 text-center"
      >
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('copyright')}
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome; 