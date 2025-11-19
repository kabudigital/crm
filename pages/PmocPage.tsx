import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle, FileText, Printer, Search, ShieldCheck, AlertTriangle, Wrench, BarChart } from 'lucide-react';
import { Contract, ContractStatus, Equipment } from '../types';
import { supabase } from '../lib/supabaseClient';

interface PmocSummary {
    contract: Contract;
    equipmentCount: number;
    nextVisit: string;
    complianceStatus: 'ok' | 'pending' | 'expired';
}

const PmocPage: React.FC = () => {
    const [pmocs, setPmocs] = useState<PmocSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            // 1. Fetch Contracts (Plans)
            let contractsData: Contract[] = [];
            const { data: cData, error: cError } = await supabase
                .from('contracts')
                .select('*, customers (name)');
            
            if (cError || !cData) {
                // Mock Data
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
                // Merge with localStorage
                const localContracts = JSON.parse(localStorage.getItem('pmoc_contracts') || '[]');
                contractsData = [...mockContracts, ...localContracts];
            } else {
                // Merge DB + Local
                const localContracts = JSON.parse(localStorage.getItem('pmoc_contracts') || '[]');
                contractsData = [...cData, ...localContracts];
            }
            
            // Remove duplicates
            contractsData = Array.from(new Map(contractsData.map(item => [item.id, item])).values());

            // 2. Fetch Equipments to count
            let equipmentsData: Equipment[] = [];
            const { data: eData } = await supabase.from('equipments').select('id, customer_id');
            const localEquipments = JSON.parse(localStorage.getItem('pmoc_equipments') || '[]');
            equipmentsData = [...(eData || []), ...localEquipments];


            // 3. Build Summary
            const summaries: PmocSummary[] = contractsData.map(contract => {
                const count = equipmentsData.filter(e => e.customer_id === contract.customer_id).length;
                
                // Simulate Compliance Logic
                let status: 'ok' | 'pending' | 'expired' = 'ok';
                if (contract.status === ContractStatus.Inativo) status = 'expired';
                
                // Simulate Next Visit Logic (Mock logic based on Frequency)
                const nextDate = new Date();
                if (contract.frequency === 'mensal') nextDate.setDate(nextDate.getDate() + 15);
                if (contract.frequency === 'trimestral') nextDate.setDate(nextDate.getDate() + 45);

                return {
                    contract,
                    equipmentCount: count,
                    nextVisit: nextDate.toISOString(),
                    complianceStatus: status
                };
            });

            setPmocs(summaries);
            setLoading(false);
        };

        fetchData();
    }, []);

    const filteredPmocs = pmocs.filter(p => 
        p.contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contract.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-brand-dark">Gestão de PMOC e Conformidade</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por cliente ou plano..."
                            className="w-full py-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm">Planos Ativos</p>
                        <p className="text-2xl font-bold text-gray-800">{pmocs.filter(p => p.contract.status === 'ativo').length}</p>
                    </div>
                    <ShieldCheck className="text-green-500 h-8 w-8" />
                </div>
                <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500 flex items-center justify-between">
                     <div>
                        <p className="text-gray-500 text-sm">Equipamentos Cobertos</p>
                        <p className="text-2xl font-bold text-gray-800">{pmocs.reduce((acc, curr) => acc + curr.equipmentCount, 0)}</p>
                    </div>
                    <Wrench className="text-blue-500 h-8 w-8" />
                </div>
                 <div className="bg-white p-4 rounded-xl shadow border-l-4 border-yellow-500 flex items-center justify-between">
                     <div>
                        <p className="text-gray-500 text-sm">Próximas Visitas (7 dias)</p>
                        <p className="text-2xl font-bold text-gray-800">0</p>
                    </div>
                    <BarChart className="text-yellow-500 h-8 w-8" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano / Contrato</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamentos</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPmocs.map(({ contract, equipmentCount, complianceStatus }) => (
                                <tr key={contract.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-brand-dark">{contract.name}</div>
                                        <div className="text-xs text-gray-500 uppercase">Frequência: {contract.frequency}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contract.customers?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {equipmentCount} un.
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {complianceStatus === 'ok' ? (
                                            <span className="flex items-center text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full w-fit">
                                                <ShieldCheck size={14} className="mr-1"/> Em Conformidade
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-full w-fit">
                                                <AlertTriangle size={14} className="mr-1"/> Inativo / Pendente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                                        <Link to={`/contracts/${contract.id}/pmoc`} className="flex items-center text-gray-600 hover:text-brand-primary bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200 transition-colors" title="Gerar Documento PDF">
                                            <Printer size={16} className="mr-2"/>
                                            PDF
                                        </Link>
                                        <Link to={`/contracts/${contract.id}`} className="flex items-center text-gray-600 hover:text-brand-primary bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-md border border-gray-200 transition-colors" title="Ver Detalhes">
                                            <FileText size={16} className="mr-2"/>
                                            Detalhes
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredPmocs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        Nenhum plano PMOC encontrado. <Link to="/contracts/new" className="text-brand-primary hover:underline">Crie um contrato</Link> para começar.
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

export default PmocPage;