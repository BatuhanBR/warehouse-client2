import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
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

const { Title, Text } = Typography;

const Welcome = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Saat bazlı selamlama
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Günaydın');
    } else if (hour < 18) {
      setGreeting('İyi günler');
    } else {
      setGreeting('İyi akşamlar');
    }
  }, []);

  const modules = [
    {
      title: 'Genel Durum',
      description: 'Genel durumu görüntüleyin',
      icon: <DashboardOutlined style={{ fontSize: 24 }} />,
      path: '/dashboard',
      color: '#1890ff'
    },
    {
      title: 'Ürünler',
      description: 'Ürünleri yönetin',
      icon: <ShopOutlined style={{ fontSize: 24 }} />,
      path: '/products',
      color: '#52c41a'
    },
    {
      title: 'Stok Hareketleri',
      description: 'Stok hareketlerini takip edin',
      icon: <SwapOutlined style={{ fontSize: 24 }} />,
      path: '/stock-movements',
      color: '#faad14'
    },
    {
      title: '3D Depo',
      description: '3D depo düzenini inceleyin',
      icon: <BoxPlotOutlined style={{ fontSize: 24 }} />,
      path: '/warehouse-3d',
      color: '#722ed1'
    },
    {
      title: 'Kullanıcılar',
      description: 'Kullanıcı hesaplarını yönetin',
      icon: <TeamOutlined style={{ fontSize: 24 }} />,
      path: '/users',
      color: '#eb2f96'
    },
    {
      title: 'İletişim',
      description: 'Destek ekibimizle iletişime geçin',
      icon: <MailOutlined style={{ fontSize: 24 }} />,
      path: '/contact',
      color: '#f5222d'
    }
  ];

  return (
    <div className="p-6">
      <Title level={2}>
        {greeting}, {user?.username || 'Hoş Geldiniz'}
      </Title>
      <Text className="text-gray-600 block mb-8">
        Depo Yönetim Sistemine hoş geldiniz. Deponuzu daha verimli ve düzenli yönetmek için aşağıdaki modülleri kullanabilirsiniz.
      </Text>
      
      <Row gutter={[16, 16]}>
        {modules.map((module, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card 
              hoverable 
              className="h-full"
              style={{ borderTop: `2px solid ${module.color}` }}
            >
              <div className="text-center mb-4" style={{ color: module.color }}>
                {module.icon}
              </div>
              <Title level={4} className="text-center mb-2">{module.title}</Title>
              <Text className="text-gray-600 block text-center mb-4">{module.description}</Text>
              <div className="text-center">
                <Link to={module.path}>
                  <Button type="primary" style={{ backgroundColor: module.color, borderColor: module.color }}>
                    Görüntüle
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      
      <div className="text-center text-gray-500 mt-8">
        © 2025 Depo Yönetim Sistemi. Tüm hakları saklıdır.
      </div>
    </div>
  );
};

export default Welcome; 