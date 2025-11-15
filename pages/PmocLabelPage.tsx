import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ChevronLeft, LoaderCircle, MapPin, HardHat, Calendar, Wrench, Settings, FileText } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ServiceOrder } from '../types';
import { supabase } from '../lib/supabaseClient';

const PmocLabelPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<ServiceOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            setLoading(true);
            
            const { data, error } = await supabase
                .from('service_orders')
                .select('*, customers (*), users (*), equipments (*)')
                .eq('id', parseInt(id, 10))
                .single();

            if (error) {
                console.error("Error fetching order for label", error);
            } else {
                setOrder(data as ServiceOrder);
            }
            setLoading(false);
        };
        fetchOrder();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><LoaderCircle className="animate-spin h-12 w-12 text-brand-primary" /></div>;
    }

    if (!order || !order.equipments || !order.users) {
        return (
            <div className="text-center p-10 h-screen">
                <h1 className="text-2xl font-bold">Dados da Ordem de Serviço incompletos para gerar a etiqueta.</h1>
                <Link to={`/service-orders/${id}`} className="text-brand-primary hover:underline mt-4 inline-block">Voltar para a O.S.</Link>
            </div>
        );
    }

    const equipment = order.equipments;
    const technician = order.users;
    const equipmentUrl = `${window.location.origin}/equipment/${equipment.id}`;

    return (
        <>
            <style>
                {`
                    @media print {
                        body {
                            background-color: white;
                        }
                        .no-print {
                            display: none;
                        }
                        .printable-area {
                            margin: 0;
                            padding: 0;
                            border: none;
                            box-shadow: none;
                            width: 100%;
                            height: 100%;
                        }
                    }
                `}
            </style>
            <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="no-print mb-6 flex justify-between items-center">
                        <Link to={`/service-orders/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-brand-dark">
                            <ChevronLeft size={20} />
                            Voltar para O.S.
                        </Link>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90">
                            <Printer size={20} />
                            Imprimir Etiqueta
                        </button>
                    </div>
                    
                    <div className="printable-area bg-white p-6 rounded-xl shadow-lg border-4 border-blue-800">
                        <header className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
                            <div>
                                <h1 className="text-2xl font-bold text-blue-900">RELATÓRIO DE MANUTENÇÃO</h1>
                                <p className="text-lg font-semibold text-gray-700">PMOC - Lei 13.589/2018</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-800">OS #{order.id}</p>
                            </div>
                        </header>

                        <main className="grid grid-cols-3 gap-6 mt-4">
                            <div className="col-span-2 space-y-4">
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <h3 className="font-bold text-gray-600 uppercase text-sm flex items-center"><Wrench size={16} className="mr-2"/> Equipamento</h3>
                                    <p className="text-lg font-semibold text-gray-900">{equipment.name}</p>
                                </div>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="p-3 bg-gray-50 rounded-md">
                                        <h3 className="font-bold text-gray-600 uppercase text-sm flex items-center"><MapPin size={16} className="mr-2"/> Local de Instalação</h3>
                                        <p className="text-md font-semibold text-gray-900">{order.customers?.address}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <h3 className="font-bold text-gray-600 uppercase text-sm flex items-center"><Settings size={16} className="mr-2"/> Capacidade</h3>
                                        <p className="text-md font-semibold text-gray-900">{equipment.capacity_btu ? `${equipment.capacity_btu.toLocaleString('pt-BR')} BTUs` : 'Não informado'}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-md">
                                    <h3 className="font-bold text-gray-600 uppercase text-sm flex items-center"><FileText size={16} className="mr-2"/> Serviço Prestado</h3>
                                    <p className="text-sm text-gray-800 mt-1">{order.technical_report}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <h3 className="font-bold text-gray-600 uppercase text-sm flex items-center"><Calendar size={16} className="mr-2"/> Data da Manutenção</h3>
                                        <p className="text-md font-semibold text-gray-900">{order.completed_at ? new Date(order.completed_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-md">
                                        <h3 className="font-bold text-gray-600 uppercase text-sm flex items-center"><HardHat size={16} className="mr-2"/> Técnico Responsável</h3>
                                        <p className="text-md font-semibold text-gray-900">{technician.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-1 flex flex-col items-center justify-center p-4 bg-gray-100 rounded-lg">
                                <QRCodeSVG value={equipmentUrl} size={160} />
                                <p className="text-center text-xs text-gray-600 mt-3 font-semibold">
                                    Aponte a câmera para acessar o histórico completo do equipamento.
                                </p>
                            </div>
                        </main>
                        
                        <footer className="mt-6 text-center text-xs text-gray-500 border-t-2 border-gray-300 pt-3">
                            CRM OS - Sistema de Gestão de Manutenção
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PmocLabelPage;