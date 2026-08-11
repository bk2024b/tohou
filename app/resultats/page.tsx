import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Prediction, Match } from "@/types";

export const metadata: Metadata = {
  title: "Résultats de nos pronostics",
  description:
    "Historique transparent de nos pronostics passés : taux de réussite et résultats détaillés.",
};

export const revalidate = 600;

const RESULT_STYLE: Record<Prediction["result"], string> = {
  won: "bg-win/10 text-win border-win/30",
  lost: "bg-loss/10 text-loss border-loss/30",
  pending: "bg-pending/10 text-pending border-pending/30",
  void: "bg-neutral-100 text-neutral-500 border-neutral-300",
};

const RESULT_LABEL: Record<Prediction["result"], string> = {
  won: "Gagné",
  lost: "Perdu",
  pending: "En attente",
  void: "Annulé",
};

export default async function ResultatsPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("predictions")
    .select("*, match:matches(*)")
    .neq("result", "pending")
    .order("published_at", { ascending: false })
    .limit(50);

  const predictions = (data ?? []) as unknown as (Prediction & {
    match: Match;
  })[];

  const settled = predictions.filter((p) => p.result !== "void");
  const won = settled.filter((p) => p.result === "won").length;
  const winRate = settled.length
    ? Math.round((won / settled.length) * 100)
    : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Résultats de nos pronostics</h1>
        {winRate !== null && (
          <p className="text-4xl font-extrabold text-brand mt-2">
            {winRate}% de réussite
          </p>
        )}
        <p className="text-sm text-neutral-500">
          Sur les {settled.length} derniers pronostics réglés
        </p>
      </div>

      <div className="divide-y divide-neutral-200 bg-white border border-neutral-200 rounded-xl">
        {predictions.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div>
              <p className="font-medium text-sm">
                {p.match?.home_team} vs {p.match?.away_team}
              </p>
              <p className="text-xs text-neutral-500">
                {p.predicted_outcome}{" "}
                {p.predicted_odds ? `@${p.predicted_odds}` : ""}
              </p>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                RESULT_STYLE[p.result]
              }`}
            >
              {RESULT_LABEL[p.result]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
