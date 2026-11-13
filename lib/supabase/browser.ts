import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes('your-project-id') &&
      !key.includes('your-anon-key-here')
  );
}

export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (cachedClient !== undefined) {
    return cachedClient;
  }
  if (!isSupabaseConfigured()) {
    cachedClient = null;
    return null;
  }
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    cachedClient = createBrowserClient(url, key);
    return cachedClient;
  } catch {
    cachedClient = null;
    return null;
  }
}
