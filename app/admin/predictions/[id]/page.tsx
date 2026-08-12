import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PredictionForm } from "@/components/admin/PredictionForm";
import { upsertPrediction } from "@/app/admin/actions";
import type { Prediction, Match } from "@/types";

export default async function EditPredictionPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: predictionData }, { data: matchesData }] = await Promise.all([
    supabase.from("predictions").select("*").eq("id", params.id).maybeSingle(),
    supabase
      .from("matches")
      .select("*")
      .in("status", ["upcoming", "live"])
      .order("match_date", { ascending: true })
      .limit(100),
  ]);

  if (!predictionData) notFound();

  const prediction = predictionData as unknown as Prediction & {
    analysis_text: string;
  };
  const matches = (matchesData ?? []) as unknown as Match[];
  const action = upsertPrediction.bind(null, prediction.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Modifier le pronostic</h1>
      <PredictionForm prediction={prediction} matches={matches} action={action} />
    </div>
  );
}
