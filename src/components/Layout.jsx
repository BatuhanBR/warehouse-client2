import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { DashboardOutlined, UserOutlined, ShopOutlined, InboxOutlined, EnvironmentOutlined, BoxPlotOutlined, MessageOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FloatButton, Drawer } from 'antd';
import DSSChatbot from './DSSChatbot';

const Layout = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <div className="w-64 h-full">
          <Sidebar />
        </div>
        <main className={`flex-1 overflow-x-hidden p-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
          <Outlet />
        </main>
      </div>
      <Footer />

      {/* Karar Destek Chatbot Butonu ve Drawer'ı */}
      {user && ( // Sadece kullanıcı giriş yaptıysa göster
        <>
          <FloatButton 
            icon={<MessageOutlined />} 
            tooltip="Karar Destek Asistanı" 
            type="primary" 
            style={{ right: 24, bottom: 100 }} // Konumlandırma (Footer'ı hesaba kat)
            onClick={() => setIsChatDrawerOpen(true)} 
          />
          <Drawer
            title="Karar Destek Asistanı"
            placement="right"
            onClose={() => setIsChatDrawerOpen(false)}
            open={isChatDrawerOpen}
            width={450} // Drawer genişliği
            bodyStyle={{ padding: 0 }} // Chatbot kendi padding'ini yönetebilir
            // Drawer'ın theme uyumu için gerekirse className ekleyebiliriz
          >
            <DSSChatbot />
          </Drawer>
        </>
      )}
    </div>
  );
};

export default Layout; 