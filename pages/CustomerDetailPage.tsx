
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Mail, Phone, MapPin, Plus, LoaderCircle, Wrench } from 'lucide-react';
import { Customer, ServiceOrder, ServiceOrderStatus, Equipment } from '../types';
import { supabase } from '../lib/supabaseClient';

const statusText: { [key in ServiceOrderStatus]: string } = {
    [ServiceOrderStatus.AguardandoAgendamento]: 'Aguardando Agendamento',
    [ServiceOrderStatus.Agendada]: 'Agendada',
    [ServiceOrderStatus.EmExecucao]: 'Em Execução',
    [ServiceOrderStatus.AguardandoPeca]: 'Aguardando Peça',
    [ServiceOrderStatus.Concluida]: 'Concluída',
    [ServiceOrderStatus.Cancelada]: 'Cancelada',
    [ServiceOrderStatus.Aprovado]: 'Aprovado',
};

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

const CustomerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!id) return;
            setLoading(true);

            const customerId = parseInt(id, 10);
            
            // 1. Fetch Customer
            let customerData: Customer | null = null;
            const { data: dbCustomer, error: customerError } = await supabase
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single();
            
            if (dbCustomer) {
                customerData = dbCustomer;
            } else {
                 // Try Local Storage for Customer
                 const localCustomers = JSON.parse(localStorage.getItem('pmoc_customers') || '[]');
                 customerData = localCustomers.find((c: Customer) => c.id === customerId) || null;
            }

            // 2. Fetch Orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('service_orders')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false });
            
            // Merge Local Orders
            const localOrders = JSON.parse(localStorage.getItem('pmoc_service_orders') || '[]');
            const customerLocalOrders = localOrders.filter((o: ServiceOrder) => o.customer_id === customerId);
            const allOrders = [...(ordersData || []), ...customerLocalOrders];

            // 3. Fetch Equipments
            const { data: equipmentsData, error: equipmentsError } = await supabase
                .from('equipments')
                .select('*')
                .eq('customer_id', customerId);
            
            // Merge Local Equipments
            const localEquipments = JSON.parse(localStorage.getItem('pmoc_equipments') || '[]');
            const customerLocalEquipments = localEquipments.filter((e: Equipment) => e.customer_id === customerId);
            const allEquipments = [...(equipmentsData || []), ...customerLocalEquipments];
            
            if (customerError && !customerData) {
                console.error('Error fetching customer data:', customerError);
            } else {
                setCustomer(customerData);
                setServiceOrders(allOrders as ServiceOrder[]);
                setEquipments(allEquipments as Equipment[]);
            }

            setLoading(false);
        };
        fetchCustomerData();
    }, [id]);
    
    if (loading) {
         return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    if (!customer) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold">Cliente não encontrado</h1>
                <Link to="/customers" className="text-brand-primary hover:underline mt-4 inline-block">Voltar para a lista</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link to="/customers" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Clientes
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-dark">{customer.name}</h1>
                        <p className="text-lg text-gray-600">{customer.cnpj_cpf}</p>
                    </div>
                     <div className="flex items-center gap-2 flex-shrink-0 mt-4 md:mt-0">
                        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">Editar Cliente</button>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t pt-6 text-sm">
                    <div className="flex items-start">
                        <MapPin size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/>
                        <div>
                            <p className="text-gray-500">Endereço</p>
                            <p className="font-semibold">{customer.address}</p>
                        </div>
                    </div>
                     <div className="flex items-start">
                        <Mail size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/>
                        <div>
                            <p className="text-gray-500">Email de Contato</p>
                            <p className="font-semibold">{customer.contact_email}</p>
                        </div>
                    </div>
                     <div className="flex items-start">
                        <Phone size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/>
                        <div>
                            <p className="text-gray-500">Telefone de Contato</p>
                            <p className="font-semibold">{customer.contact_phone}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-brand-dark flex items-center"><Wrench size={20} className="mr-2"/> Equipamentos</h2>
                     <Link to={`/customers/${id}/equipments/new`} className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">
                        <Plus size={16}/>Adicionar Equipamento
                    </Link>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome / Descrição</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo / Local</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca / Modelo</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ver</span></th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {equipments.map(eq => (
                                <tr key={eq.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{eq.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.type} - {eq.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.brand} / {eq.model}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/equipment/${eq.id}`} className="text-brand-primary hover:underline">Ver Histórico</Link>
                                    </td>
                                </tr>
                            ))}
                            {equipments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500">Nenhum equipamento cadastrado.</td>
                                </tr>
                            )}
                         </tbody>
                    </table>
                </div>
            </div>


            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-brand-dark">Ordens de Serviço</h2>
                    <Link to="/service-orders/new" state={{ customerId: customer.id }} className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg text-sm hover:bg-brand-primary/90">
                        <Plus size={16}/>Nova O.S. para este cliente
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problema Relatado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Abertura</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ver</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {serviceOrders.map(so => (
                                <tr key={so.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{so.reported_problem}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(so.status)}`}>
                                        {statusText[so.status]}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(so.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/service-orders/${so.id}`} className="text-brand-primary hover:underline">Ver Detalhes</Link>
                                    </td>
                                </tr>
                            ))}
                             {serviceOrders.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500">Nenhuma ordem de serviço encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailPage;
