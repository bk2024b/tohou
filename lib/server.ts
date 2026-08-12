import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Utilisé dans les Server Components, Route Handlers et Server Actions.
// Respecte automatiquement les policies RLS de l'utilisateur connecté
// (ex: filtrage du contenu VIP côté base de données, pas côté UI).
//
// Non typé volontairement (pas de <Database> générique) : le code lit
// les résultats via des casts manuels (as unknown as X) définis dans
// types/index.ts, ce qui évite les frictions de typage avec la version
// exacte de @supabase/supabase-js installée. Si vous régénérez
// types/database.ts via la CLI Supabase plus tard, vous pouvez remettre
// createServerClient<Database>(...) ici.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : ignoré si un middleware
            // gère déjà le rafraîchissement de session.
          }
        },
      },
    }
  );
}

