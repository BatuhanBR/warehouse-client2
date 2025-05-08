import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UnauthorizedAccess from './UnauthorizedAccess';
import { Spin } from 'antd';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        ); 
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex justify-center items-center h-full">
                <UnauthorizedAccess 
                    message={`Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz. (Gereken: ${allowedRoles.join(' veya ')})`}
                />
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute; 