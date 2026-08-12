import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deletePrediction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Prediction, Match } from "@/types";

export const dynamic = "force-dynamic";

const RESULT_LABEL: Record<Prediction["result"], string> = {
  pending: "En attente",
  won: "Gagné",
  lost: "Perdu",
  void: "Annulé",
};

export default async function AdminPredictionsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("predictions")
    .select("*, match:matches(*)")
    .order("published_at", { ascending: false })
    .limit(100);

  const predictions = (data ?? []) as unknown as (Prediction & {
    match: Match;
  })[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Pronostics</h1>
        <Link
          href="/admin/predictions/new"
          className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-dark transition-colors"
        >
          + Ajouter
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-200">
        {predictions.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3 gap-4">
            <div className="min-w-0">
              <p className="font-medium truncate">{p.title}</p>
              <p className="text-xs text-neutral-500 truncate">
                {p.match?.home_team} vs {p.match?.away_team} · {p.predicted_outcome}
                {p.is_vip && (
                  <span className="ml-2 text-yellow-600 font-semibold">VIP</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 whitespace-nowrap">
                {RESULT_LABEL[p.result]}
              </span>
              <Link
                href={`/admin/predictions/${p.id}`}
                className="text-sm text-brand font-medium hover:underline"
              >
                Modifier
              </Link>
              <DeleteButton onDelete={deletePrediction.bind(null, p.id)} />
            </div>
          </div>
        ))}
        {predictions.length === 0 && (
          <p className="px-4 py-6 text-sm text-neutral-500">
            Aucun pronostic pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
