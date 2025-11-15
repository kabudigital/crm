import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { User } from '../types';

interface AdminLayoutProps {
  user: User;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onLogout }) => {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
