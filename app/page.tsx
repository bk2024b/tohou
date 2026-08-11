import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MatchCard } from "@/components/MatchCard";
import type { Match, Prediction, Coupon } from "@/types";

// Régénération de la page toutes les 15 min : contenu frais pour le SEO
// sans surcharger la base à chaque visite.
export const revalidate = 900;

async function getTodayData() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: matches }, { data: predictions }, { data: coupon }] =
    await Promise.all([
      supabase
        .from("matches")
        .select("*, competition:competitions(*)")
        .gte("match_date", `${today}T00:00:00`)
        .lte("match_date", `${today}T23:59:59`)
        .order("match_date", { ascending: true })
        .limit(12),
      supabase
        .from("predictions")
        .select("*, match:matches(*, competition:competitions(*))")
        .order("published_at", { ascending: false })
        .limit(6),
      supabase
        .from("coupons")
        .select("*, predictions:coupon_predictions(prediction:predictions(*, match:matches(*)))")
        .eq("coupon_date", today)
        .maybeSingle(),
    ]);

  return {
    matches: (matches ?? []) as unknown as Match[],
    predictions: (predictions ?? []) as unknown as Prediction[],
    coupon: coupon as unknown as Coupon | null,
  };
}

export default async function HomePage() {
  const { matches, predictions } = await getTodayData();

  return (
    <div className="space-y-10">
      <section className="bg-gradient-to-r from-brand to-brand-light text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Les pronostics football du jour
          </h1>
          <p className="text-white/80 max-w-lg">
            Analyses, cotes et coupon du jour mis à jour chaque matin par nos
            experts.
          </p>
        </div>
        <Link
          href="/coupon-du-jour"
          className="bg-yellow-400 text-brand-dark font-semibold px-6 py-3 rounded-full whitespace-nowrap hover:bg-yellow-300 transition-colors"
        >
          Voir le coupon du jour
        </Link>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pronostics récents</h2>
          <Link href="/pronostics" className="text-brand text-sm font-medium">
            Tout voir →
          </Link>
        </div>
        {predictions.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            Aucun pronostic publié pour le moment.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map(
              (p) =>
                p.match && (
                  <MatchCard key={p.id} match={p.match} prediction={p} />
                )
            )}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Événements du jour</h2>
          <Link href="/evenements" className="text-brand text-sm font-medium">
            Tout voir →
          </Link>
        </div>
        {matches.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            Aucun match programmé pour aujourd&apos;hui dans nos compétitions
            suivies.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
