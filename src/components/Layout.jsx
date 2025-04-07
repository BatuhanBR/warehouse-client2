import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
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
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-100/50 to-indigo-100/50'}`}>
      {/* Sidebar - Mobilde gizli */}
      <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <div className={`${theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm shadow-xl' : 'bg-white/80 backdrop-blur-sm shadow-xl'} rounded-xl p-4 md:p-6 min-h-[calc(100vh-8rem)]`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 