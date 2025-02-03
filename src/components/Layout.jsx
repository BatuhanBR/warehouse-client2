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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar */}
      <div 
        className={`fixed lg:static lg:block z-30 h-full transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
      >
        <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm border-r shadow-lg">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b bg-gradient-to-r from-blue-600 to-purple-600">
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
                className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50/50 transition-colors
                  ${location.pathname === item.path ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-r-4 border-blue-600 text-blue-700' : ''}`}
              >
                <item.icon className={`w-6 h-6 ${
                  location.pathname === item.path ? 'text-blue-600' : 'text-gray-500'
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
        <header className="flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-sm border-b shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {sidebarOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
              <MdEmail className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">İLETİŞİM</span>
            </button>
            <button className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors">
              <MdInfo className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">HAKKINDA</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <MdLogout className="w-5 h-5 mr-1" />
              <span className="hidden sm:inline">ÇIKIŞ</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-transparent">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 