import React from 'react';
import { Outlet } from 'react-router-dom';
import TechnicianHeader from './TechnicianHeader';
import { User } from '../types';

interface TechnicianLayoutProps {
  technician: User;
  onLogout: () => void;
}

const TechnicianLayout: React.FC<TechnicianLayoutProps> = ({ technician, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <TechnicianHeader technician={technician} onLogout={onLogout} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <Outlet context={technician} />
      </main>
    </div>
  );
};

export default TechnicianLayout;