import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, User, Building, List, FileText, LoaderCircle, MapPin, PlusCircle, Trash2, Phone, Home, NotebookText, Wrench } from 'lucide-react';
import { Customer, User as Technician, UserRole, ServiceType, ServiceOrderStatus, ServiceOrder, Material, Equipment } from '../types';
import { mockCustomers, mockUsers, mockServiceOrders, mockEquipments } from '../data/mockData';

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

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setCustomers(mockCustomers);
            setTechnicians(mockUsers.filter(u => u.role === UserRole.Technician));
            if (customerIdFromState) {
                const initialCustomer = mockCustomers.find(c => c.id === customerIdFromState);
                setSelectedCustomer(initialCustomer || null);
            }
            setLoading(false);
        }, 300);
    }, [customerIdFromState]);

    useEffect(() => {
        if (selectedCustomerId) {
            const customer = customers.find(c => c.id === parseInt(selectedCustomerId, 10));
            setSelectedCustomer(customer || null);
            const equipments = mockEquipments.filter(e => e.customer_id === parseInt(selectedCustomerId, 10));
            setCustomerEquipments(equipments);
            setSelectedEquipmentId(''); // Reset equipment selection
        } else {
            setSelectedCustomer(null);
            setCustomerEquipments([]);
        }
    }, [selectedCustomerId, customers]);
    
    const handleMaterialChange = (index: number, field: keyof Material, value: string | number) => {
        const newMaterials = [...materials];
        (newMaterials[index] as any)[field] = value;
        setMaterials(newMaterials);
    };

    const addMaterial = () => {
        setMaterials([...materials, { name: '', quantity: 1 }]);
    };
    
    const removeMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomerId || !serviceDescription) {
            alert('Por favor, preencha o cliente e a descrição do serviço.');
            return;
        }
        setIsSubmitting(true);
        
        const technician = technicians.find(t => t.id === parseInt(selectedTechnicianId));

        setTimeout(() => {
            const newOrder: ServiceOrder = {
                id: Math.max(...mockServiceOrders.map(o => o.id), 0) + 1,
                customer_id: parseInt(selectedCustomerId, 10),
                equipment_id: selectedEquipmentId ? parseInt(selectedEquipmentId, 10) : undefined,
                technician_id: selectedTechnicianId ? parseInt(selectedTechnicianId, 10) : null,
                reported_problem: serviceDescription.substring(0, 50) + '...', // Auto-generate from description
                service_description: serviceDescription,
                observations,
                geolocation: geolocationLink,
                service_type: serviceType,
                status: selectedTechnicianId ? ServiceOrderStatus.Agendada : ServiceOrderStatus.AguardandoAgendamento,
                required_materials: materials.filter(m => m.name),
                created_at: new Date().toISOString(),
            };
            
            mockServiceOrders.unshift(newOrder);

            if (technician && technician.phone) {
                const materialsList = newOrder.required_materials?.map(m => `- ${m.name} (Qtd: ${m.quantity})`).join('\n') || 'Nenhum';
                const mapsLink = newOrder.geolocation ? `\n🗺️ *Localização:* ${newOrder.geolocation}` : '';
                
                const whatsappMessage = `*Nova Ordem de Serviço #${newOrder.id}*
-----------------------------
*Cliente:* ${selectedCustomer?.name}
*Telefone:* ${selectedCustomer?.contact_phone}
*Endereço:* ${selectedCustomer?.address}
${mapsLink}
-----------------------------
*Serviço a ser realizado:*
${newOrder.service_description}
-----------------------------
*Materiais Necessários:*
${materialsList}
-----------------------------
*Observações:*
${newOrder.observations || 'Nenhuma'}
`;
                alert(`--- MENSAGEM PARA O WHATSAPP DO TÉCNICO ---\n\n(Simulação de Envio para ${technician.name})\n\n${whatsappMessage}`);
            } else {
                alert('Ordem de Serviço criada com sucesso! (Mock)');
            }
            
            setIsSubmitting(false);
            navigate('/');
        }, 500);
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <Link to="/service-orders" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar
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
                     {selectedCustomerId && customerEquipments.length > 0 && (
                         <div className="p-4 border rounded-lg">
                            <label htmlFor="equipment" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Wrench size={16} className="mr-2"/> Equipamento
                            </label>
                            <select id="equipment" value={selectedEquipmentId} onChange={e => setSelectedEquipmentId(e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                <option value="">Selecione um equipamento (Opcional)</option>
                                {customerEquipments.map(e => <option key={e.id} value={e.id}>{e.name} - {e.brand} {e.model}</option>)}
                            </select>
                        </div>
                     )}

                    {/* Service Details Section */}
                    <div className="p-4 border rounded-lg space-y-4">
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
                                <FileText size={16} className="mr-2"/> Descrição do Serviço <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea id="serviceDescription" value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} required rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Descreva detalhadamente o serviço a ser realizado..."></textarea>
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