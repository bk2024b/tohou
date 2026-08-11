import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MatchCard } from "@/components/MatchCard";
import type { Match } from "@/types";

export const metadata: Metadata = {
  title: "Événements du jour",
  description: "Tous les matchs de football programmés aujourd'hui.",
};

export const revalidate = 900;

export default async function EvenementsPage() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("matches")
    .select("*, competition:competitions(*)")
    .gte("match_date", `${today}T00:00:00`)
    .lte("match_date", `${today}T23:59:59`)
    .order("match_date", { ascending: true });

  const matches = (data ?? []) as unknown as Match[];

  // Regroupement par compétition pour une lecture plus rapide
  const byCompetition = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = m.competition?.name ?? "Autres";
    acc[key] = acc[key] ?? [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Événements du jour</h1>

      {Object.keys(byCompetition).length === 0 ? (
        <p className="text-neutral-500">
          Aucun match programmé aujourd&apos;hui.
        </p>
      ) : (
        Object.entries(byCompetition).map(([competition, list]) => (
          <section key={competition}>
            <h2 className="text-lg font-semibold mb-3">{competition}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
