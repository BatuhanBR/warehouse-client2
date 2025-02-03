import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  MdDashboard, 
  MdInventory, 
  MdShowChart,
  MdPeople,
  MdMenu,
  MdClose,
  MdLogout,
  MdInfo,
  MdEmail
} from 'react-icons/md';

const menuItems = [
  { path: '/dashboard', icon: MdDashboard, label: 'DASHBOARDLAR' },
  { path: '/products', icon: MdInventory, label: 'ÜRÜNLER' },
  { path: '/stock-movements', icon: MdShowChart, label: 'STOCK HAREKETLERİ' },
  { path: '/users', icon: MdPeople, label: 'KULLANICILAR' },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-primary-100 to-white">
      {/* Sidebar */}
      <div 
        className={`fixed lg:static lg:block z-30 h-full transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
      >
        <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm border-r shadow-lg">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b bg-gradient-to-r from-primary-600 to-primary-500">
            <h1 className={`text-xl font-bold text-white transition-all duration-300 
              ${!sidebarOpen && 'lg:hidden'}`}>
              DYS
            </h1>
            <span className={`hidden text-white ${!sidebarOpen && 'lg:block'}`}>DYS</span>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-primary-50 transition-colors
                  ${location.pathname === item.path ? 'bg-primary-100 border-r-4 border-primary-600 text-primary-700' : ''}`}
              >
                <item.icon className={`w-6 h-6 ${
                  location.pathname === item.path ? 'text-primary-600' : 'text-gray-500'
                }`} />
                <span className={`ml-3 ${!sidebarOpen && 'lg:hidden'}`}>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-16 px-6 bg-white/90 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </button>
            
            {/* Breadcrumb veya Sayfa Başlığı */}
            <div className="hidden md:flex items-center ml-4">
              <span className="text-lg font-semibold text-gray-700">
                {menuItems.find(item => item.path === location.pathname)?.label || 'HOŞ GELDİNİZ'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/contact"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 rounded-lg transition-all duration-200 group"
            >
              <MdEmail className="w-5 h-5 mr-2 text-gray-400 group-hover:text-primary-600" />
              <span className="hidden sm:inline">İLETİŞİM</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 rounded-lg transition-all duration-200 group"
            >
              <MdInfo className="w-5 h-5 mr-2 text-gray-400 group-hover:text-primary-600" />
              <span className="hidden sm:inline">HAKKINDA</span>
            </Link>
            
            {/* Ayırıcı Çizgi */}
            <div className="h-6 w-px bg-gray-200"></div>
            
            {/* Profil ve Çıkış */}
            <div className="relative group">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <MdLogout className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">ÇIKIŞ</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 