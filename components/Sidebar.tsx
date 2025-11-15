import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Wrench, ChevronLeft, ChevronRight, Building, LogOut, Megaphone, ClipboardList, FileSignature } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/service-orders', icon: FileText, label: 'Ordens de Serviço' },
    { to: '/customers', icon: Building, label: 'Clientes' },
    { to: '/technicians', icon: Wrench, label: 'Técnicos' },
    { to: '/quotes', icon: ClipboardList, label: 'Orçamentos' },
    { to: '/contracts', icon: FileSignature, label: 'Contratos' },
    { to: '/campaigns', icon: Megaphone, label: 'Campanhas' },
  ];

  return (
    <div className={`transition-all duration-300 bg-brand-dark text-white flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
        {!isCollapsed && <h1 className="text-xl font-bold">CRM OS</h1>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-full hover:bg-gray-700">
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-brand-primary text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span className="ml-4 font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
           {user.email && <img className="h-10 w-10 rounded-full" src={`https://i.pravatar.cc/40?u=${user.email}`} alt="User Avatar" />}
           {!isCollapsed && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
           )}
            <button onClick={onLogout} className={`p-2 rounded-full hover:bg-gray-700 ${isCollapsed ? 'ml-0' : 'ml-2'}`}>
                <LogOut size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;