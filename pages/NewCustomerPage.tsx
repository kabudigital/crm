
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Customer } from '../types';

const NewCustomerPage: React.FC = () => {
    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [address, setAddress] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase
            .from('customers')
            .insert({
                name: name,
                cnpj_cpf: cnpj,
                address: address,
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone,
            });

        setIsSubmitting(false);
        
        if (error) {
            console.warn('Supabase write failed, using localStorage simulation.', error);
            
            // Local Storage Fallback (Kept for robustness)
            const newCustomer: Customer = {
                id: Date.now(), // Generate a temporary ID
                name,
                cnpj_cpf: cnpj,
                address,
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                created_at: new Date().toISOString()
            };

            const existingCustomers = JSON.parse(localStorage.getItem('pmoc_customers') || '[]');
            localStorage.setItem('pmoc_customers', JSON.stringify([...existingCustomers, newCustomer]));

            alert('Cliente salvo! (Modo Offline/Backup ativado)');
            navigate('/customers');
        } else {
            alert('Cliente cadastrado com sucesso no sistema!');
            navigate('/customers');
        }
    };

    return (
        <div className="space-y-6">
            <Link to="/customers" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Clientes
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-brand-dark mb-6">Cadastrar Novo Cliente</h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Cliente</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Ex: Shopping Center Norte" required />
                    </div>
                    <div>
                        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ/CPF</label>
                        <input type="text" id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="00.000.000/0001-00" />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço</label>
                        <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Av. Paulista, 1000, São Paulo, SP" />
                    </div>
                    <div>
                        <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700">Nome do Contato</label>
                        <input type="text" id="contact_name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Ana Costa" />
                    </div>
                     <div>
                        <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">Email do Contato</label>
                        <input type="email" id="contact_email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="ana.costa@example.com" />
                    </div>
                     <div>
                        <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">Telefone do Contato</label>
                        <input type="tel" id="contact_phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="(11) 99999-9999" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Link to="/customers" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-brand-primary/90 disabled:bg-gray-400">
                            {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewCustomerPage;
