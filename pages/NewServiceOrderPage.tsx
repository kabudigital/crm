import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, User, Building, Wrench, List, FileText, LoaderCircle } from 'lucide-react';
import { Customer, Equipment, User as Technician, UserRole, ServiceType, ServiceOrderStatus, ServiceOrder } from '../types';
import { mockCustomers, mockEquipments, mockUsers, mockServiceOrders } from '../data/mockData';

const serviceTypeText: { [key in ServiceType]: string } = {
    [ServiceType.Preventiva]: 'Preventiva',
    [ServiceType.Corretiva]: 'Corretiva',
    [ServiceType.Instalacao]: 'Instalação',
    [ServiceType.Orcamento]: 'Orçamento',
};

const NewServiceOrderPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const customerIdFromState = location.state?.customerId;

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [allEquipments, setAllEquipments] = useState<Equipment[]>([]);
    const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);

    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerIdFromState?.toString() || '');
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
    const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
    const [reportedProblem, setReportedProblem] = useState('');
    const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.Corretiva);
    
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        // Simulate fetching data
        setTimeout(() => {
            setCustomers(mockCustomers);
            setAllEquipments(mockEquipments);
            setTechnicians(mockUsers.filter(u => u.role === UserRole.Technician));
            setLoading(false);
        }, 300);
    }, []);

    useEffect(() => {
        if (selectedCustomerId) {
            const customerEquips = allEquipments.filter(e => e.customer_id === parseInt(selectedCustomerId, 10));
            setFilteredEquipments(customerEquips);
            setSelectedEquipmentId(''); // Reset equipment selection
        } else {
            setFilteredEquipments([]);
        }
    }, [selectedCustomerId, allEquipments]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || !reportedProblem) {
            alert('Por favor, preencha o cliente e o problema relatado.');
            return;
        }
        setIsSubmitting(true);
        
        // MOCK LOGIC
        setTimeout(() => {
            const newOrder: ServiceOrder = {
                id: Math.max(...mockServiceOrders.map(o => o.id), 0) + 1,
                customer_id: parseInt(selectedCustomerId, 10),
                equipment_id: selectedEquipmentId ? parseInt(selectedEquipmentId, 10) : null,
                technician_id: selectedTechnicianId ? parseInt(selectedTechnicianId, 10) : null,
                reported_problem: reportedProblem,
                service_type: serviceType,
                status: selectedTechnicianId ? ServiceOrderStatus.Agendada : ServiceOrderStatus.AguardandoAgendamento,
                created_at: new Date().toISOString(),
            };
            
            mockServiceOrders.unshift(newOrder); // Add to the beginning of the array
            alert('Ordem de Serviço criada com sucesso! (Mock)');
            setIsSubmitting(false);
            navigate('/service-orders');
        }, 500);
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <Link to="/service-orders" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Ordens de Serviço
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-brand-dark mb-6">Criar Nova Ordem de Serviço</h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Selection */}
                        <div>
                            <label htmlFor="customer" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <Building size={16} className="mr-2"/> Cliente <span className="text-red-500 ml-1">*</span>
                            </label>
                            <select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                <option value="" disabled>Selecione um cliente</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* Equipment Selection */}
                        <div>
                            <label htmlFor="equipment" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <Wrench size={16} className="mr-2"/> Equipamento
                            </label>
                            <select id="equipment" value={selectedEquipmentId} onChange={e => setSelectedEquipmentId(e.target.value)} disabled={!selectedCustomerId} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-gray-100">
                                <option value="">Selecione um equipamento (opcional)</option>
                                {filteredEquipments.map(e => <option key={e.id} value={e.id}>{e.name} - {e.model}</option>)}
                            </select>
                        </div>

                         {/* Technician Selection */}
                        <div>
                            <label htmlFor="technician" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <User size={16} className="mr-2"/> Atribuir Técnico
                            </label>
                            <select id="technician" value={selectedTechnicianId} onChange={e => setSelectedTechnicianId(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                <option value="">Não atribuir agora</option>
                                {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        
                        {/* Service Type */}
                         <div>
                            <label htmlFor="serviceType" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <List size={16} className="mr-2"/> Tipo de Serviço
                            </label>
                            <select id="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value as ServiceType)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                {Object.values(ServiceType).map(type => <option key={type} value={type}>{serviceTypeText[type]}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Reported Problem */}
                    <div>
                        <label htmlFor="problem" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                            <FileText size={16} className="mr-2"/> Problema Relatado <span className="text-red-500 ml-1">*</span>
                        </label>
                        <textarea id="problem" value={reportedProblem} onChange={e => setReportedProblem(e.target.value)} required rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Descreva o problema ou o serviço a ser realizado..."></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <Link to="/service-orders" className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 disabled:bg-gray-400 flex items-center gap-2">
                             {isSubmitting && <LoaderCircle className="animate-spin h-4 w-4" />}
                            {isSubmitting ? 'Salvando...' : 'Salvar Ordem de Serviço'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewServiceOrderPage;