import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdLogout, MdInfo, MdEmail } from 'react-icons/md';
import toast from 'react-hot-toast';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Başarıyla çıkış yapıldı');
    navigate('/login');
  };

  return (
    <div className="h-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-end px-4 md:px-6 lg:px-8 shadow-sm">
      {/* Sağ taraf - Butonlar */}
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to="/contact"
          className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all duration-300 hover:scale-105 group"
        >
          <MdEmail className="w-5 h-5 md:mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">İLETİŞİM</span>
        </Link>

        <Link
          to="/about"
          className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-100/50 rounded-lg transition-all duration-300 hover:scale-105 group"
        >
          <MdInfo className="w-5 h-5 md:mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="hidden md:inline">HAKKINDA</span>
        </Link>

        <div className="h-6 w-px bg-gradient-to-b from-blue-200 to-indigo-200 mx-2" />

        <button
          onClick={handleLogout}
          className="flex items-center px-3 md:px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-md group"
        >
          <MdLogout className="w-5 h-5 md:mr-2 group-hover:rotate-12 transition-transform" />
          <span className="hidden md:inline">ÇIKIŞ YAP</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar; 