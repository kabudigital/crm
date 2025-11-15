import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, LoaderCircle, Users, User, Calendar, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { Campaign, CampaignStatus, Customer } from '../types';
import { supabase } from '../lib/supabaseClient';

const getStatusInfo = (status: CampaignStatus) => {
    switch (status) {
        case CampaignStatus.Agendada: return { text: 'Agendada', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' };
        case CampaignStatus.Enviada: return { text: 'Enviada', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
        case CampaignStatus.Falha: return { text: 'Falha', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' };
        default: return { text: 'Desconhecido', icon: AlertTriangle, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
};

const CampaignsPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: campaignsData, error: campaignsError } = await supabase
                .from('campaigns')
                .select('*')
                .order('created_at', { ascending: false });
            
            const { data: customersData, error: customersError } = await supabase
                .from('customers')
                .select('id, name');

            if (campaignsError || customersError) {
                console.error(campaignsError, customersError);
            } else {
                setCampaigns(campaignsData || []);
                setCustomers(customersData || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const getTargetName = (target: string) => {
        if (target === 'all') {
            return (
                <div className="flex items-center">
                    <Users size={16} className="mr-2 text-gray-500" />
                    <span>Todos os Clientes</span>
                </div>
            );
        }
        const customer = customers.find(c => c.id.toString() === target);
        return (
            <div className="flex items-center">
                <User size={16} className="mr-2 text-gray-500" />
                <span>{customer?.name || 'Cliente Específico'}</span>
            </div>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-brand-dark">Campanhas de WhatsApp</h1>
                <Link to="/campaigns/new" className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                    <Plus size={20} />
                    Nova Campanha
                </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campanha</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destinatário</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Agendada</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaigns.map(campaign => {
                                const statusInfo = getStatusInfo(campaign.status);
                                return (
                                    <tr key={campaign.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                            <div className="text-sm text-gray-500 line-clamp-1">{campaign.message}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                                                <statusInfo.icon size={14} />
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getTargetName(campaign.target)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <div className="flex items-center">
                                                <Calendar size={16} className="mr-2 text-gray-500"/>
                                                {new Date(campaign.scheduled_at).toLocaleString('pt-BR')}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-gray-500">
                                        Nenhuma campanha agendada. <Link to="/campaigns/new" className="text-brand-primary font-semibold hover:underline">Crie a sua primeira!</Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CampaignsPage;
