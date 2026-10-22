import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  supabaseAnonKey !== 'your-supabase-anon-key-here'
);

// If Supabase is configured with real URL and key, create the real client;
// otherwise create a safe fallback client to avoid runtime crashes.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://mock-dorasani.supabase.co', 'mock-anon-key');

if (!isSupabaseConfigured) {
  console.info(
    '%c[DORASANI]%c Running with local persistent storage fallback. To connect to live Supabase, configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.',
    'color: #AC1443; font-weight: bold;',
    'color: inherit;'
  );
}
