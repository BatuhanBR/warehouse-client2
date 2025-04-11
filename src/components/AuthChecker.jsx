import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UnauthorizedAccess from './UnauthorizedAccess';
import { Spin } from 'antd';

const PrivateRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // AuthContext hala kullanıcı bilgisini yüklüyorsa bekle
    return (
        <div className="flex justify-center items-center h-screen">
            <Spin size="large" />
        </div>
    );
  }

  if (!user) {
    // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
    // Not: Bu kontrol App.jsx'te zaten yapılıyorsa burası gereksiz olabilir
    // return <Navigate to="/login" replace />;
    // Şimdilik, giriş yapmamışsa da yetkisiz erişim gösterelim
    return <UnauthorizedAccess message="Bu sayfayı görüntülemek için giriş yapmalısınız."/>;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Gerekli rol belirtilmişse ve kullanıcının rolü eşleşmiyorsa yetkisiz erişim göster
    return <UnauthorizedAccess message={`Bu sayfayı görüntülemek için '${requiredRole}' yetkisine sahip olmalısınız.`} />;
  }

  // Yetki varsa, altındaki rotayı (sayfa bileşenini) göster
  return <Outlet />;
};

export default PrivateRoute; 