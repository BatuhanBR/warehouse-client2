import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, ConfigProvider, theme as antTheme } from 'antd';
import { Link } from 'react-router-dom';
import { 
  DashboardOutlined, 
  ShopOutlined, 
  SwapOutlined, 
  TeamOutlined, 
  MailOutlined,
  BoxPlotOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const { Title, Text } = Typography;

const Welcome = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();

  useEffect(() => {
    // Saat bazlı selamlama
    const hour = new Date().getHours();
    let greetingKey = 'goodEvening'; // Varsayılan
    if (hour < 12) {
      greetingKey = 'goodMorning';
    } else if (hour < 18) {
      greetingKey = 'goodAfternoon';
    }
    setGreeting(t(greetingKey));
  }, [t]);

  const modules = [
    {
      title: t('dashboard'),
      description: t('generalStatus'),
      icon: <DashboardOutlined style={{ fontSize: 24 }} />,
      path: '/dashboard',
      color: '#1890ff'
    },
    {
      title: t('products'),
      description: t('manageProducts'),
      icon: <ShopOutlined style={{ fontSize: 24 }} />,
      path: '/products',
      color: '#52c41a'
    },
    {
      title: t('stockMovements'),
      description: t('trackStock'),
      icon: <SwapOutlined style={{ fontSize: 24 }} />,
      path: '/stock-movements',
      color: '#faad14'
    },
    {
      title: t('warehouse3D'),
      description: t('view3D'),
      icon: <BoxPlotOutlined style={{ fontSize: 24 }} />,
      path: '/warehouse-3d',
      color: '#722ed1'
    },
    {
      title: t('users'),
      description: t('manageUsers'),
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
      path: '/users',
      color: '#eb2f96'
    },
    {
      title: t('contact'),
      description: t('contactUs'),
      icon: <MailOutlined style={{ fontSize: 24 }} />,
      path: '/contact',
      color: '#f5222d'
    }
  ];

  // Ant Design tema yapılandırması
  const antdThemeConfig = {
      algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <div className={`p-6 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Title level={2} className={`${isDark ? 'text-white' : 'text-black'}`}>
          {greeting}, {user?.username || t('welcome')}
        </Title>
        <Text className={`block mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {t('welcomeMessage')}
        </Text>
        
        <Row gutter={[16, 16]}>
          {modules.map((module, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card 
                hoverable 
                className={`h-full shadow-md ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                style={{ borderTop: `2px solid ${module.color}` }}
              >
                <div className="text-center mb-4" style={{ color: module.color }}>
                  {module.icon}
                </div>
                <Title level={4} className={`text-center mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{module.title}</Title>
                <Text className={`block text-center mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{module.description}</Text>
                <div className="text-center">
                  <Link to={module.path}>
                    <Button type="primary" style={{ backgroundColor: module.color, borderColor: module.color }}>
                      {t('view')}
                    </Button>
                  </Link>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
        
        <div className={`text-center mt-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {t('copyright')}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Welcome; 