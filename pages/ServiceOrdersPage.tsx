import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, SlidersHorizontal, LoaderCircle } from 'lucide-react';
import { ServiceOrder, ServiceOrderStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

const getStatusClass = (status: ServiceOrderStatus) => {
    switch (status) {
        case ServiceOrderStatus.AguardandoAgendamento: return 'bg-blue-100 text-blue-800';
        case ServiceOrderStatus.Agendada: return 'bg-cyan-100 text-cyan-800';
        case ServiceOrderStatus.EmExecucao: return 'bg-yellow-100 text-yellow-800';
        case ServiceOrderStatus.AguardandoPeca: return 'bg-orange-100 text-orange-800';
        case ServiceOrderStatus.Concluida: return 'bg-green-100 text-green-800';
        case ServiceOrderStatus.Cancelada: return 'bg-red-100 text-red-800';
        case ServiceOrderStatus.Aprovado: return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const statusText: { [key in ServiceOrderStatus]: string } = {
    [ServiceOrderStatus.AguardandoAgendamento]: 'Aguardando Agendamento',
    [ServiceOrderStatus.Agendada]: 'Agendada',
    [ServiceOrderStatus.EmExecucao]: 'Em Execução',
    [ServiceOrderStatus.AguardandoPeca]: 'Aguardando Peça',
    [ServiceOrderStatus.Concluida]: 'Concluída',
    [ServiceOrderStatus.Cancelada]: 'Cancelada',
    [ServiceOrderStatus.Aprovado]: 'Aprovado',
};


const ServiceOrderCard: React.FC<{ order: ServiceOrder }> = ({ order }) => {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-brand-dark line-clamp-2">{order.reported_problem}</h3>
                    <span className={`text-center flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                        {statusText[order.status]}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{order.customers?.name || 'Cliente não encontrado'}</p>
                <p className="mt-4 text-sm text-gray-500 line-clamp-2">OS #{order.id} &bull; Criada em {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t flex justify-end items-center space-x-2">
                <Link to={`/service-orders/${order.id}`} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                    Ver Detalhes
                </Link>
            </div>
        </div>
    );
}

const ServiceOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        
        let query = supabase
            .from('service_orders')
            .select(`*, customers (*)`)
            .order('created_at', { ascending: false });

        if (statusFilter !== 'todos') {
            query = query.eq('status', statusFilter);
        }
        
        if (searchTerm) {
             query = query.or(`reported_problem.ilike.%${searchTerm}%,customers.name.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching service orders:', error);
        } else {
            setOrders(data as ServiceOrder[]);
        }

        setLoading(false);

    }, [searchTerm, statusFilter]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-1/2 lg:w-1/3">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="w-5 h-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar por OS, cliente ou problema..."
                        className="w-full py-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                     <select 
                        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="todos">Todos Status</option>
                        {Object.values(ServiceOrderStatus).map(status => (
                            <option key={status} value={status}>{statusText[status]}</option>
                        ))}
                    </select>
                    <button className="p-2 border rounded-lg hover:bg-gray-100">
                        <SlidersHorizontal size={20} />
                    </button>
                    <Link to="/service-orders/new" className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                        <Plus size={20} />
                        Nova O.S.
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center p-10"><LoaderCircle className="animate-spin h-8 w-8 text-brand-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map(order => (
                        <ServiceOrderCard key={order.id} order={order} />
                    ))}
                    {orders.length === 0 && <p className="text-center text-gray-500 md:col-span-2 lg:col-span-3">Nenhuma ordem de serviço encontrada.</p>}
                </div>
            )}
        </div>
    );
};

export default ServiceOrdersPage;