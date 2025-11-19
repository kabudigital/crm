
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ChevronLeft, LoaderCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Contract, Equipment, ContractStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

const PmocPlanPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [contract, setContract] = useState<Contract | null>(null);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);

            const contractId = parseInt(id, 10);
            let contractData: Contract | null = null;
            
            // 1. Try Supabase
            const { data: dbContract } = await supabase
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
                     // 3. Try Mock Data
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
                            customers: { name: 'Empresa Demo S.A.', cnpj_cpf: '12.345.678/0001-90', address: 'Av. Paulista, 1000', contact_name: 'João Silva', contact_phone: '(11) 99999-1234' } as any
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
                            customers: { name: 'Comércio Exemplo Ltda', cnpj_cpf: '98.765.432/0001-00', address: 'Rua Augusta, 500', contact_name: 'Maria Souza', contact_phone: '(11) 98888-4321' } as any
                        }
                    ];
                    contractData = mockContracts.find(c => c.id === contractId) || null;
                 }
            }

            if (contractData) {
                setContract(contractData);
                
                // 2. Fetch Equipments (DB + Local + Mock)
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
            } else {
                console.error("Contract not found");
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    if (!contract) {
        return <div className="p-10 text-center">Contrato não encontrado.</div>;
    }

    const qrCodeValue = `${window.location.origin}/contracts/${id}/pmoc`;
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return (
        <>
             <style>
                {`
                    @media print {
                        body { background-color: white; }
                        .no-print { display: none; }
                        .printable-area { margin: 0; padding: 0; border: none; box-shadow: none; width: 100%; }
                        @page { margin: 1cm; size: A4; }
                    }
                `}
            </style>
            <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
                <div className="max-w-5xl mx-auto">
                    <div className="no-print mb-6 flex justify-between items-center">
                        <Link to={`/contracts/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                            <ChevronLeft size={20} /> Voltar
                        </Link>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                            <Printer size={20} /> Imprimir / Salvar PDF
                        </button>
                    </div>

                    <div className="printable-area bg-white p-8 rounded-xl shadow-lg text-gray-900">
                        
                        {/* Header */}
                        <div className="border-b-2 border-gray-800 pb-4 mb-6 flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-brand-dark uppercase">Plano de Manutenção, Operação e Controle</h1>
                                <h2 className="text-lg text-gray-600">PMOC - Lei Federal 13.589/2018</h2>
                            </div>
                            <div className="text-right">
                                <QRCodeSVG value={qrCodeValue} size={80} />
                                <p className="text-[10px] text-gray-500 mt-1">Validação Digital</p>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm border border-gray-300 p-4 rounded bg-gray-50">
                            <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">Cliente / Razão Social</span>
                                <span className="block font-semibold">{contract.customers?.name}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">CNPJ / CPF</span>
                                <span className="block font-semibold">{contract.customers?.cnpj_cpf || 'Não informado'}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">Endereço</span>
                                <span className="block font-semibold">{contract.customers?.address}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">Contato</span>
                                <span className="block font-semibold">{contract.customers?.contact_name} {contract.customers?.contact_phone ? `- ${contract.customers.contact_phone}` : ''}</span>
                            </div>
                        </div>

                        {/* Contract Info */}
                        <div className="grid grid-cols-3 gap-4 mb-8 text-sm border border-gray-300 p-4 rounded bg-gray-50">
                             <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">Identificação do Plano</span>
                                <span className="block font-semibold">PMOC-{contract.id}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">Vigência</span>
                                <span className="block font-semibold">{new Date(contract.start_date).toLocaleDateString()} a {new Date(contract.end_date).toLocaleDateString()}</span>
                            </div>
                             <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">Frequência</span>
                                <span className="block font-semibold capitalize">{contract.frequency}</span>
                            </div>
                        </div>

                        {/* Equipment List & Schedule */}
                        <h3 className="text-lg font-bold text-brand-dark mb-2 uppercase border-b border-gray-400 pb-1">Cronograma e Inventário de Equipamentos</h3>
                        <div className="overflow-x-auto mb-8">
                            <table className="min-w-full border-collapse border border-gray-300 text-xs">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border border-gray-300 p-2 text-left">ID</th>
                                        <th className="border border-gray-300 p-2 text-left">Equipamento</th>
                                        <th className="border border-gray-300 p-2 text-left">Local</th>
                                        <th className="border border-gray-300 p-2 text-center">Capacidade</th>
                                        {months.map(m => <th key={m} className="border border-gray-300 p-1 text-center w-8">{m}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {equipments.map((eq, index) => (
                                        <tr key={eq.id}>
                                            <td className="border border-gray-300 p-2 font-mono">{index + 1}</td>
                                            <td className="border border-gray-300 p-2">
                                                <div className="font-bold">{eq.name}</div>
                                                <div className="text-gray-600">{eq.type} - {eq.brand} {eq.model}</div>
                                                <div className="text-[10px] text-gray-500">S/N: {eq.serial_number}</div>
                                            </td>
                                            <td className="border border-gray-300 p-2">{eq.location}</td>
                                            <td className="border border-gray-300 p-2 text-center">{eq.capacity_btu ? eq.capacity_btu.toLocaleString() : '-'}</td>
                                            
                                            {/* Mock Schedule Grid - Simulating planned maintenance */}
                                            {months.map((_, i) => {
                                                // Simple logic: odd months or even months based on id to simulate schedule
                                                const isScheduled = contract.frequency === 'mensal' ? true : (contract.frequency === 'bimestral' ? i % 2 === 0 : i % 3 === 0);
                                                return (
                                                    <td key={i} className="border border-gray-300 p-1 text-center">
                                                        {isScheduled && <div className="w-3 h-3 bg-gray-400 rounded-full mx-auto"></div>}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                    {equipments.length === 0 && (
                                        <tr>
                                            <td colSpan={4 + 12} className="border border-gray-300 p-4 text-center text-gray-500">
                                                Nenhum equipamento vinculado a este contrato/cliente.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Checklist Template */}
                        <h3 className="text-lg font-bold text-brand-dark mb-2 uppercase border-b border-gray-400 pb-1">Rotinas de Manutenção (Checklist Padrão)</h3>
                        <div className="grid grid-cols-2 gap-6 text-xs mb-8">
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Limpeza dos filtros de ar e gabinetes.</li>
                                <li>Verificação da drenagem de água condensada.</li>
                                <li>Verificação de ruídos e vibrações anormais.</li>
                                <li>Medição de tensão e corrente elétrica.</li>
                            </ul>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Higienização das serpentinas (evaporadora/condensadora).</li>
                                <li>Verificação do isolamento térmico.</li>
                                <li>Aperto de conexões elétricas e bornes.</li>
                                <li>Teste de funcionamento dos controles.</li>
                            </ul>
                        </div>

                        {/* Signatures */}
                        <div className="grid grid-cols-2 gap-12 mt-12 pt-8">
                            <div className="border-t border-black pt-2 text-center">
                                <p className="font-bold text-sm">Responsável Técnico (Engenheiro Mecânico)</p>
                                <p className="text-xs text-gray-600">CREA: 0000000/SP</p>
                                <p className="text-xs text-gray-600">ART Nº: 123456789</p>
                            </div>
                            <div className="border-t border-black pt-2 text-center">
                                <p className="font-bold text-sm">Responsável pelo Cliente</p>
                                <p className="text-xs text-gray-600">{contract.customers?.name}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default PmocPlanPage;
