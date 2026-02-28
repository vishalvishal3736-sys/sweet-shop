// lib/supabase-server.ts
// Server-side Supabase client for use in Server Components and Route Handlers.
// This avoids using the browser client (which depends on document.cookie) on the server.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase URL or Anon Key is missing. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
}

// A simple, non-auth Supabase client for server-side data fetching (read-only, public data).
// This does NOT handle user sessions — it's for fetching public products, etc.
export const supabaseServer = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
