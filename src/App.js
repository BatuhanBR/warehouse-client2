import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import StockMovements from './pages/StockMovements';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/stock-movements" element={<StockMovements />} />
          <Route path="/users" element={<Dashboard />} />
          <Route path="/3d-view" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}

export default App; 