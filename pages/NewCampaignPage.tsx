import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, LoaderCircle, Image as ImageIcon, Video, Users, User, Calendar, Clock, MessageSquare } from 'lucide-react';
import { Customer, CampaignStatus } from '../types';
import { supabase } from '../lib/supabaseClient';

const NewCampaignPage: React.FC = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [targetType, setTargetType] = useState<'all' | 'individual'>('all');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('customers').select('*');
            if (error || !data || data.length === 0) {
                console.warn("Mocking customers for campaign target");
                setCustomers([
                    { id: 1, name: 'Empresa Demo S.A.', created_at: '' } as any
                ]);
            } else {
                setCustomers(data);
            }
            setLoading(false);
        };

        fetchCustomers();
        
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10); // 10 minutes from now
        setScheduleDate(now.toISOString().split('T')[0]);
        setScheduleTime(now.toTimeString().substring(0, 5));
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (mediaPreview) {
                URL.revokeObjectURL(mediaPreview);
            }
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
            setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !message || !scheduleDate || !scheduleTime || (targetType === 'individual' && !selectedCustomerId)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        setIsSubmitting(true);
        
        // TODO: Handle media file upload to Supabase Storage
        
        const scheduled_at = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
        
        const { error } = await supabase.from('campaigns').insert({
            name: name,
            message: message,
            // media_url: uploadedFileUrl,
            // media_type: mediaType,
            target: targetType === 'all' ? 'all' : selectedCustomerId,
            scheduled_at: scheduled_at,
            status: CampaignStatus.Agendada,
        });

        setIsSubmitting(false);

        if (error) {
            console.warn('Simulation Mode: Campaign scheduled', error);
            alert('Modo Simulação: Campanha agendada com sucesso!');
            navigate('/campaigns');
        } else {
            alert('Campanha agendada com sucesso!');
            navigate('/campaigns');
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <Link to="/campaigns" className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                <ChevronLeft size={20} />
                Voltar para Campanhas
            </Link>

            <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-brand-dark mb-6">Agendar Nova Campanha</h1>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    
                    {/* Campaign Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome da Campanha</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" placeholder="Ex: Lembrete de Manutenção Preventiva" />
                    </div>

                    {/* Message */}
                    <div>
                        <label htmlFor="message" className="flex items-center text-sm font-medium text-gray-700 mb-1"><MessageSquare size={16} className="mr-2"/> Mensagem</label>
                        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary" placeholder="Olá, [nome_cliente]! Gostaríamos de lembrar..."></textarea>
                    </div>

                    {/* Media */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mídia (Opcional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-brand-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary">
                                        <span>Carregar arquivo</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*,video/*" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">ou arraste e solte</p>
                                </div>
                                <p className="text-xs text-gray-500">Imagem ou Vídeo</p>
                            </div>
                        </div>
                        {mediaPreview && (
                            <div className="mt-4">
                                {mediaType === 'image' ? <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-md mx-auto" /> : <video src={mediaPreview} controls className="max-h-48 rounded-md mx-auto" />}
                                <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(null); setMediaType(null); }} className="block mx-auto mt-2 text-sm text-red-500 hover:underline">Remover</button>
                            </div>
                        )}
                    </div>

                    {/* Target Audience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Destinatários</label>
                            <fieldset className="mt-2">
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input id="all" name="target" type="radio" checked={targetType === 'all'} onChange={() => setTargetType('all')} className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-gray-300" />
                                        <label htmlFor="all" className="ml-3 block text-sm font-medium text-gray-700 flex items-center"><Users size={16} className="mr-2"/> Todos os clientes</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input id="individual" name="target" type="radio" checked={targetType === 'individual'} onChange={() => setTargetType('individual')} className="focus:ring-brand-primary h-4 w-4 text-brand-primary border-gray-300" />
                                        <label htmlFor="individual" className="ml-3 block text-sm font-medium text-gray-700 flex items-center"><User size={16} className="mr-2"/> Cliente específico</label>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                        {targetType === 'individual' && (
                            <div>
                                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Selecione o Cliente</label>
                                <select id="customer" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} required={targetType === 'individual'} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary">
                                    <option value="" disabled>-- Selecione --</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    {/* Scheduling */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="scheduleDate" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Calendar size={16} className="mr-2"/> Data do Envio</label>
                            <input type="date" id="scheduleDate" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"/>
                        </div>
                         <div>
                            <label htmlFor="scheduleTime" className="flex items-center text-sm font-medium text-gray-700 mb-1"><Clock size={16} className="mr-2"/> Hora do Envio</label>
                            <input type="time" id="scheduleTime" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary"/>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t mt-6">
                        <Link to="/campaigns" className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:bg-brand-primary/90 disabled:bg-gray-400 flex items-center gap-2">
                             {isSubmitting && <LoaderCircle className="animate-spin h-4 w-4" />}
                            {isSubmitting ? 'Agendando...' : 'Agendar Campanha'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewCampaignPage;