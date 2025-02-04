import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100/50 to-indigo-100/50">
      {/* Sidebar - Mobilde gizli */}
      <div className="hidden md:block md:w-64 lg:w-72 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-xl p-4 md:p-6 min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 