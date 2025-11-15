import { createClient } from '@supabase/supabase-js';

// ATENÇÃO: Substitua pelos dados do seu projeto Supabase.
const supabaseUrl = 'https://uhljpcannqlylwdwafnb.supabase.co'; // Ex: 'https://xxxxxxxx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobGpwY2FubnFseWx3ZHdhZm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODY5MzAsImV4cCI6MjA3ODY2MjkzMH0.9yZx5Qo2iAcgFevtulTtG70nxAw1T9WzkMSFFJqfjIM'; // A chave 'anon' pública

// FIX: Removed comparisons to placeholder strings that caused TypeScript errors.
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or anon key not configured. Please update lib/supabaseClient.ts");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);