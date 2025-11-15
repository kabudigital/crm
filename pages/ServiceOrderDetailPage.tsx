import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Building, Calendar, CheckCircle, XCircle, LoaderCircle, Wrench, List, Clock, FileText, NotebookText, MapPin, Camera, UserCheck, Tag } from 'lucide-react';
import { ServiceOrder, ServiceOrderStatus, ServiceType, User as CurrentUser, UserRole } from '../types';
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

const getStatusInfo = (status: ServiceOrderStatus) => {
    switch (status) {
        case ServiceOrderStatus.AguardandoAgendamento: return { text: statusText[status], color: 'text-blue-600', bg: 'bg-blue-100' };
        case ServiceOrderStatus.Agendada: return { text: statusText[status], color: 'text-cyan-600', bg: 'bg-cyan-100' };
        case ServiceOrderStatus.EmExecucao: return { text: statusText[status], color: 'text-yellow-600', bg: 'bg-yellow-100' };
        case ServiceOrderStatus.AguardandoPeca: return { text: statusText[status], color: 'text-orange-600', bg: 'bg-orange-100' };
        case ServiceOrderStatus.Concluida: return { text: statusText[status], color: 'text-green-600', bg: 'bg-green-100' };
        case ServiceOrderStatus.Cancelada: return { text: statusText[status], color: 'text-red-600', bg: 'bg-red-100' };
        case ServiceOrderStatus.Aprovado: return { text: statusText[status], color: 'text-purple-600', bg: 'bg-purple-100' };
        default: return { text: 'Desconhecido', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
};

const ServiceOrderDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const currentUser = useOutletContext<CurrentUser>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        if (!id) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('service_orders')
            .select(`*, customers (*), users (*), equipments (*)`)
            .eq('id', parseInt(id, 10))
            .single();

        if (error) {
            console.error('Error fetching service order details:', error);
            setOrder(null);
        } else {
            setOrder(data as ServiceOrder);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleApproveQuote = async () => {
        if (!order) return;
        
        const { error } = await supabase
            .from('service_orders')
            .update({ 
                status: ServiceOrderStatus.AguardandoAgendamento, 
                service_type: ServiceType.Instalacao // Or other appropriate type
            })
            .eq('id', order.id);

        if (error) {
            alert('Erro ao aprovar orçamento.');
            console.error(error);
        } else {
            alert('Orçamento aprovado e movido para Ordens de Serviço!');
            fetchOrder(); // Re-fetch to update the view
        }
    };
    
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
    const isTechnician = currentUser?.role === UserRole.Technician;
    const isAdmin = currentUser?.role === UserRole.Admin || currentUser?.role === UserRole.Supervisor;
    const isOpenForTechnician = order.status === ServiceOrderStatus.Agendada || order.status === ServiceOrderStatus.EmExecucao;
    const isQuoteForAdmin = order.service_type === ServiceType.Orcamento && isAdmin;
    const isPreventivaConcluida = order.service_type === ServiceType.Preventiva && order.status === ServiceOrderStatus.Concluida;

    return (
        <div className="space-y-6">
            <Link to={isTechnician ? "/" : "/service-orders"} className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.text}
                        </span>
                        <h1 className="text-3xl font-bold text-brand-dark mt-2">{order.service_description || order.reported_problem}</h1>
                        <p className="text-lg text-gray-500">OS #{order.id}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-4 md:mt-0">
                         {isTechnician && isOpenForTechnician && (
                             <Link to={`/service-orders/${order.id}/finish`} className="px-4 py-2 text-white bg-status-green rounded-lg text-sm font-medium hover:bg-status-green/90">
                                Finalizar Atendimento
                            </Link>
                         )}
                         {isQuoteForAdmin && (
                             <button onClick={handleApproveQuote} className="px-4 py-2 text-white bg-brand-primary rounded-lg text-sm font-medium hover:bg-brand-primary/90">
                                Aprovar Orçamento
                            </button>
                         )}
                         {isPreventivaConcluida && (
                            <Link to={`/service-orders/${order.id}/label`} className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg text-sm font-medium hover:bg-brand-secondary/90">
                                <Tag size={16} /> Gerar Etiqueta PMOC
                            </Link>
                         )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center"><FileText size={20} className="mr-2"/> Descrição do Problema</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{order.reported_problem}</p>
                    </div>

                    {order.status === ServiceOrderStatus.Concluida && order.technical_report && (
                         <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                             <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center"><CheckCircle size={20} className="mr-2 text-green-500"/> Relatório Técnico</h2>
                             <p className="text-gray-700 whitespace-pre-wrap mb-4">{order.technical_report}</p>
                             <div className="border-t pt-4 mt-4 space-y-2 text-sm">
                                 <p className="flex items-center"><UserCheck size={16} className="mr-2 text-gray-500"/> <strong>Finalizado por:</strong> <span className="ml-2">{order.completed_by_customer}</span></p>
                                 <p className="flex items-center"><Camera size={16} className="mr-2 text-gray-500"/> <strong>Fotos:</strong> <span className="ml-2 text-brand-primary hover:underline cursor-pointer">Ver {order.photos_urls?.length || 0} fotos</span></p>
                             </div>
                         </div>
                    )}

                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center"><Wrench size={20} className="mr-2"/> Materiais Necessários</h2>
                        {order.required_materials && order.required_materials.length > 0 ? (
                             <ul className="space-y-2 text-gray-700">
                                {order.required_materials.map((item, index) => 
                                    <li key={index} className="flex justify-between p-2 bg-gray-50 rounded-md">
                                        <span>{item.name}</span>
                                        <span className="font-semibold">Qtd: {item.quantity}</span>
                                    </li>
                                )}
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
                            {order.equipments && (
                            <li className="flex items-center">
                                <Wrench size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Equipamento</span>
                                    <p className="font-semibold text-gray-800">{order.equipments.name}</p>
                                </div>
                            </li>
                            )}
                            <li className="flex items-center">
                                <User size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Técnico</span>
                                    <p className="font-semibold text-gray-800">{order.users?.name || 'Não atribuído'}</p>
                                </div>
                            </li>
                             <li className="flex items-center">
                                <MapPin size={18} className="text-gray-500 mr-3"/>
                                <div>
                                    <span className="text-gray-500">Localização</span>
                                    <a href={order.geolocation} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-primary hover:underline">
                                        Abrir no mapa
                                    </a>
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
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceOrderDetailPage;