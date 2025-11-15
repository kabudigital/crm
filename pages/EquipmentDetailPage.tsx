import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Wrench, Building, Hash, Tag, LoaderCircle, Info } from 'lucide-react';
import { Equipment, ServiceOrder, ServiceOrderStatus } from '../types';
import { mockEquipments, mockCustomers, getFullServiceOrders } from '../data/mockData';

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
        case ServiceOrderStatus.Concluida: return 'bg-green-100 text-green-800';
        case ServiceOrderStatus.Cancelada: return 'bg-red-100 text-red-800';
        default: return 'bg-yellow-100 text-yellow-800';
    }
};

const EquipmentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [serviceHistory, setServiceHistory] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setTimeout(() => {
            const equipmentId = parseInt(id, 10);
            const foundEquipment = mockEquipments.find(e => e.id === equipmentId);
            if (foundEquipment) {
                const fullEquipment = {
                    ...foundEquipment,
                    customers: mockCustomers.find(c => c.id === foundEquipment.customer_id)
                };
                setEquipment(fullEquipment);

                const history = getFullServiceOrders()
                    .filter(so => so.equipment_id === equipmentId)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setServiceHistory(history as ServiceOrder[]);
            }
            setLoading(false);
        }, 300);
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    if (!equipment) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold">Equipamento não encontrado</h1>
                <Link to="/customers" className="text-brand-primary hover:underline mt-4 inline-block">Voltar para Clientes</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link to={`/customers/${equipment.customer_id}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Detalhes do Cliente
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-dark flex items-center"><Wrench size={28} className="mr-3 text-brand-primary"/>{equipment.name}</h1>
                        <Link to={`/customers/${equipment.customer_id}`} className="text-lg text-gray-600 hover:underline">{equipment.customers?.name}</Link>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t pt-6 text-sm">
                    <div className="flex items-start"><Info size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/><div><p className="text-gray-500">Marca</p><p className="font-semibold">{equipment.brand}</p></div></div>
                    <div className="flex items-start"><Tag size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/><div><p className="text-gray-500">Modelo</p><p className="font-semibold">{equipment.model}</p></div></div>
                    <div className="flex items-start"><Hash size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/><div><p className="text-gray-500">Número de Série</p><p className="font-semibold">{equipment.serial_number}</p></div></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-brand-dark mb-4">Histórico de Serviços</h2>
                <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problema / Serviço</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ver</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {serviceHistory.map(so => (
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
                             {serviceHistory.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500">Nenhum serviço registrado para este equipamento.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default EquipmentDetailPage;