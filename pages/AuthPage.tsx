import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Technician);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password) // AVISO: Não é seguro em produção!
      .single();

    setLoading(false);
    if (data) {
      onLogin(data);
    } else {
      setError('Email ou senha inválidos.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Todos os campos são obrigatórios.');
      return;
    }
    
    setLoading(true);

    // Check if user already exists
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
    if(existingUser) {
        setError('Este email já está cadastrado.');
        setLoading(false);
        return;
    }

    const { data, error: insertError } = await supabase
      .from('users')
      .insert({ name, email, password, role })
      .select()
      .single();

    setLoading(false);
    if (data) {
        onRegister(data);
    } else {
        setError(insertError?.message || 'Ocorreu um erro ao cadastrar.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-center text-3xl font-bold text-brand-dark mb-2">
            {isLogin ? 'Bem-vindo de Volta!' : 'Crie sua Conta'}
          </h2>
          <p className="text-center text-gray-500 mb-8">
            {isLogin ? 'Acesse seu painel' : 'Rápido e fácil'}
          </p>

          <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="text-sm font-bold text-gray-600 block">Nome Completo</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 mt-1 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:border-brand-primary"
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-bold text-gray-600 block">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 mt-1 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-bold text-gray-600 block">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mt-1 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:border-brand-primary"
                required
              />
            </div>
             {!isLogin && (
              <div>
                <label htmlFor="role" className="text-sm font-bold text-gray-600 block">Tipo de Conta</label>
                 <select 
                    id="role" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-3 mt-1 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:border-brand-primary"
                 >
                    <option value={UserRole.Technician}>Técnico</option>
                    <option value={UserRole.Admin}>Administrador</option>
                 </select>
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div>
              <button type="submit" disabled={loading} className="w-full py-3 font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:bg-gray-400">
                {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-brand-primary hover:underline">
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;