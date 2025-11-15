import React, { useState, useEffect } from 'react';
import { FileText, Building, Wrench, Users, Plus, LoaderCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';
import { ServiceOrder, ServiceOrderStatus, Customer, User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

const serviceData = [
    { month: 'Jan', count: 12 },
    { month: 'Fev', count: 19 },
    { month: 'Mar', count: 15 },
    { month: 'Abr', count: 25 },
    { month: 'Mai', count: 22 },
    { month: 'Jun', count: 30 },
];

const DashboardPage: React.FC = () => {
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: soData, error: soError } = await supabase
                .from('service_orders')
                .select('*, customers(name)');
            const { data: customerData, error: customerError } = await supabase.from('customers').select('*');
            const { data: userData, error: userError } = await supabase.from('users').select('*');

            if (soData) setServiceOrders(soData as ServiceOrder[]);
            if (customerData) setCustomers(customerData);
            if (userData) {
                setUsers(userData);
                setTechnicians(userData.filter(u => u.role === UserRole.Technician));
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    const openOrders = serviceOrders.filter(so => so.status !== ServiceOrderStatus.Concluida && so.status !== ServiceOrderStatus.Cancelada).length;
    const upcomingServiceOrders = serviceOrders
      .filter(so => so.status !== ServiceOrderStatus.Concluida && so.status !== ServiceOrderStatus.Cancelada)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 3);
      
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<FileText className="h-8 w-8 text-brand-primary" />} title="Ordens Abertas" value={openOrders} />
                <StatCard icon={<Building className="h-8 w-8 text-brand-primary" />} title="Clientes Ativos" value={customers.length} />
                <StatCard icon={<Wrench className="h-8 w-8 text-brand-primary" />} title="Técnicos" value={technicians.length} />
                <StatCard icon={<Users className="h-8 w-8 text-brand-primary" />} title="Usuários" value={users.length} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Serviços por Mês</h3>
                    <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer>
                          <BarChart data={serviceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="month" tick={{ fill: '#6B7280' }} />
                              <YAxis tick={{ fill: '#6B7280' }} />
                              <Tooltip cursor={{fill: 'rgba(0, 82, 204, 0.1)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}/>
                              <Bar dataKey="count" fill="#0052CC" name="Serviços" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Próximas Ordens de Serviço</h3>
                    <ul className="space-y-4">
                        {upcomingServiceOrders.map(so => (
                           <li key={so.id} className="p-3 bg-gray-50 rounded-lg">
                               <p className="font-semibold text-brand-dark line-clamp-2">{so.reported_problem}</p>
                               <p className="text-sm text-gray-500">{so.customers?.name}</p>
                               <p className="text-sm text-gray-500">Aberta em: {new Date(so.created_at).toLocaleDateString()}</p>
                           </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="fixed bottom-8 right-8 group">
                <div className="absolute bottom-16 right-0 mb-2 hidden flex-col items-center group-hover:flex">
                    <Link to="/service-orders/new" className="flex items-center justify-center h-12 w-48 bg-white rounded-md shadow-lg text-sm text-gray-700 hover:bg-gray-100 mb-2">Nova Ordem de Serviço</Link>
                    <Link to="/customers/new" className="flex items-center justify-center h-12 w-48 bg-white rounded-md shadow-lg text-sm text-gray-700 hover:bg-gray-100 mb-2">Novo Cliente</Link>
                </div>
                <button className="flex items-center justify-center h-16 w-16 bg-brand-primary rounded-full text-white shadow-xl hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-transform duration-300 group-hover:rotate-45">
                    <Plus size={28} />
                </button>
            </div>
        </div>
    );
};

export default DashboardPage;