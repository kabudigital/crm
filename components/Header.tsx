
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
    const location = useLocation();
    const getPageTitle = () => {
        const path = location.pathname.split('/')[1];
        if (!path) return 'Dashboard';
        
        switch (path) {
            case 'service-orders':
                return 'Ordens de Serviço';
            case 'customers':
                return 'Clientes';
            case 'technicians':
                return 'Técnicos';
            default:
                return path.charAt(0).toUpperCase() + path.slice(1);
        }
    }
  return (
    <header className="flex items-center justify-between p-4 bg-white border-b h-16">
      <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
      <div className="flex items-center space-x-4">
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-brand-primary"
            type="text"
            placeholder="Search..."
          />
        </div>
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-600 focus:outline-none">
          <Bell className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
