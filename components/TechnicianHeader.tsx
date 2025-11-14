
import React from 'react';
import { LogOut } from 'lucide-react';
import { User } from '../types';

interface TechnicianHeaderProps {
  technician: User;
  onLogout: () => void;
}

const TechnicianHeader: React.FC<TechnicianHeaderProps> = ({ technician, onLogout }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-brand-dark text-white shadow-md h-16">
      <h1 className="text-xl font-bold">Portal do Técnico</h1>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="font-semibold">{technician.name}</p>
          <p className="text-xs text-gray-300">Técnico</p>
        </div>
        <img
          className="h-10 w-10 rounded-full"
          src={`https://i.pravatar.cc/40?u=${technician.email}`}
          alt="Avatar do Técnico"
        />
        <button
          onClick={onLogout}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          title="Sair"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default TechnicianHeader;
