import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ServiceOrdersPage from './pages/ServiceOrdersPage';
import ServiceOrderDetailPage from './pages/ServiceOrderDetailPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import TechniciansPage from './pages/TechniciansPage';
import NewCustomerPage from './pages/NewCustomerPage';
import NewTechnicianPage from './pages/NewTechnicianPage';
import NewServiceOrderPage from './pages/NewServiceOrderPage';
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
import NewContractPage from './pages/NewContractPage';
import PmocLabelPage from './pages/PmocLabelPage';
import EquipmentPmocHistoryPage from './pages/EquipmentPmocHistoryPage';
import NewEquipmentPage from './pages/NewEquipmentPage';
import PmocPlanPage from './pages/PmocPlanPage';
import PmocPage from './pages/PmocPage'; // Import PmocPage
import AuthPage from './pages/AuthPage'; 
import { LoaderCircle } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session (Supabase v2)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email!, session.user.user_metadata);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for auth changes (Supabase v2)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email!, session.user.user_metadata);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, email: string, metadata: any) => {
      try {
          // Try to fetch from 'users' table first
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

          if (data) {
              setUserProfile(data as User);
          } else {
              // If user is in Auth but not in public.users (first login or auto-created), create/sync it
              const role = metadata?.role || UserRole.Technician;
              const name = metadata?.name || email.split('@')[0];
              
              const newUser: User = {
                  id: userId,
                  email: email,
                  name: name,
                  role: role,
                  phone: metadata?.phone || ''
              };

              // Attempt to insert into public.users
              const { error: insertError } = await supabase.from('users').upsert(newUser);
              
              if (insertError) {
                  console.warn("Could not sync user to public table, using session metadata.", insertError);
              }
              
              setUserProfile(newUser);
          }
      } catch (error) {
          console.error("Error fetching user profile:", error);
      } finally {
          setLoading(false);
      }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setSession(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen flex-col gap-4">
        <LoaderCircle className="animate-spin h-16 w-16 text-brand-primary" />
        <p className="text-gray-500">Conectando ao sistema...</p>
      </div>
    );
  }

  // If not authenticated, show Auth Page
  if (!session || !userProfile) {
      return <AuthPage />;
  }

  const isAdmin = userProfile.role === UserRole.Admin || userProfile.role === UserRole.Supervisor;

  return (
    <HashRouter>
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
            <Route path="/customers/:customerId/equipments/new" element={<NewEquipmentPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="/equipment/:id/pmoc-history" element={<EquipmentPmocHistoryPage />} />
            <Route path="/technicians" element={<TechniciansPage />} />
            <Route path="/technicians/new" element={<NewTechnicianPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/new" element={<NewCampaignPage />} />
            <Route path="/quotes" element={<QuotesPage />} />
            <Route path="/pmoc" element={<PmocPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/contracts/new" element={<NewContractPage />} />
            <Route path="/contracts/:id" element={<ContractDetailPage />} />
            <Route path="/contracts/:id/pmoc" element={<PmocPlanPage />} />
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
        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;