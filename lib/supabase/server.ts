import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// Utilisé dans les Server Components, Route Handlers et Server Actions.
// Respecte automatiquement les policies RLS de l'utilisateur connecté
// (ex: filtrage du contenu VIP côté base de données, pas côté UI).
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
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
