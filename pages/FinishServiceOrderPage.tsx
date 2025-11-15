import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ServiceOrder, ServiceOrderStatus } from '../types';
import { mockServiceOrders, getFullServiceOrders } from '../data/mockData';
import { ChevronLeft, LoaderCircle, FileText, UserCheck, Camera } from 'lucide-react';

const FinishServiceOrderPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [technicalReport, setTechnicalReport] = useState('');
    const [completedBy, setCompletedBy] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setTimeout(() => {
            const foundOrder = getFullServiceOrders().find(o => o.id === parseInt(id, 10));
            setOrder(foundOrder as ServiceOrder || null);
            setLoading(false);
        }, 300);
    }, [id]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!technicalReport || !completedBy) {
            alert('Por favor, preencha o relatório técnico e o nome do responsável.');
            return;
        }
        setIsSubmitting(true);
        
        setTimeout(() => {
            const orderIndex = mockServiceOrders.findIndex(o => o.id === parseInt(id!, 10));
            if (orderIndex !== -1) {
                mockServiceOrders[orderIndex] = {
                    ...mockServiceOrders[orderIndex],
                    status: ServiceOrderStatus.Concluida,
                    technical_report: technicalReport,
                    completed_by_customer: completedBy,
                    photos_urls: photos.map(p => `/uploads/mock/${p.name}`), // Mocked photo URLs
                    completed_at: new Date().toISOString(),
                };
            }
            alert('Ordem de Serviço finalizada com sucesso!');
            setIsSubmitting(false);
            navigate(`/service-orders/${id}`);
        }, 500);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    if (!order) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold">Ordem de Serviço não encontrada</h1>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link to={`/service-orders/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Detalhes da O.S.
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-brand-dark mb-2">Finalizar Atendimento</h1>
                <p className="text-gray-600 mb-6">OS #{order.id} - {order.customers?.name}</p>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="technicalReport" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                            <FileText size={16} className="mr-2"/> Relatório Técnico Detalhado <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea 
                            id="technicalReport" 
                            value={technicalReport} 
                            onChange={e => setTechnicalReport(e.target.value)} 
                            required 
                            rows={6} 
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            placeholder="Descreva todos os procedimentos realizados, peças trocadas, medições e testes efetuados."
                        />
                    </div>

                    <div>
                        <label htmlFor="photos" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                           <Camera size={16} className="mr-2"/> Anexar Fotos (Antes/Depois)
                        </label>
                         <input 
                            type="file" 
                            id="photos" 
                            multiple 
                            accept="image/*"
                            onChange={e => setPhotos(Array.from(e.target.files || []))}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                        />
                         {photos.length > 0 && <p className="text-xs text-gray-500 mt-1">{photos.length} arquivo(s) selecionado(s).</p>}
                    </div>
                    
                    <div>
                        <label htmlFor="completedBy" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                            <UserCheck size={16} className="mr-2"/> Recebido por (Assinatura Cliente) <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="completedBy" 
                            value={completedBy} 
                            onChange={e => setCompletedBy(e.target.value)} 
                            required 
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                            placeholder="Digite o nome completo do responsável no local"
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <Link to={`/service-orders/${id}`} className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-status-green text-white rounded-lg text-sm font-medium hover:bg-status-green/90 disabled:bg-gray-400 flex items-center gap-2">
                             {isSubmitting && <LoaderCircle className="animate-spin h-4 w-4" />}
                            {isSubmitting ? 'Finalizando...' : 'Concluir Serviço'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default FinishServiceOrderPage;