import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle, CheckCircle, Clock } from 'lucide-react';
import { ServiceOrder, ServiceOrderStatus, ServiceType } from '../types';
import { supabase } from '../lib/supabaseClient';

const QuotesPage: React.FC = () => {
    const [quotes, setQuotes] = useState<ServiceOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuotes = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('service_orders')
            .select('*, customers (name)')
            .eq('service_type', ServiceType.Orcamento)
            .neq('status', ServiceOrderStatus.Aprovado)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching quotes", error);
        } else {
            setQuotes(data as ServiceOrder[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQuotes();
    }, []);
    
    const handleApproveQuote = async (quoteId: number) => {
        const { error } = await supabase
            .from('service_orders')
            .update({ status: ServiceOrderStatus.AguardandoAgendamento })
            .eq('id', quoteId);

        if (error) {
            console.error("Error approving quote", error);
            alert("Erro ao aprovar orçamento.");
        } else {
            alert(`Orçamento #${quoteId} aprovado! Agora ele pode ser encontrado na lista principal de Ordens de Serviço.`);
            fetchQuotes(); // Re-fetch to update the list
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-brand-dark">Orçamentos Pendentes</h1>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {quotes.map(quote => (
                                <tr key={quote.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{quote.reported_problem}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{quote.customers?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(quote.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            <Clock size={14}/>
                                            Aguardando Aprovação
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <Link to={`/service-orders/${quote.id}`} className="text-brand-primary hover:underline">Ver Detalhes</Link>
                                        <button onClick={() => handleApproveQuote(quote.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-status-green rounded-md hover:bg-status-green/90">
                                           <CheckCircle size={14}/> Aprovar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {quotes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">
                                        Nenhum orçamento pendente.
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

export default QuotesPage;
