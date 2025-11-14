import React, { useState, useEffect } from 'react';
import { User, ServiceOrder, ServiceOrderStatus } from '../types';
import TechnicianHeader from '../components/TechnicianHeader';
import TimeClock from '../components/TimeClock';
import { supabase } from '../lib/supabaseClient';
import { LoaderCircle } from 'lucide-react';

interface TechnicianDashboardPageProps {
  technician: User;
  onLogout: () => void;
}

const getStatusClass = (status: ServiceOrder['status']) => {
    switch (status) {
        case ServiceOrderStatus.Open: return 'border-l-4 border-blue-500';
        case ServiceOrderStatus.InProgress: return 'border-l-4 border-yellow-500';
        case ServiceOrderStatus.Completed: return 'border-l-4 border-green-500';
        case ServiceOrderStatus.Canceled: return 'border-l-4 border-red-500';
        default: return 'border-l-4 border-gray-400';
    }
};

const TechnicianDashboardPage: React.FC<TechnicianDashboardPageProps> = ({ technician, onLogout }) => {
  const [assignedOrders, setAssignedOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('service_orders')
            .select('*, customers(name)')
            .eq('technician_id', technician.id)
            .neq('status', ServiceOrderStatus.Completed)
            .neq('status', ServiceOrderStatus.Canceled)
            .order('created_at', { ascending: true });

        if (data) {
            setAssignedOrders(data);
        }
        setLoading(false);
    };

    fetchAssignedOrders();
  }, [technician.id]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <TechnicianHeader technician={technician} onLogout={onLogout} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
             <TimeClock />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-brand-dark mb-4">Minhas Ordens de Serviço Abertas</h2>
                {loading ? (
                    <div className="flex justify-center items-center p-10"><LoaderCircle className="animate-spin h-8 w-8 text-brand-primary" /></div>
                ) : assignedOrders.length > 0 ? (
                    <ul className="space-y-4">
                        {assignedOrders.map(order => (
                           <li key={order.id} className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow ${getStatusClass(order.status)}`}>
                               <div className="flex justify-between items-start">
                                   <div>
                                       <p className="font-bold text-brand-dark">{order.title}</p>
                                       <p className="text-sm text-gray-600">{order.customers?.name}</p>
                                   </div>
                                   <span className="text-xs font-semibold capitalize px-2 py-1 bg-gray-200 text-gray-800 rounded-full">{order.status.replace('_', ' ')}</span>
                               </div>
                               <p className="mt-2 text-sm text-gray-500">{order.description}</p>
                               <p className="text-right text-xs text-gray-400 mt-2">
                                   Aberta em: {new Date(order.created_at).toLocaleDateString()}
                               </p>
                           </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 py-8">Você não tem nenhuma ordem de serviço pendente. Bom trabalho!</p>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechnicianDashboardPage;