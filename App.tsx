import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import ServiceOrdersPage from './pages/ContractsPage';
import ServiceOrderDetailPage from './pages/ContractDetailPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import TechniciansPage from './pages/UsersPage';
import NewCustomerPage from './pages/NewCustomerPage';
import NewTechnicianPage from './pages/NewTechnicianPage';
import AuthPage from './pages/AuthPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('loggedInUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (user: User) => {
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));
    setLoggedInUser(user);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser');
    setLoggedInUser(null);
  };
  
  const handleRegister = (user: User) => {
     sessionStorage.setItem('loggedInUser', JSON.stringify(user));
     setLoggedInUser(user);
  };

  if (!loggedInUser) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  const isAdmin = loggedInUser.role === UserRole.Admin || loggedInUser.role === UserRole.Supervisor;

  return (
    <HashRouter>
      {isAdmin ? (
        <div className="flex h-screen bg-gray-100 font-sans">
          <Sidebar user={loggedInUser} onLogout={handleLogout} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/service-orders" element={<ServiceOrdersPage />} />
                <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                <Route path="/customers/new" element={<NewCustomerPage />} />
                <Route path="/technicians" element={<TechniciansPage />} />
                <Route path="/technicians/new" element={<NewTechnicianPage />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <TechnicianDashboardPage technician={loggedInUser} onLogout={handleLogout} />
      )}
    </HashRouter>
  );
};

export default App;