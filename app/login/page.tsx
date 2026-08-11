import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Connexion",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/compte");

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-center mb-8">
        Accédez à votre compte
      </h1>

      {searchParams.message && (
        <p className="max-w-sm mx-auto mb-4 text-sm text-win bg-win/10 border border-win/30 rounded-lg px-3 py-2 text-center">
          {searchParams.message}
        </p>
      )}
      {searchParams.error && (
        <p className="max-w-sm mx-auto mb-4 text-sm text-loss bg-loss/10 border border-loss/30 rounded-lg px-3 py-2 text-center">
          {searchParams.error}
        </p>
      )}

      <AuthForm initialMode="login" />
    </div>
  );
}
