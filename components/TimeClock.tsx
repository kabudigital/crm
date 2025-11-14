
import React, { useState, useEffect } from 'react';
import { Clock, Coffee, LogIn, LogOut } from 'lucide-react';

type ClockStatus = 'not_clocked_in' | 'clocked_in' | 'on_lunch' | 'clocked_out';

interface TimeLog {
  label: string;
  time: string;
}

const TimeClock: React.FC = () => {
  const [status, setStatus] = useState<ClockStatus>('not_clocked_in');
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClockAction = (newStatus: ClockStatus, label: string) => {
    setStatus(newStatus);
    setTimeLogs([...timeLogs, { label, time: new Date().toLocaleTimeString('pt-BR') }]);
  };

  const renderButtons = () => {
    switch (status) {
      case 'not_clocked_in':
        return (
          <button
            onClick={() => handleClockAction('clocked_in', 'Entrada')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
          >
            <LogIn size={20} /> Registrar Entrada
          </button>
        );
      case 'clocked_in':
        return (
          <div className="flex gap-4">
            <button
              onClick={() => handleClockAction('on_lunch', 'Início Almoço')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              <Coffee size={20} /> Iniciar Almoço
            </button>
            <button
              onClick={() => handleClockAction('clocked_out', 'Saída')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={20} /> Registrar Saída
            </button>
          </div>
        );
      case 'on_lunch':
        return (
          <button
            onClick={() => handleClockAction('clocked_in', 'Fim Almoço')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Coffee size={20} /> Finalizar Almoço
          </button>
        );
      case 'clocked_out':
        return <p className="text-center text-green-600 font-semibold">Dia de trabalho finalizado!</p>;
    }
  };

  const getStatusText = () => {
      switch(status) {
          case 'not_clocked_in': return { text: 'Aguardando Entrada', color: 'text-gray-500'};
          case 'clocked_in': return { text: 'Trabalhando', color: 'text-green-600'};
          case 'on_lunch': return { text: 'Em Horário de Almoço', color: 'text-yellow-600'};
          case 'clocked_out': return { text: 'Expediente Encerrado', color: 'text-red-600'};
      }
  }

  const { text, color } = getStatusText();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-brand-dark mb-4">Ponto Eletrônico</h2>
      <div className="text-center p-4 border rounded-lg bg-gray-50 mb-6">
        <p className="text-3xl font-mono tracking-widest text-brand-dark">{currentTime.toLocaleTimeString('pt-BR')}</p>
        <p className={`font-semibold mt-1 ${color}`}>{text}</p>
      </div>
      
      <div className="mb-6">
        {renderButtons()}
      </div>

      <div>
        <h3 className="text-md font-semibold text-gray-700 mb-2">Marcações de Hoje</h3>
        {timeLogs.length > 0 ? (
            <ul className="space-y-2">
            {timeLogs.map((log, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <span className="font-medium text-gray-800">{log.label}</span>
                <span className="font-mono text-gray-600">{log.time}</span>
                </li>
            ))}
            </ul>
        ) : (
            <p className="text-center text-gray-500 text-sm">Nenhuma marcação registrada.</p>
        )}
      </div>
    </div>
  );
};

export default TimeClock;
