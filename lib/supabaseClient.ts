import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Substitua pelos dados do seu projeto Supabase.
const supabaseUrl = 'SUA_URL_DO_SUPABASE'; // Ex: 'https://xxxxxxxx.supabase.co'
const supabaseAnonKey = 'SUA_CHAVE_ANON_DO_SUPABASE'; // A chave 'anon' pública

if (!supabaseUrl || supabaseUrl === 'SUA_URL_DO_SUPABASE' || !supabaseAnonKey || supabaseAnonKey === 'SUA_CHAVE_ANON_DO_SUPABASE') {
    console.warn("Supabase URL or anon key not configured. Please update lib/supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);