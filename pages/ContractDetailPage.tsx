import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, User, Building, Calendar, CheckCircle, XCircle, LoaderCircle } from 'lucide-react';
import { ServiceOrder, ServiceOrderStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

const getStatusInfo = (status: ServiceOrderStatus) => {
    switch (status) {
        case ServiceOrderStatus.Open:
            return { text: 'Aberta', color: 'text-blue-600', bg: 'bg-blue-100' };
        case ServiceOrderStatus.InProgress:
            return { text: 'Em Andamento', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        case ServiceOrderStatus.Completed:
            return { text: 'Concluída', color: 'text-green-600', bg: 'bg-green-100' };
        case ServiceOrderStatus.Canceled:
            return { text: 'Cancelada', color: 'text-red-600', bg: 'bg-red-100' };
        default:
            return { text: 'Desconhecido', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
};

const ServiceOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('service_orders')
                .select('*, customers(*), users(*)')
                .eq('id', id)
                .single();
            
            if (data) {
                setOrder(data);
            }
            setLoading(false);
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
                        <h1 className="text-3xl font-bold text-brand-dark mt-2">{order.title}</h1>
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
                        <h2 className="text-xl font-bold text-brand-dark mb-4">Descrição do Serviço</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{order.description}</p>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-brand-dark mb-4">Histórico e Atividades</h2>
                        <p className="text-gray-500">Nenhuma atividade registrada ainda.</p>
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
                                <User size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Técnico</span>
                                    <p className="font-semibold text-gray-800">{order.users?.name || 'Não atribuído'}</p>
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
                             {order.status === ServiceOrderStatus.Canceled && (
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