import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, User, Building, Calendar, CheckCircle, XCircle, LoaderCircle, Wrench, Package, List, Clock } from 'lucide-react';
import { ServiceOrder, ServiceOrderStatus, ServiceType } from '../types';
import { getFullServiceOrders } from '../data/mockData';

const statusText: { [key in ServiceOrderStatus]: string } = {
    [ServiceOrderStatus.AguardandoAgendamento]: 'Aguardando Agendamento',
    [ServiceOrderStatus.Agendada]: 'Agendada',
    [ServiceOrderStatus.EmExecucao]: 'Em Execução',
    [ServiceOrderStatus.AguardandoPeca]: 'Aguardando Peça',
    [ServiceOrderStatus.Concluida]: 'Concluída',
    [ServiceOrderStatus.Cancelada]: 'Cancelada',
};

const getStatusInfo = (status: ServiceOrderStatus) => {
    switch (status) {
        case ServiceOrderStatus.AguardandoAgendamento: return { text: statusText[status], color: 'text-blue-600', bg: 'bg-blue-100' };
        case ServiceOrderStatus.Agendada: return { text: statusText[status], color: 'text-cyan-600', bg: 'bg-cyan-100' };
        case ServiceOrderStatus.EmExecucao: return { text: statusText[status], color: 'text-yellow-600', bg: 'bg-yellow-100' };
        case ServiceOrderStatus.AguardandoPeca: return { text: statusText[status], color: 'text-orange-600', bg: 'bg-orange-100' };
        case ServiceOrderStatus.Concluida: return { text: statusText[status], color: 'text-green-600', bg: 'bg-green-100' };
        case ServiceOrderStatus.Cancelada: return { text: statusText[status], color: 'text-red-600', bg: 'bg-red-100' };
        default: return { text: 'Desconhecido', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
};

const ServiceOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = () => {
            if (!id) return;
            setLoading(true);

            // MOCK LOGIC
            setTimeout(() => {
                const allOrders = getFullServiceOrders();
                const foundOrder = allOrders.find(o => o.id === parseInt(id, 10));
                setOrder(foundOrder || null);
                setLoading(false);
            }, 300);
        };

        fetchOrder();
    }, [id]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    if (!order) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold">Ordem de Serviço não encontrada</h1>
                <Link to="/service-orders" className="text-brand-primary hover:underline mt-4 inline-block">Voltar para a lista</Link>
            </div>
        );
    }
    
    const statusInfo = getStatusInfo(order.status);

    return (
        <div className="space-y-6">
            <Link to="/service-orders" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Ordens de Serviço
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.text}
                        </span>
                        <h1 className="text-3xl font-bold text-brand-dark mt-2">{order.reported_problem}</h1>
                        <p className="text-lg text-gray-500">OS #{order.id}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-4 md:mt-0">
                        <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100">Editar</button>
                        <button className="px-4 py-2 text-white bg-brand-secondary rounded-lg text-sm hover:bg-brand-secondary/90">Gerar PDF</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-brand-dark mb-4">Problema Relatado</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{order.reported_problem}</p>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-brand-dark mb-4">Materiais Necessários</h2>
                        {order.required_materials && order.required_materials.length > 0 ? (
                             <ul className="list-disc list-inside space-y-1 text-gray-700">
                                {order.required_materials.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        ) : (
                             <p className="text-gray-500">Nenhum material listado.</p>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-brand-dark mb-4">Detalhes</h2>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center">
                                <Building size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Cliente</span>
                                    <p className="font-semibold text-gray-800">{order.customers?.name || 'Não especificado'}</p>
                                </div>
                            </li>
                            <li className="flex items-center">
                                <Wrench size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Equipamento</span>
                                    <p className="font-semibold text-gray-800">{order.equipments?.name || 'Não especificado'}</p>
                                </div>
                            </li>
                            <li className="flex items-center">
                                <User size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Técnico</span>
                                    <p className="font-semibold text-gray-800">{order.users?.name || 'Não atribuído'}</p>
                                </div>
                            </li>
                            <li className="flex items-center">
                                <List size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Tipo de Serviço</span>
                                    <p className="font-semibold text-gray-800 capitalize">{order.service_type}</p>
                                </div>
                            </li>
                             <li className="flex items-center">
                                <Clock size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Agendado Para</span>
                                    <p className="font-semibold text-gray-800">{order.scheduled_at ? new Date(order.scheduled_at).toLocaleString() : 'Não agendado'}</p>
                                </div>
                            </li>
                            <li className="flex items-center">
                                <Calendar size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Data de Abertura</span>
                                    <p className="font-semibold text-gray-800">{new Date(order.created_at).toLocaleString()}</p>
                                </div>
                            </li>
                            {order.completed_at && (
                               <li className="flex items-center">
                                    <CheckCircle size={18} className="text-green-500 mr-3"/>
                                    <div>
                                        <span className="text-gray-500">Data de Conclusão</span>
                                        <p className="font-semibold text-gray-800">{new Date(order.completed_at).toLocaleString()}</p>
                                    </div>
                                </li>
                            )}
                             {order.status === ServiceOrderStatus.Cancelada && (
                               <li className="flex items-center">
                                    <XCircle size={18} className="text-red-500 mr-3"/>
                                    <div>
                                        <span className="text-gray-500">Cancelada</span>
                                        <p className="font-semibold text-gray-800">Esta O.S. foi cancelada.</p>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderDetailPage;