import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { User, ServiceOrder, ServiceOrderStatus } from '../types';
import TimeClock from '../components/TimeClock';
import { getFullServiceOrders } from '../data/mockData';
import { LoaderCircle } from 'lucide-react';

const statusText: { [key in ServiceOrderStatus]: string } = {
    [ServiceOrderStatus.AguardandoAgendamento]: 'Aguardando Agendamento',
    [ServiceOrderStatus.Agendada]: 'Agendada',
    [ServiceOrderStatus.EmExecucao]: 'Em Execução',
    [ServiceOrderStatus.AguardandoPeca]: 'Aguardando Peça',
    [ServiceOrderStatus.Concluida]: 'Concluída',
    [ServiceOrderStatus.Cancelada]: 'Cancelada',
};

const getStatusClass = (status: ServiceOrderStatus) => {
    switch (status) {
        case ServiceOrderStatus.AguardandoAgendamento: return 'border-l-4 border-blue-500';
        case ServiceOrderStatus.Agendada: return 'border-l-4 border-cyan-500';
        case ServiceOrderStatus.EmExecucao: return 'border-l-4 border-yellow-500';
        case ServiceOrderStatus.AguardandoPeca: return 'border-l-4 border-orange-500';
        default: return 'border-l-4 border-gray-400';
    }
};

const TechnicianDashboardPage: React.FC = () => {
  const context = useOutletContext<{ technician: User }>();
  const technician = context?.technician;
  const [assignedOrders, setAssignedOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!technician) {
      setLoading(false);
      return;
    }

    const fetchAssignedOrders = () => {
        setLoading(true);

        // MOCK LOGIC
        setTimeout(() => {
            const allOrders = getFullServiceOrders();
            const techOrders = allOrders.filter(o => 
                o.technician_id === technician.id &&
                o.status !== ServiceOrderStatus.Concluida &&
                o.status !== ServiceOrderStatus.Cancelada
            ).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            setAssignedOrders(techOrders as ServiceOrder[]);
            setLoading(false);
        }, 300);
    };

    fetchAssignedOrders();
  }, [technician]);
  
  if (!technician && !loading) {
    return (
        <div className="text-center p-10">
            <h1 className="text-xl font-bold text-red-500">Erro ao carregar dados do técnico.</h1>
            <p className="text-gray-600">Por favor, tente fazer login novamente.</p>
        </div>
    );
  }

  return (
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
                       <li key={order.id}>
                           <Link to={`/service-orders/${order.id}`} className={`block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow ${getStatusClass(order.status)}`}>
                               <div className="flex justify-between items-start">
                                   <div>
                                       <p className="font-bold text-brand-dark">{order.reported_problem}</p>
                                       <p className="text-sm text-gray-600">{order.customers?.name}</p>
                                   </div>
                                   <span className="text-xs font-semibold capitalize px-2 py-1 bg-gray-200 text-gray-800 rounded-full">{statusText[order.status]}</span>
                               </div>
                               <p className="text-right text-xs text-gray-400 mt-2">
                                   Aberta em: {new Date(order.created_at).toLocaleDateString()}
                               </p>
                           </Link>
                       </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 py-8">Você não tem nenhuma ordem de serviço pendente. Bom trabalho!</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboardPage;