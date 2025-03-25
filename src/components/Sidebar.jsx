import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  MdDashboard, 
  MdInventory, 
  MdSwapHoriz,
  MdPeople,
  MdViewInAr,
  MdGridView
} from 'react-icons/md';

const menuItems = [
  {
    title: 'DEPO YÖNETİM SİSTEMİ',
    isHeader: true
  },
  {
    title: 'DASHBOARDLAR',
    path: 'dashboard',
    icon: <MdDashboard className="w-6 h-6" />
  },
  {
    title: 'ÜRÜNLER',
    path: 'products',
    icon: <MdInventory className="w-6 h-6" />
  },
  {
    title: 'STOCK HAREKETLERİ',
    path: 'stock-movements',
    icon: <MdSwapHoriz className="w-6 h-6" />
  },
  {
    title: 'KULLANICILAR',
    path: 'users',
    icon: <MdPeople className="w-6 h-6" />
  },
  {
    title: '3D DEPO GÖRÜNÜMÜ',
    path: 'warehouse-3d',
    icon: <MdViewInAr className="w-6 h-6" />
  },
  {
    title: 'ASCII DEPO GÖRÜNÜMÜ',
    path: 'warehouse-ascii',
    icon: <MdGridView className="w-6 h-6" />
  }
];

const Sidebar = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 h-full shadow-xl border-r border-blue-100">
      {menuItems.map((item, index) => (
        item.isHeader ? (
          <div key={index} className="p-6 border-b border-blue-100">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {item.title}
            </h2>
          </div>
        ) : (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-4 border-b border-blue-100 transition-all duration-300 group
              ${isActive 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-lg' 
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-100 hover:to-indigo-100'}`
            }
          >
            <div className="transform transition-transform duration-300 group-hover:scale-110">
              {item.icon}
            </div>
            <span className="ml-3 text-sm font-medium tracking-wide">{item.title}</span>
          </NavLink>
        )
      ))}
    </div>
  );
};

export default Sidebar; 