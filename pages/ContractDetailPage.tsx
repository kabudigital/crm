
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, LoaderCircle, FileText, Building, Calendar, RefreshCw, Wrench, CheckCircle, XCircle, FileClock } from 'lucide-react';
import { Contract, ServiceOrder, ContractStatus, ServiceOrderStatus, ServiceType, Equipment } from '../types';
import { supabase } from '../lib/supabaseClient';
import { QRCodeSVG } from 'qrcode.react';

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
            let contractData: Contract | null = null;

            // 1. Try Supabase
            const { data: dbContract, error: contractError } = await supabase
                .from('contracts')
                .select('*, customers (*)')
                .eq('id', contractId)
                .single();

            if (dbContract) {
                contractData = dbContract as unknown as Contract;
            } else {
                // 2. Try Local Storage
                const localContracts = JSON.parse(localStorage.getItem('pmoc_contracts') || '[]');
                const localMatch = localContracts.find((c: Contract) => c.id === contractId);
                
                if (localMatch) {
                    contractData = localMatch;
                } else {
                    // 3. Try Mock Data (The ones displayed in ContractsPage)
                    const mockContracts: Contract[] = [
                        {
                            id: 1,
                            name: 'Manutenção Preventiva Mensal - Sede',
                            customer_id: 1,
                            status: ContractStatus.Ativo,
                            start_date: '2024-01-01',
                            end_date: '2024-12-31',
                            frequency: 'mensal',
                            created_at: new Date().toISOString(),
                            customers: { name: 'Empresa Demo S.A.' } as any
                        },
                        {
                            id: 2,
                            name: 'PMOC Trimestral - Filial',
                            customer_id: 2,
                            status: ContractStatus.Inativo,
                            start_date: '2023-01-01',
                            end_date: '2023-12-31',
                            frequency: 'trimestral',
                            created_at: new Date().toISOString(),
                            customers: { name: 'Comércio Exemplo Ltda' } as any
                        }
                    ];
                    contractData = mockContracts.find(c => c.id === contractId) || null;
                }
            }
            
            if (!contractData) {
                 console.error("Contract not found", contractError);
                 setLoading(false);
                 return;
            }

            setContract(contractData);

            // Fetch ALL equipments for this customer (Supabase + Local)
            if (contractData) {
                const { data: dbEquipments } = await supabase
                    .from('equipments')
                    .select('*')
                    .eq('customer_id', contractData.customer_id);
                
                const localEquipments = JSON.parse(localStorage.getItem('pmoc_equipments') || '[]');
                const customerLocalEquipments = localEquipments.filter((e: Equipment) => e.customer_id === contractData!.customer_id);
                
                let allEquipments = [...(dbEquipments || []), ...customerLocalEquipments];
                
                // Add mock equipments if empty for demo contracts
                if (allEquipments.length === 0 && (contractId === 1 || contractId === 2)) {
                     allEquipments = [
                         { id: 101, customer_id: 1, name: 'Ar Condicionado Server Room', type: 'Split Hi-Wall', brand: 'Daikin', model: 'FTX12', location: 'Sala Servidor', created_at: '', capacity_btu: 12000, serial_number: 'SN123' } as any,
                         { id: 102, customer_id: 1, name: 'Chiller Central', type: 'Chiller', brand: 'Hitachi', model: 'RCU', location: 'Cobertura', created_at: '', capacity_btu: 600000, serial_number: 'CH999' } as any
                     ];
                }

                setEquipments(allEquipments);
            }

            // Fetch associated service orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('service_orders')
                .select('*, equipments (*), users (*)')
                .eq('contract_id', contractId);
            
            const localOrders = JSON.parse(localStorage.getItem('pmoc_service_orders') || '[]');
            const contractLocalOrders = localOrders.filter((so: ServiceOrder) => so.contract_id === contractId);

            setServiceOrders([...(ordersData || []), ...contractLocalOrders] as ServiceOrder[]);
            
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
                    <div className="mt-4 md:mt-0">
                        <Link to={`/contracts/${id}/pmoc`} className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-secondary/90 font-medium">
                            <FileText size={20} />
                            Gerar Plano PMOC (PDF)
                        </Link>
                    </div>
                </div>
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t pt-6 text-sm">
                    <div className="flex items-start"><Building size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/><div><p className="text-gray-500">Cliente</p><p className="font-semibold">{contract.customers?.name}</p></div></div>
                    <div className="flex items-start"><Calendar size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/><div><p className="text-gray-500">Vigência</p><p className="font-semibold">{new Date(contract.start_date).toLocaleDateString()} a {new Date(contract.end_date).toLocaleDateString()}</p></div></div>
                    <div className="flex items-start"><RefreshCw size={18} className="text-gray-500 mr-3 mt-1 flex-shrink-0"/><div><p className="text-gray-500">Frequência</p><p className="font-semibold capitalize">{contract.frequency}</p></div></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center"><Wrench size={20} className="mr-2"/> Equipamentos Cobertos (Inventário)</h2>
                 <ul className="space-y-3">
                   {equipments.map(eq => {
                       const equipmentHistoryUrl = `${window.location.origin}/equipment/${eq.id}/pmoc-history`;
                       return (
                         <li key={eq.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                           <div>
                               <p className="font-semibold text-gray-800">{eq.name}</p>
                               <p className="text-xs text-gray-500">{eq.type || 'Equip.'} &bull; {eq.brand} {eq.model} &bull; {eq.location || 'Sem local'}</p>
                           </div>
                           <Link to={`/equipment/${eq.id}/pmoc-history`} title="Ver Histórico de Manutenção PMOC">
                               <QRCodeSVG value={equipmentHistoryUrl} size={48} />
                           </Link>
                         </li>
                       )
                   })}
                   {equipments.length === 0 && <p className="text-gray-500 text-sm">Nenhum equipamento cadastrado para este cliente.</p>}
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
