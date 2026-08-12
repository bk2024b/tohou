import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// À appeler en tout premier dans chaque page/layout admin.
// Redirige vers /login si non connecté, vers / si connecté mais pas admin.
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  return { supabase, user };
}
