import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ServiceOrdersPage from './pages/ServiceOrdersPage';
import ServiceOrderDetailPage from './pages/ServiceOrderDetailPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import TechniciansPage from './pages/TechniciansPage';
import NewCustomerPage from './pages/NewCustomerPage';
import NewTechnicianPage from './pages/NewTechnicianPage';
import NewServiceOrderPage from './pages/NewServiceOrderPage';
import AuthPage from './pages/AuthPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import { User, UserRole } from './types';
import AdminLayout from './components/AdminLayout';
import TechnicianLayout from './components/TechnicianLayout';
import { mockUsers } from './data/mockData';
import CampaignsPage from './pages/CampaignsPage';
import NewCampaignPage from './pages/NewCampaignPage';
import QuotesPage from './pages/QuotesPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import FinishServiceOrderPage from './pages/FinishServiceOrderPage';
import ContractsPage from './pages/ContractsPage';
import ContractDetailPage from './pages/ContractDetailPage';
import PmocLabelPage from './pages/PmocLabelPage';

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('loggedInUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    // This effect ensures data consistency for newly registered users after a page reload.
    if (loggedInUser) {
      const userExistsInMockData = mockUsers.some(user => user.id === loggedInUser.id);
      if (!userExistsInMockData) {
        mockUsers.push(loggedInUser);
      }
    }
  }, [loggedInUser]);

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
            <Route path="/service-orders/:id/finish" element={<FinishServiceOrderPage />} />
            <Route path="/service-orders/:id/label" element={<PmocLabelPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/customers/new" element={<NewCustomerPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/technicians/new" element={<NewTechnicianPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/new" element={<NewCampaignPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/contracts/:id" element={<ContractDetailPage />} />
          </Route>
        ) : (
          <Route element={<TechnicianLayout technician={loggedInUser} onLogout={handleLogout} />}>
            <Route path="/" element={<TechnicianDashboardPage />} />
            <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
            <Route path="/service-orders/:id/finish" element={<FinishServiceOrderPage />} />
            <Route path="/service-orders/:id/label" element={<PmocLabelPage />} />
          </Route>
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;