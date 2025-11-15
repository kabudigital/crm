
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { Plus, Edit, Trash2, Search, LoaderCircle } from 'lucide-react';
import { mockUsers } from '../data/mockData';

const TechniciansPage: React.FC = () => {
    const [technicians, setTechnicians] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTechnicians = () => {
            setLoading(true);
            
            // MOCK LOGIC
            setTimeout(() => {
                const techUsers = mockUsers.filter(u => u.role === UserRole.Technician);
                setTechnicians(techUsers);
                setLoading(false);
            }, 300);
        };
        fetchTechnicians();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-brand-dark">Gerenciamento de Técnicos</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <Search className="w-5 h-5 text-gray-400" />
                      </span>
                      <input
                          type="text"
                          placeholder="Buscar técnico..."
                          className="w-full py-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                    <Link to="/technicians/new" className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                        <Plus size={20} />
                        Novo Técnico
                    </Link>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {technicians.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={`https://i.pravatar.cc/40?u=${user.email}`} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || '--'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-brand-primary rounded-full hover:bg-gray-100"><Edit size={18}/></button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TechniciansPage;