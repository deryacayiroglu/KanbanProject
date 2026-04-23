import { createBrowserClient } from '@supabase/ssr';

// Define a singleton to avoid recreating the client on every render
let supabase: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (supabase) return supabase;

  supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabase;
}
