import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { DashboardOutlined, UserOutlined, ShopOutlined, InboxOutlined, EnvironmentOutlined, BoxPlotOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Layout = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      permission: 'users.view' // Dashboard'ı sadece users.view yetkisi olanlar görebilir
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Kullanıcılar',
      permission: 'users.view'
    },
    {
      key: 'products',
      icon: <ShopOutlined />,
      label: 'Ürünler',
      permission: 'products.view'
    },
    {
      key: 'stock',
      icon: <InboxOutlined />,
      label: 'Stok Hareketleri',
      permission: 'stock.view'
    },
    {
      key: 'locations',
      icon: <EnvironmentOutlined />,
      label: 'Lokasyonlar',
      permission: 'locations.view'
    },
    {
      key: 'warehouse-3d',
      icon: <BoxPlotOutlined />,
      label: '3D Depo Görünümü',
      path: '/warehouse-3d'
    }
  ];

  // Menü itemlerini filtreleme
  const filteredMenuItems = menuItems.filter(item => {
    // Kullanıcının yetkilerini kontrol et
    const userPermissions = user?.role?.permissions?.map(p => p.name) || [];
    return userPermissions.includes(item.permission);
  });

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <Navbar />
      <div className="flex flex-1">
        <div className="w-64 h-full">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout; 