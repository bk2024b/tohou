import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MatchCard } from "@/components/MatchCard";
import type { Coupon, Prediction } from "@/types";

export const metadata: Metadata = {
  title: "Coupon du jour — Combiné cote 2",
  description:
    "Notre coupon combiné du jour, sélectionné par nos experts, mis à jour chaque matin.",
};

export const revalidate = 900;

export default async function CouponDuJourPage() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("coupons")
    .select(
      "*, coupon_predictions(prediction:predictions(*, match:matches(*, competition:competitions(*))))"
    )
    .eq("coupon_date", today)
    .maybeSingle();

  const coupon = data as unknown as
    | (Coupon & {
        coupon_predictions: { prediction: Prediction }[];
      })
    | null;

  if (!coupon) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Coupon du jour</h1>
        <p className="text-neutral-500">
          Le coupon du jour n&apos;est pas encore disponible. Revenez un peu
          plus tard.
        </p>
      </div>
    );
  }

  const predictions = coupon.coupon_predictions.map((cp) => cp.prediction);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-brand to-brand-light text-white rounded-2xl p-6 text-center">
        <h1 className="text-xl font-bold">{coupon.title}</h1>
        <p className="text-4xl font-extrabold mt-2">
          @{coupon.total_odds ?? "—"}
        </p>
        <p className="text-white/80 text-sm mt-1">
          {new Date(coupon.coupon_date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      <div className="space-y-3">
        {predictions.map(
          (p) => p.match && <MatchCard key={p.id} match={p.match} prediction={p} />
        )}
      </div>

      <p className="text-xs text-neutral-400 text-center">
        Pronostics fournis à titre informatif. Jouez avec modération, 18+.
      </p>
    </div>
  );
}
