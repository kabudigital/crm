import React, { useState } from 'react';
import { UserRole } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Shield, Wrench, LoaderCircle, Info } from 'lucide-react';

const AuthPage: React.FC = () => {
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

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    setLoading(false);
    if (error) {
      setError(error.message || 'Credenciais inválidas ou erro no servidor.');
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

    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          role: role,
        }
      }
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }
    
    if (!user) {
       setLoading(false);
       setError("Cadastro realizado, mas não foi possível iniciar a sessão automaticamente.");
    }
    // The App.tsx onAuthStateChange listener will handle the redirect
  };

  // --- DEMO LOGIN LOGIC ---
  const handleDemoLogin = async (type: 'admin' | 'tech') => {
      setLoading(true);
      setError('');

      const demoUser = type === 'admin' ? {
          email: 'admin@pmoc.demo',
          password: 'demo_password_123',
          name: 'Administrador Demo',
          role: UserRole.Admin
      } : {
          email: 'tecnico@pmoc.demo',
          password: 'demo_password_123',
          name: 'Técnico Demo',
          role: UserRole.Technician
      };

      // 1. Try to login
      const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
          email: demoUser.email,
          password: demoUser.password
      });

      if (user) {
          // Login Success
          return; // App.tsx will handle redirect
      }

      // 2. If Login fails (User likely doesn't exist), create it
      console.log("Demo user not found, creating...", loginError?.message);
      
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
          email: demoUser.email,
          password: demoUser.password,
          options: {
            data: { name: demoUser.name, role: demoUser.role }
          }
      });

      if (signUpError) {
          setError(`Erro ao criar usuário demo: ${signUpError.message}`);
          setLoading(false);
      } else if (newUser) {
          // Sign Up Success and Session created
          return; // App.tsx will handle redirect
      } else {
          // Sign up might require email verification (depends on Supabase settings)
          // But for this demo environment we assume it auto-confirms or we show message
          setError("Usuário demo criado. Verifique se o email precisa de confirmação ou tente entrar novamente.");
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
             <h1 className="text-3xl font-bold text-brand-primary">Sistema PMOC</h1>
             <p className="text-gray-500">Gestão de Manutenção e O.S.</p>
          </div>

          <h2 className="text-xl font-semibold text-brand-dark mb-4">
            {isLogin ? 'Acesse sua conta' : 'Crie uma nova conta'}
          </h2>

          {/* DEMO BUTTONS */}
          {isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                      onClick={() => handleDemoLogin('admin')}
                      className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all group"
                      disabled={loading}
                    >
                        <Shield className="h-6 w-6 text-brand-primary mb-1 group-hover:scale-110 transition-transform"/>
                        <span className="text-xs font-bold text-gray-700">Demo Admin</span>
                    </button>
                    <button 
                      onClick={() => handleDemoLogin('tech')}
                      className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-all group"
                      disabled={loading}
                    >
                        <Wrench className="h-6 w-6 text-status-green mb-1 group-hover:scale-110 transition-transform"/>
                        <span className="text-xs font-bold text-gray-700">Demo Técnico</span>
                    </button>
                </div>
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border mb-6 flex items-start gap-2">
                    <Info size={14} className="mt-0.5 text-brand-primary flex-shrink-0"/>
                    <div>
                        <p><strong>Admin:</strong> admin@pmoc.demo / demo_password_123</p>
                        <p><strong>Técnico:</strong> tecnico@pmoc.demo / demo_password_123</p>
                    </div>
                </div>
              </>
          )}

          {isLogin && (
              <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">ou entre com email</span>
                  </div>
              </div>
          )}

          <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700 block">Nome Completo</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
             {!isLogin && (
              <div>
                <label htmlFor="role" className="text-sm font-medium text-gray-700 block">Tipo de Conta</label>
                 <select 
                    id="role" 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                 >
                    <option value={UserRole.Technician}>Técnico</option>
                    <option value={UserRole.Admin}>Administrador</option>
                 </select>
              </div>
            )}

            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

            <div>
              <button type="submit" disabled={loading} className="w-full py-3 font-bold text-white bg-brand-dark rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex justify-center items-center gap-2">
                {loading && <LoaderCircle className="animate-spin h-5 w-5" />}
                {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
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