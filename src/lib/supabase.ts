import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseKey !== 'your-supabase-anon-key-here'
);

export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient<Database>('https://mock-dorasani.supabase.co', 'mock-anon-key');

if (isSupabaseConfigured) {
  console.info(
    '%c[DORASANI]%c Connected to live Supabase backend (%s)',
    'color: #285A3C; font-weight: bold;',
    'color: inherit;',
    supabaseUrl
  );
} else {
  console.info(
    '%c[DORASANI]%c Running with local fallback. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    'color: #285A3C; font-weight: bold;',
    'color: inherit;'
  );
}
