import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Customer, ContractStatus, Contract } from '../types';

const NewContractPage: React.FC = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [frequency, setFrequency] = useState<'mensal' | 'bimestral' | 'trimestral'>('mensal');
    const [status, setStatus] = useState<ContractStatus>(ContractStatus.Ativo);

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            // Fetch DB
            const { data, error } = await supabase.from('customers').select('*');
            // Fetch Local
            const localCustomers = JSON.parse(localStorage.getItem('pmoc_customers') || '[]');
            let allCustomers = [...(data || []), ...localCustomers];

            if (allCustomers.length === 0) {
                console.warn("Mocking customers for contract dropdown");
                allCustomers = [
                    { id: 1, name: 'Empresa Demo S.A.', created_at: '' } as any
                ];
            }
            
            setCustomers(Array.from(new Map(allCustomers.map(c => [c.id, c])).values()));
            setLoading(false);
        };
        fetchCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !selectedCustomerId || !startDate || !endDate) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        setIsSubmitting(true);

        const { error } = await supabase
            .from('contracts')
            .insert({
                name: name,
                customer_id: parseInt(selectedCustomerId, 10),
                start_date: startDate,
                end_date: endDate,
                frequency: frequency,
                status: status,
            });

        setIsSubmitting(false);

        if (error) {
            console.warn('Error creating contract, using local storage simulation.', error);
            
            const newContract: Contract = {
                id: Date.now(),
                name,
                customer_id: parseInt(selectedCustomerId, 10),
                start_date: startDate,
                end_date: endDate,
                frequency: frequency,
                status: status,
                created_at: new Date().toISOString(),
                customers: customers.find(c => c.id.toString() === selectedCustomerId)
            };

            const existingContracts = JSON.parse(localStorage.getItem('pmoc_contracts') || '[]');
            localStorage.setItem('pmoc_contracts', JSON.stringify([...existingContracts, newContract]));

            alert('Modo Simulação: Contrato salvo localmente!');
            navigate('/contracts');
        } else {
            alert('Contrato criado com sucesso!');
            navigate('/contracts');
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <Link to="/contracts" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} /> Voltar para Contratos
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-brand-dark mb-6">Novo Contrato PMOC</h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome/Identificação do Contrato</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" placeholder="Ex: Contrato Anual Manutenção - Sede" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cliente</label>
                        <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary">
                            <option value="">Selecione um cliente</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Início</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data de Término</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Frequência de Visitas</label>
                            <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary">
                                <option value="mensal">Mensal</option>
                                <option value="bimestral">Bimestral</option>
                                <option value="trimestral">Trimestral</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value as ContractStatus)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary">
                                <option value={ContractStatus.Ativo}>Ativo</option>
                                <option value={ContractStatus.Inativo}>Inativo</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t">
                        <Link to="/contracts" className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 disabled:bg-gray-400 flex items-center gap-2">
                             {isSubmitting && <LoaderCircle className="animate-spin h-4 w-4" />}
                            {isSubmitting ? 'Salvando...' : 'Criar Contrato'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewContractPage;