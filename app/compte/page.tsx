import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export const metadata: Metadata = {
  title: "Mon compte",
};

export default async function ComptePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_vip, vip_expires_at")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mon compte</h1>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
        <div>
          <p className="text-xs text-neutral-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Statut</p>
          <p className="font-medium">
            {profile?.is_vip ? (
              <span className="text-yellow-600 font-semibold">
                Membre VIP
              </span>
            ) : (
              <span>Compte gratuit</span>
            )}
          </p>
        </div>
      </div>

      {!profile?.is_vip && (
        <a
          href="/vip"
          className="block text-center bg-yellow-400 text-brand-dark font-semibold px-6 py-3 rounded-full hover:bg-yellow-300 transition-colors"
        >
          Passer VIP
        </a>
      )}

      <form action={signOut}>
        <button
          type="submit"
          className="w-full border border-neutral-300 text-neutral-700 font-medium py-2.5 rounded-full hover:bg-neutral-50 transition-colors"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
