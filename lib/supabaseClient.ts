import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhljpcannqlylwdwafnb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobGpwY2FubnFseWx3ZHdhZm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODY5MzAsImV4cCI6MjA3ODY2MjkzMH0.9yZx5Qo2iAcgFevtulTtG70nxAw1T9WzkMSFFJqfjIM';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or anon key not configured. Please check your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
