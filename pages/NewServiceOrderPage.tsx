import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, User, Building, List, FileText, LoaderCircle, MapPin, PlusCircle, Trash2, Phone, Home, NotebookText, Wrench } from 'lucide-react';
import { Customer, User as Technician, UserRole, ServiceType, ServiceOrderStatus, Material, Equipment } from '../types';
import { supabase } from '../lib/supabaseClient';

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
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [customerEquipments, setCustomerEquipments] = useState<Equipment[]>([]);

    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customerIdFromState?.toString() || '');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
    const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
    
    const [serviceType, setServiceType] = useState<ServiceType>(ServiceType.Corretiva);
    const [serviceDescription, setServiceDescription] = useState('');
    const [observations, setObservations] = useState('');
    const [materials, setMaterials] = useState<Material[]>([{ name: '', quantity: 1 }]);
    const [geolocationLink, setGeolocationLink] = useState('');
    const [reportedProblem, setReportedProblem] = useState('');

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        const { data: customersData, error: customersError } = await supabase.from('customers').select('*');
        const { data: techniciansData, error: techniciansError } = await supabase.from('users').select('*').eq('role', UserRole.Technician);

        if (customersError || techniciansError) {
            console.error(customersError, techniciansError);
        } else {
            setCustomers(customersData || []);
            setTechnicians(techniciansData || []);
            if (customerIdFromState) {
                const initialCustomer = (customersData || []).find(c => c.id === customerIdFromState);
                setSelectedCustomer(initialCustomer || null);
            }
        }
        setLoading(false);
    }, [customerIdFromState]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const fetchEquipments = useCallback(async (customerId: string) => {
        if (!customerId) {
            setCustomerEquipments([]);
            return;
        }
        const { data, error } = await supabase.from('equipments').select('*').eq('customer_id', customerId);
        if (error) {
            console.error(error);
        } else {
            setCustomerEquipments(data || []);
        }
    }, []);

    useEffect(() => {
        const customer = customers.find(c => c.id.toString() === selectedCustomerId);
        setSelectedCustomer(customer || null);
        fetchEquipments(selectedCustomerId);
        setSelectedEquipmentId('');
    }, [selectedCustomerId, customers, fetchEquipments]);
    
    const handleMaterialChange = (index: number, field: keyof Material, value: string | number) => {
        const newMaterials = [...materials];
        (newMaterials[index] as any)[field] = value;
        setMaterials(newMaterials);
    };

    const addMaterial = () => setMaterials([...materials, { name: '', quantity: 1 }]);
    const removeMaterial = (index: number) => setMaterials(materials.filter((_, i) => i !== index));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || !reportedProblem) {
            alert('Por favor, preencha o cliente e o problema relatado.');
            return;
        }
        setIsSubmitting(true);
        
        const technician = technicians.find(t => t.id === selectedTechnicianId);
        
        const { data, error } = await supabase
            .from('service_orders')
            .insert({
                customer_id: parseInt(selectedCustomerId, 10),
                equipment_id: selectedEquipmentId ? parseInt(selectedEquipmentId, 10) : null,
                technician_id: selectedTechnicianId || null,
                reported_problem: reportedProblem,
                service_description: serviceDescription,
                observations: observations,
                geolocation: geolocationLink,
                service_type: serviceType,
                status: selectedTechnicianId ? ServiceOrderStatus.Agendada : ServiceOrderStatus.AguardandoAgendamento,
                required_materials: materials.filter(m => m.name),
            })
            .select()
            .single();

        setIsSubmitting(false);

        if (error) {
            console.error(error);
            alert('Erro ao criar Ordem de Serviço.');
        } else {
            if (technician?.phone) {
                const materialsList = data.required_materials?.map((m: Material) => `- ${m.name} (Qtd: ${m.quantity})`).join('\n') || 'Nenhum';
                const mapsLink = data.geolocation ? `\n🗺️ *Localização:* ${data.geolocation}` : '';
                
                const whatsappMessage = `*Nova Ordem de Serviço #${data.id}*
-----------------------------
*Cliente:* ${selectedCustomer?.name}
*Telefone:* ${selectedCustomer?.contact_phone}
*Endereço:* ${selectedCustomer?.address}
${mapsLink}
-----------------------------
*Serviço a ser realizado:*
${data.service_description}
-----------------------------
*Materiais Necessários:*
${materialsList}
-----------------------------
*Observações:*
${data.observations || 'Nenhuma'}
`;
                alert(`--- MENSAGEM PARA O WHATSAPP DO TÉCNICO ---\n\n(Simulação de Envio para ${technician.name})\n\n${whatsappMessage}`);
            } else {
                alert('Ordem de Serviço criada com sucesso!');
            }
            navigate('/');
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <Link to="/service-orders" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} /> Voltar
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-brand-dark mb-6">Criar Nova Ordem de Serviço</h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Customer Section */}
                    <div className="p-4 border rounded-lg">
                        <label htmlFor="customer" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Building size={16} className="mr-2"/> Cliente <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} required className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            <option value="" disabled>Selecione um cliente</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {selectedCustomer && (
                            <div className="mt-4 space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                <p className="flex items-center"><User size={14} className="mr-2 text-gray-400"/> {selectedCustomer.name}</p>
                                <p className="flex items-center"><Phone size={14} className="mr-2 text-gray-400"/> {selectedCustomer.contact_phone}</p>
                                <p className="flex items-start"><Home size={14} className="mr-2 mt-0.5 text-gray-400"/> {selectedCustomer.address}</p>
                            </div>
                        )}
                    </div>
                     {/* Equipment Section */}
                     {selectedCustomerId && (
                         <div className="p-4 border rounded-lg">
                            <label htmlFor="equipment" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Wrench size={16} className="mr-2"/> Equipamento
                            </label>
                            <select id="equipment" value={selectedEquipmentId} onChange={e => setSelectedEquipmentId(e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" disabled={customerEquipments.length === 0}>
                                <option value="">{customerEquipments.length > 0 ? 'Selecione um equipamento (Opcional)' : 'Nenhum equipamento cadastrado'}</option>
                                {customerEquipments.map(e => <option key={e.id} value={e.id}>{e.name} - {e.brand} {e.model}</option>)}
                            </select>
                        </div>
                     )}

                    {/* Service Details Section */}
                    <div className="p-4 border rounded-lg space-y-4">
                         <div>
                            <label htmlFor="reportedProblem" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <FileText size={16} className="mr-2"/> Problema Relatado / Título <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input type="text" id="reportedProblem" value={reportedProblem} onChange={e => setReportedProblem(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Ex: Ar condicionado não gela"/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="serviceType" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <List size={16} className="mr-2"/> Tipo de Serviço
                                </label>
                                <select id="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value as ServiceType)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                    {Object.values(ServiceType).map(type => <option key={type} value={type}>{serviceTypeText[type]}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="geolocation" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <MapPin size={16} className="mr-2"/> Link da Localização
                                </label>
                                <input type="text" id="geolocation" value={geolocationLink} onChange={e => setGeolocationLink(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Cole o link do Google Maps aqui" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="serviceDescription" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <FileText size={16} className="mr-2"/> Descrição Detalhada do Serviço
                            </label>
                            <textarea id="serviceDescription" value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Descreva detalhadamente o serviço a ser realizado..."></textarea>
                        </div>
                         <div>
                            <label htmlFor="observations" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <NotebookText size={16} className="mr-2"/> Observações
                            </label>
                            <textarea id="observations" value={observations} onChange={e => setObservations(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Informações adicionais, como melhor horário para contato, restrições de acesso, etc."></textarea>
                        </div>
                    </div>

                    {/* Materials Section */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Materiais Necessários</h3>
                        <div className="space-y-2">
                            {materials.map((material, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" placeholder="Nome do material" value={material.name} onChange={e => handleMaterialChange(index, 'name', e.target.value)} className="flex-grow border-gray-300 rounded-md shadow-sm sm:text-sm" />
                                    <input type="number" placeholder="Qtd" value={material.quantity} onChange={e => handleMaterialChange(index, 'quantity', parseInt(e.target.value) || 1)} className="w-20 border-gray-300 rounded-md shadow-sm sm:text-sm" min="1" />
                                    <button type="button" onClick={() => removeMaterial(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addMaterial} className="mt-2 flex items-center gap-2 text-sm font-medium text-brand-primary hover:underline">
                            <PlusCircle size={16}/> Adicionar Material
                        </button>
                    </div>

                     {/* Technician Assignment */}
                    <div className="p-4 border rounded-lg">
                        <label htmlFor="technician" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                            <User size={16} className="mr-2"/> Atribuir Técnico e Enviar via WhatsApp
                        </label>
                        <select id="technician" value={selectedTechnicianId} onChange={e => setSelectedTechnicianId(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                            <option value="">Não atribuir agora</option>
                            {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Ao selecionar um técnico, uma mensagem com os detalhes da O.S. será preparada para envio.</p>
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
