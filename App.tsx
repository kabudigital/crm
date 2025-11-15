import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import CampaignsPage from './pages/CampaignsPage';
import NewCampaignPage from './pages/NewCampaignPage';
import QuotesPage from './pages/QuotesPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import FinishServiceOrderPage from './pages/FinishServiceOrderPage';
import ContractsPage from './pages/ContractsPage';
import ContractDetailPage from './pages/ContractDetailPage';
import PmocLabelPage from './pages/PmocLabelPage';
import EquipmentPmocHistoryPage from './pages/EquipmentPmocHistoryPage';
import { supabase } from './lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { LoaderCircle } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Fetch profile on login/token refresh
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => setUserProfile(profile));
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="animate-spin h-16 w-16 text-brand-primary" />
      </div>
    );
  }

  if (!session || !userProfile) {
    return <AuthPage />;
  }

  const isAdmin = userProfile.role === UserRole.Admin || userProfile.role === UserRole.Supervisor;

  return (
    <BrowserRouter>
      <Routes>
        {isAdmin ? (
          <Route element={<AdminLayout user={userProfile} onLogout={handleLogout} />}>
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
            <Route path="/equipment/:id/pmoc-history" element={<EquipmentPmocHistoryPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/technicians/new" element={<NewTechnicianPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/new" element={<NewCampaignPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/contracts/:id" element={<ContractDetailPage />} />
          </Route>
        ) : (
          <Route element={<TechnicianLayout technician={userProfile} onLogout={handleLogout} />}>
            <Route path="/" element={<TechnicianDashboardPage />} />
            <Route path="/service-orders/:id" element={<ServiceOrderDetailPage />} />
            <Route path="/service-orders/:id/finish" element={<FinishServiceOrderPage />} />
            <Route path="/service-orders/:id/label" element={<PmocLabelPage />} />
            <Route path="/equipment/:id/pmoc-history" element={<EquipmentPmocHistoryPage />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;