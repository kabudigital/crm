import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Building, Mail, Phone, LoaderCircle } from 'lucide-react';
import { Customer } from '../types';
import { supabase } from '../lib/supabaseClient';

const CustomerCard: React.FC<{ customer: Customer }> = ({ customer }) => {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
            <div className="p-5 flex-grow">
                <div className="flex items-start">
                    <div className="flex-shrink-0 p-3 bg-brand-primary/10 rounded-full mr-4">
                       <Building className="h-6 w-6 text-brand-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-brand-dark">{customer.name}</h3>
                        <p className="text-sm text-gray-500">{customer.address}</p>
                    </div>
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                        <Mail size={14} className="mr-2 text-gray-400"/> {customer.contact_email || 'N/A'}
                    </div>
                    <div className="flex items-center">
                        <Phone size={14} className="mr-2 text-gray-400"/> {customer.contact_phone || 'N/A'}
                    </div>
                </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t flex justify-end">
                <Link to={`/customers/${customer.id}`} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                    Ver Detalhes
                </Link>
            </div>
        </div>
    );
}

const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        
        let query = supabase
            .from('customers')
            .select('*')
            .order('name', { ascending: true });

        if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('Error fetching customers:', error);
        } else {
            setCustomers(data);
        }
        setLoading(false);
    }, [searchTerm]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <h1 className="text-2xl font-bold text-brand-dark">Clientes</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por nome..."
                            className="w-full py-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Link to="/customers/new" className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                        <Plus size={20} />
                        Novo Cliente
                    </Link>
                </div>
            </div>
            
            {loading ? (
                 <div className="flex justify-center items-center p-10"><LoaderCircle className="animate-spin h-8 w-8 text-brand-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.map(customer => (
                        <CustomerCard key={customer.id} customer={customer} />
                    ))}
                    {customers.length === 0 && <p className="text-center text-gray-500 md:col-span-2 lg:col-span-3">Nenhum cliente encontrado.</p>}
                </div>
            )}
        </div>
    );
};

export default CustomersPage;