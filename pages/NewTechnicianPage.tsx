import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { UserRole, User } from '../types';
import { supabase } from '../lib/supabaseClient';

const NewTechnicianPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        // Save the current admin session (v2)
        const { data: { session: adminSession } } = await supabase.auth.getSession();

        const { error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    role: UserRole.Technician,
                    phone: phone,
                }
            }
        });
        
        if (signUpError) {
            // SIMULATION MODE WITH LOCAL STORAGE
            console.warn("Signup failed, falling back to simulation mode with local persistence.");
            
            const newTechnician: User = {
                id: `temp-${Date.now()}`, // Generate a temp ID
                name,
                email,
                role: UserRole.Technician,
                phone
            };

            const existingTechs = JSON.parse(localStorage.getItem('pmoc_technicians') || '[]');
            localStorage.setItem('pmoc_technicians', JSON.stringify([...existingTechs, newTechnician]));

            alert("Modo Simulação: Técnico salvo localmente! (Erro no banco de dados ignorado)");
            setIsSubmitting(false);
            navigate('/technicians');
            
            // Restore session if needed (v2)
            if (adminSession) {
                 await supabase.auth.setSession({
                     access_token: adminSession.access_token,
                     refresh_token: adminSession.refresh_token
                 });
            }
            return;
        }

        // Restore the admin session (v2)
        if (adminSession) {
             await supabase.auth.setSession({
                 access_token: adminSession.access_token,
                 refresh_token: adminSession.refresh_token
             });
        }

        setIsSubmitting(false);
        navigate('/technicians');
    };

    return (
        <div className="space-y-6">
            <Link to="/technicians" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Técnicos
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold text-brand-dark mb-6">Cadastrar Novo Técnico</h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="Ex: Carlos Souza" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="carlos.souza@example.com" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" placeholder="(11) 98888-8888" />
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div className="flex justify-end gap-4 pt-4">
                        <Link to="/technicians" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-primary text-white rounded-md text-sm font-medium hover:bg-brand-primary/90 disabled:bg-gray-400">
                            {isSubmitting ? 'Salvando...' : 'Salvar Técnico'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewTechnicianPage;