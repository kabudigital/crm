import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, LoaderCircle, FileSignature, Building, Calendar, RefreshCw, Wrench, CheckCircle, XCircle, FileClock } from 'lucide-react';
import { Contract, ServiceOrder, ContractStatus, ServiceOrderStatus, ServiceType, Equipment } from '../types';
import { supabase } from '../lib/supabaseClient';
import * as qrcode from 'qrcode.react';

const getStatusInfo = (status: ContractStatus) => {
    switch (status) {
        case ContractStatus.Ativo: return { text: 'Ativo', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
        case ContractStatus.Inativo: return { text: 'Inativo', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
        default: return { text: 'Desconhecido', icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
};

const ContractDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [contract, setContract] = useState<Contract | null>(null);
    const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContractData = async () => {
            if (!id) return;
            setLoading(true);

            const contractId = parseInt(id, 10);
            
            // Fetch contract details
            const { data: contractData, error: contractError } = await supabase
                .from('contracts')
                .select('*, customers (*)')
                .eq('id', contractId)
                .single();

            if (contractError) {
                console.error("Error fetching contract", contractError);
                setLoading(false);
                return;
            }
            setContract(contractData as unknown as Contract);

            // Fetch associated equipments
            const { data: contractEquipments, error: ceError } = await supabase
                .from('contract_equipments')
                .select('equipment_id')
                .eq('contract_id', contractId);
            
            if (ceError) {
                console.error("Error fetching contract equipments", ceError);
            } else {
                const equipmentIds = contractEquipments.map(ce => ce.equipment_id);
                if (equipmentIds.length > 0) {
                    const { data: equipmentData, error: eqError } = await supabase
                        .from('equipments')
                        .select('*')
                        .in('id', equipmentIds);
                    if (eqError) console.error("Error fetching equipments", eqError);
                    else setEquipments(equipmentData);
                }
            }

            // Fetch associated service orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('service_orders')
                .select('*, equipments (*), users (*)')
                .eq('contract_id', contractId);
            
            if (ordersError) {
                console.error("Error fetching service orders", ordersError);
            } else {
                setServiceOrders(ordersData as ServiceOrder[]);
            }
            
            setLoading(false);
        };
        fetchContractData();
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    if (!contract) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold">Contrato não encontrado</h1>
                <Link to="/contracts" className="text-brand-primary hover:underline mt-4 inline-block">Voltar para a lista</Link>
            </div>
        );
    }

    const maintenanceRecords = serviceOrders.filter(so => 
        so.service_type === ServiceType.Preventiva &&
        so.status === ServiceOrderStatus.Concluida
    ).sort((a,b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

    const statusInfo = getStatusInfo(contract.status);

    return (
        <div className="space-y-6">
            <Link to="/contracts" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Contratos
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                            <statusInfo.icon size={16} className="mr-1.5"/>
                            {statusInfo.text}
                        </span>
                        <h1 className="text-3xl font-bold text-brand-dark mt-2">{contract.name}</h1>
                        <p className="text-lg text-gray-600">{contract.customers?.name}</p>
                    </div>
                </div>
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t pt-6 text-sm">
                    <div className="flex items-start"><Building size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/><div><p className="text-gray-500">Cliente</p><p className="font-semibold">{contract.customers?.name}</p></div></div>
                    <div className="flex items-start"><Calendar size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/><div><p className="text-gray-500">Vigência</p><p className="font-semibold">{new Date(contract.start_date).toLocaleDateString()} a {new Date(contract.end_date).toLocaleDateString()}</p></div></div>
                    <div className="flex items-start"><RefreshCw size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/><div><p className="text-gray-500">Frequência</p><p className="font-semibold capitalize">{contract.frequency}</p></div></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center"><Wrench size={20} className="mr-2"/> Equipamentos Cobertos</h2>
                 <ul className="space-y-3">
                   {equipments.map(eq => {
                       const equipmentHistoryUrl = `${window.location.origin}/#/equipment/${eq.id}/pmoc-history`;
                       return (
                         <li key={eq.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                           <div>
                               <p className="font-semibold text-gray-800">{eq.name}</p>
                               <p className="text-xs text-gray-500">{eq.brand} {eq.model} (S/N: {eq.serial_number})</p>
                           </div>
                           <Link to={`/equipment/${eq.id}/pmoc-history`} title="Ver Histórico de Manutenção PMOC">
                               <qrcode.QRCodeSVG value={equipmentHistoryUrl} size={64} />
                           </Link>
                         </li>
                       )
                   })}
                 </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center">
                    <FileClock size={20} className="mr-2"/> Registros de Manutenção (PMOC)
                </h2>
                {maintenanceRecords.length > 0 ? (
                    <div className="space-y-4">
                        {maintenanceRecords.map(so => (
                            <div key={so.id} className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <div>
                                        <p className="font-bold text-brand-dark">{so.equipments?.name}</p>
                                        <p className="text-sm text-gray-500">
                                            Manutenção em: {so.completed_at ? new Date(so.completed_at).toLocaleDateString() : 'N/A'} por {so.users?.name || 'N/A'}
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
                    <p className="text-center text-gray-500 py-4">Nenhum registro de manutenção preventiva concluída para este contrato.</p>
                )}
            </div>
        </div>
    );
};

export default ContractDetailPage;