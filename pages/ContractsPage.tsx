import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle, Plus, FileSignature, CheckCircle, XCircle } from 'lucide-react';
import { Contract, ContractStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

const getStatusInfo = (status: ContractStatus) => {
    switch (status) {
        case ContractStatus.Ativo:
            return { text: 'Ativo', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
        case ContractStatus.Inativo:
            return { text: 'Inativo', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
        default:
            return { text: 'Desconhecido', icon: XCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
};

const ContractsPage: React.FC = () => {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('contracts')
                .select('*, customers (name)');
            
            if (error) {
                console.error('Error fetching contracts:', error);
            } else {
                setContracts(data as unknown as Contract[]);
            }
            setLoading(false);
        };
        fetchContracts();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-brand-dark">Contratos de Manutenção (PMOC)</h1>
                <button className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                    <Plus size={20} />
                    Novo Contrato
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contrato</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigência</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {contracts.map(contract => {
                                const statusInfo = getStatusInfo(contract.status);
                                return (
                                    <tr key={contract.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <FileSignature className="h-5 w-5 text-brand-primary mr-3" />
                                                <span className="font-medium text-gray-900">{contract.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{contract.customers?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                                                <statusInfo.icon size={14} />
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/contracts/${contract.id}`} className="text-brand-primary hover:underline">Ver Detalhes</Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ContractsPage;
