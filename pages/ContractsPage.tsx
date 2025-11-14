import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, SlidersHorizontal, LoaderCircle } from 'lucide-react';
import { ServiceOrder, ServiceOrderStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

const getStatusClass = (status: ServiceOrder['status']) => {
    switch (status) {
        case ServiceOrderStatus.Open: return 'bg-blue-100 text-blue-800';
        case ServiceOrderStatus.InProgress: return 'bg-yellow-100 text-yellow-800';
        case ServiceOrderStatus.Completed: return 'bg-green-100 text-green-800';
        case ServiceOrderStatus.Canceled: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const statusText: { [key in ServiceOrderStatus]: string } = {
    [ServiceOrderStatus.Open]: 'Aberta',
    [ServiceOrderStatus.InProgress]: 'Em Andamento',
    [ServiceOrderStatus.Completed]: 'Concluída',
    [ServiceOrderStatus.Canceled]: 'Cancelada',
}

const ServiceOrderCard: React.FC<{ order: ServiceOrder }> = ({ order }) => {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-brand-dark">{order.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                        {statusText[order.status]}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{order.customers?.name || 'Cliente não encontrado'}</p>
                <p className="mt-4 text-sm text-gray-500 line-clamp-2">{order.description}</p>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t flex justify-end items-center space-x-2">
                <span className="text-xs text-gray-500">OS #{order.id}</span>
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
        let query = supabase.from('service_orders').select('*, customers(name)');
        
        if (statusFilter !== 'todos') {
            query = query.eq('status', statusFilter);
        }
        
        if (searchTerm) {
            // This requires a GIN index on customers.name for performance.
            // For simplicity here, we'll do a simple text search on the title.
            // A more complex search might involve an RPC function in Supabase.
            query = query.ilike('title', `%${searchTerm}%`);
        }
        
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;
        if (data) {
            setOrders(data);
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
                        placeholder="Buscar por título..."
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
                        <option value={ServiceOrderStatus.Open}>Aberta</option>
                        <option value={ServiceOrderStatus.InProgress}>Em Andamento</option>
                        <option value={ServiceOrderStatus.Completed}>Concluída</option>
                        <option value={ServiceOrderStatus.Canceled}>Cancelada</option>
                    </select>
                    <button className="p-2 border rounded-lg hover:bg-gray-100">
                        <SlidersHorizontal size={20} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                        <Plus size={20} />
                        Nova O.S.
                    </button>
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