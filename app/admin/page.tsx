import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { count: bookmakersCount },
    { count: predictionsCount },
    { count: matchesCount },
  ] = await Promise.all([
    supabase.from("bookmakers").select("*", { count: "exact", head: true }),
    supabase.from("predictions").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Bookmakers", count: bookmakersCount ?? 0, href: "/admin/bookmakers" },
    { label: "Pronostics", count: predictionsCount ?? 0, href: "/admin/predictions" },
    { label: "Matchs en base", count: matchesCount ?? 0, href: "/admin/coupons" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Tableau de bord</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white border border-neutral-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <p className="text-3xl font-bold text-brand">{c.count}</p>
            <p className="text-sm text-neutral-500">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
