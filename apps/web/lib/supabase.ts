import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Supabase public configuration is missing.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function absoluteAppUrl(path = '/') {
  if (typeof window === 'undefined') return `${basePath}${path}`;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${window.location.origin}${basePath}${normalized}`;
}
