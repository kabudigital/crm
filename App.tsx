import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ServiceOrdersPage from './pages/ContractsPage';
import ServiceOrderDetailPage from './pages/ContractDetailPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import TechniciansPage from './pages/UsersPage';
import NewCustomerPage from './pages/NewCustomerPage';
import NewTechnicianPage from './pages/NewTechnicianPage';
import NewServiceOrderPage from './pages/NewServiceOrderPage';
import AuthPage from './pages/AuthPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import { User, UserRole } from './types';
import AdminLayout from './components/AdminLayout';
import TechnicianLayout from './components/TechnicianLayout';

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
      <Routes>
        {isAdmin ? (
          <Route element={<AdminLayout user={loggedInUser} onLogout={handleLogout} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/service-orders" element={<ServiceOrdersPage />} />
            <Route path="/service-orders/new" element={<NewServiceOrderPage />} />
            <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/customers/new" element={<NewCustomerPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/technicians/new" element={<NewTechnicianPage />} />
          </Route>
        ) : (
          <Route element={<TechnicianLayout technician={loggedInUser} onLogout={handleLogout} />}>
            <Route path="/" element={<TechnicianDashboardPage />} />
            <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
          </Route>
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;
