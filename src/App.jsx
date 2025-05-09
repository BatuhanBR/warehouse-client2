import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import StockMovements from './pages/StockMovements';
import Users from './pages/Users';
import Layout from './components/Layout';
import ProtectedRoute from './components/PrivateRoute';
import ForgotPassword from './pages/ForgotPassword';
import Welcome from './pages/Welcome';
import Contact from './pages/Contact';
import About from './pages/About';
import Warehouse3D from './pages/Warehouse3D';
import WarehouseASCII from './pages/WarehouseASCII';
import Expenses from './pages/Expenses';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';



function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes - Genel Giriş Kontrolü */}
            <Route element={<ProtectedRoute />}>
              {/* Layout içindeki tüm sayfalar giriş gerektirir */}
              <Route element={<Layout />}>
                {/* Sadece Admin'in erişebileceği sayfalar */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/users" element={<Users />} />
                </Route>
                
                {/* Tüm giriş yapmış kullanıcıların erişebileceği sayfalar */}
                <Route path="/products" element={<Products />} />
                <Route path="/stock-movements" element={<StockMovements />} />
                <Route path="/warehouse-3d" element={<Warehouse3D />} />
                <Route path="/warehouse-ascii" element={<WarehouseASCII />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
