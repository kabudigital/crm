
import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, LoaderCircle, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Equipment } from '../types';

const NewEquipmentPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId) return;
        setIsSubmitting(true);

        const newEquipmentData = {
            customer_id: parseInt(customerId, 10),
            name: name, // Used as Description/Name
            brand: brand,
            model: model,
            serial_number: serialNumber,
            capacity_btu: parseInt(capacity, 10) || 0,
            type: type,
            location: location
        };

        const { error } = await supabase
            .from('equipments')
            .insert(newEquipmentData);

        setIsSubmitting(false);
        
        if (error) {
            console.warn('Supabase write failed, using localStorage simulation.', error);
            
            // Local Storage Fallback
            const newEquipment: Equipment = {
                id: Date.now(),
                ...newEquipmentData,
                created_at: new Date().toISOString()
            };

            const existingEquipments = JSON.parse(localStorage.getItem('pmoc_equipments') || '[]');
            localStorage.setItem('pmoc_equipments', JSON.stringify([...existingEquipments, newEquipment]));

            alert('Modo Simulação: Equipamento salvo localmente!');
            navigate(`/customers/${customerId}`);
        } else {
            alert('Equipamento cadastrado com sucesso!');
            navigate(`/customers/${customerId}`);
        }
    };

    return (
        <div className="space-y-6">
            <Link to={`/customers/${customerId}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para o Cliente
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-brand-dark mb-6 flex items-center">
                    <Wrench className="mr-3 text-brand-primary" /> Cadastrar Novo Equipamento
                </h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Equipamento</label>
                            <select id="type" value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                <option value="">Selecione...</option>
                                <option value="Split Hi-Wall">Split Hi-Wall</option>
                                <option value="Split Cassete">Split Cassete</option>
                                <option value="Piso Teto">Piso Teto</option>
                                <option value="ACJ">ACJ (Janela)</option>
                                <option value="VRF">VRF</option>
                                <option value="Chiller">Chiller</option>
                                <option value="Self Contained">Self Contained</option>
                                <option value="Fancoil">Fancoil</option>
                                <option value="Exaustor">Exaustor</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome / Identificação</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Ex: Ar Condicionado Sala 01" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca</label>
                            <input type="text" id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Ex: Samsung" />
                        </div>
                        <div>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Modelo</label>
                            <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Ex: AR12..." />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacidade (BTUs)</label>
                            <input type="number" id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="12000" />
                        </div>
                        <div>
                            <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">Número de Série</label>
                            <input type="text" id="serialNumber" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="SN123456" />
                        </div>
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Local de Instalação</label>
                            <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Ex: Sala de Reunião" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link to={`/customers/${customerId}`} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-brand-primary/90 disabled:bg-gray-400 flex items-center gap-2">
                            {isSubmitting && <LoaderCircle className="animate-spin h-4 w-4" />}
                            {isSubmitting ? 'Salvando...' : 'Salvar Equipamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewEquipmentPage;
