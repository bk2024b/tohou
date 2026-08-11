import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Prediction, Match } from "@/types";

export const revalidate = 300;

async function getPrediction(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("predictions")
    .select("*, match:matches(*, competition:competitions(*))")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;

  const prediction = data as unknown as Prediction & { match: Match };

  // Le texte complet passe par une fonction RPC qui applique la logique
  // VIP côté base de données (voir get_prediction_content dans schema.sql).
  // Elle renvoie null si le pronostic est VIP et que l'utilisateur ne l'est pas.
  const { data: fullText } = await supabase.rpc("get_prediction_content", {
    prediction_id: prediction.id,
  });

  return { prediction, fullText: fullText as string | null };
}

export async function generateMetadata({
  params,
}: {
  params: { date: string; slug: string };
}): Promise<Metadata> {
  const result = await getPrediction(params.slug);
  if (!result) return {};
  return {
    title: result.prediction.title,
    description: result.prediction.analysis_preview ?? undefined,
  };
}

export default async function PredictionDetailPage({
  params,
}: {
  params: { date: string; slug: string };
}) {
  const result = await getPrediction(params.slug);
  if (!result) notFound();

  const { prediction, fullText } = result;
  const isLocked = prediction.is_vip && !fullText;

  return (
    <article className="max-w-2xl mx-auto space-y-6">
      <header>
        <p className="text-sm text-neutral-500">
          {prediction.match?.competition?.name} ·{" "}
          {new Date(prediction.match?.match_date ?? "").toLocaleString(
            "fr-FR"
          )}
        </p>
        <h1 className="text-2xl font-bold mt-1">{prediction.title}</h1>
      </header>

      <div className="flex items-center gap-4 bg-white border border-neutral-200 rounded-xl p-4">
        <div>
          <p className="text-xs text-neutral-500">Pronostic</p>
          <p className="font-semibold">{prediction.predicted_outcome}</p>
        </div>
        {prediction.predicted_odds && (
          <div>
            <p className="text-xs text-neutral-500">Cote</p>
            <p className="font-bold text-brand text-lg">
              @{prediction.predicted_odds}
            </p>
          </div>
        )}
      </div>

      {isLocked ? (
        <div className="relative">
          <p className="text-neutral-700 blur-sm select-none">
            {prediction.analysis_preview ??
              "Analyse complète réservée aux membres VIP..."}
          </p>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
            <p className="font-semibold mb-3">
              Analyse complète réservée aux membres VIP
            </p>
            <Link
              href="/vip"
              className="bg-yellow-400 text-brand-dark font-semibold px-5 py-2.5 rounded-full hover:bg-yellow-300 transition-colors"
            >
              Débloquer avec VIP
            </Link>
          </div>
        </div>
      ) : (
        <div className="prose max-w-none whitespace-pre-line">
          {fullText}
        </div>
      )}
    </article>
  );
}
