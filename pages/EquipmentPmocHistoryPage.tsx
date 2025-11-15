import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Wrench, LoaderCircle, FileClock } from 'lucide-react';
import { Equipment, ServiceOrder, ServiceOrderStatus, ServiceType } from '../types';
import { supabase } from '../lib/supabaseClient';

const EquipmentPmocHistoryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [maintenanceRecords, setMaintenanceRecords] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistoryData = async () => {
            if (!id) return;
            setLoading(true);

            const equipmentId = parseInt(id, 10);

            // Fetch equipment details
            const { data: eqData, error: eqError } = await supabase
                .from('equipments')
                .select('*, customers (name)')
                .eq('id', equipmentId)
                .single();
            
            if (eqError) {
                console.error("Error fetching equipment", eqError);
            } else {
                setEquipment(eqData as Equipment);
            }

            // Fetch PMOC maintenance records
            const { data: recordsData, error: recordsError } = await supabase
                .from('service_orders')
                .select('*, users (name)')
                .eq('equipment_id', equipmentId)
                .eq('service_type', ServiceType.Preventiva)
                .eq('status', ServiceOrderStatus.Concluida)
                .order('completed_at', { ascending: false });
            
            if (recordsError) {
                console.error("Error fetching maintenance records", recordsError);
            } else {
                setMaintenanceRecords(recordsData as ServiceOrder[]);
            }

            setLoading(false);
        };
        fetchHistoryData();
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    if (!equipment) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold">Equipamento não encontrado</h1>
                <Link to="/" className="text-brand-primary hover:underline mt-4 inline-block">Voltar para o Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link to={`/equipment/${equipment.id}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Detalhes do Equipamento
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold text-brand-dark flex items-center"><Wrench size={28} className="mr-3 text-brand-primary"/>{equipment.name}</h1>
                <p className="text-lg text-gray-600">{equipment.customers?.name}</p>
                <p className="text-sm text-gray-500 mt-1">{equipment.brand} {equipment.model} (S/N: {equipment.serial_number})</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center">
                    <FileClock size={20} className="mr-2"/> Histórico de Manutenção (PMOC)
                </h2>
                {maintenanceRecords.length > 0 ? (
                    <div className="space-y-4">
                        {maintenanceRecords.map(so => (
                            <div key={so.id} className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div>
                                        <p className="font-bold text-brand-dark">Manutenção Preventiva</p>
                                        <p className="text-sm text-gray-500">
                                            Realizada em: {so.completed_at ? new Date(so.completed_at).toLocaleDateString() : 'N/A'} por {so.users?.name || 'N/A'}
                                        </p>
                                    </div>
                                    <Link 
                                        to={`/service-orders/${so.id}/label`} 
                                        className="mt-2 sm:mt-0 flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-brand-secondary rounded-md hover:bg-brand-secondary/90"
                                    >
                                        Ver / Imprimir Etiqueta
                                    </Link>
                                </div>
                                <p className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border border-dashed line-clamp-2">
                                    <strong>Relatório:</strong> {so.technical_report || 'Nenhum relatório preenchido.'}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">Nenhum registro de manutenção preventiva concluída para este equipamento.</p>
                )}
            </div>
        </div>
    );
};

export default EquipmentPmocHistoryPage;
