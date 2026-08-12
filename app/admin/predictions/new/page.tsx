import { createClient } from "@/lib/supabase/server";
import { PredictionForm } from "@/components/admin/PredictionForm";
import { upsertPrediction } from "@/app/admin/actions";
import type { Match } from "@/types";

export default async function NewPredictionPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("matches")
    .select("*")
    .in("status", ["upcoming", "live"])
    .order("match_date", { ascending: true })
    .limit(100);

  const matches = (data ?? []) as unknown as Match[];
  const action = upsertPrediction.bind(null, null);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Nouveau pronostic</h1>
      <PredictionForm matches={matches} action={action} />
    </div>
  );
}
