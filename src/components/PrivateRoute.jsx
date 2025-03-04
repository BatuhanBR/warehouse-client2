import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = () => {
    const { user } = useAuth();
    
    // Debug için
    console.log("PrivateRoute rendered, user:", user);

    // Kullanıcı yoksa login'e yönlendir
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Kullanıcı varsa alt route'ları render et
    return <Outlet />;
};

export default PrivateRoute; 