import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ⚠️ SERVICE ROLE KEY — bypasse toutes les policies RLS.
// Usage exclusif : scripts d'ingestion (cron), Edge Functions, jamais
// importé dans un composant client ni exposé au navigateur.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
