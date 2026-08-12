import { createClient } from "@/lib/supabase/server";
import { setCouponOdds, togglePredictionInCoupon } from "@/app/admin/actions";
import type { Prediction, Match, Coupon } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || new Date().toISOString().slice(0, 10);
  const supabase = createClient();

  const [{ data: couponData }, { data: predictionsData }] = await Promise.all([
    supabase
      .from("coupons")
      .select("*, coupon_predictions(prediction_id)")
      .eq("coupon_date", date)
      .maybeSingle(),
    supabase
      .from("predictions")
      .select("*, match:matches(*)")
      .gte("published_at", `${date}T00:00:00`)
      .lte("published_at", `${date}T23:59:59`)
      .order("published_at", { ascending: false }),
  ]);

  const coupon = couponData as unknown as
    | (Coupon & { coupon_predictions: { prediction_id: string }[] })
    | null;
  const predictions = (predictionsData ?? []) as unknown as (Prediction & {
    match: Match;
  })[];
  const includedIds = new Set(
    (coupon?.coupon_predictions ?? []).map((cp) => cp.prediction_id)
  );

  const setOddsAction = setCouponOdds.bind(null, date);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">
          Coupon du {new Date(date).toLocaleDateString("fr-FR")}
        </h1>
        <form method="get" className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="border border-neutral-300 rounded-lg px-2 py-1 text-sm"
          />
          <button type="submit" className="text-sm text-brand font-medium">
            Changer
          </button>
        </form>
      </div>

      <form action={setOddsAction} className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Cote totale du coupon
          </label>
          <input
            type="number"
            step="0.01"
            name="total_odds"
            defaultValue={coupon?.total_odds ?? ""}
            className="border border-neutral-300 rounded-lg px-3 py-2 w-32"
          />
        </div>
        <button
          type="submit"
          className="bg-brand text-white font-semibold px-5 py-2.5 rounded-full hover:bg-brand-dark transition-colors"
        >
          Enregistrer la cote
        </button>
      </form>

      <div>
        <h2 className="font-semibold mb-2">Pronostics publiés ce jour-là</h2>
        {predictions.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Aucun pronostic publié à cette date. Créez d&apos;abord des
            pronostics pour ce jour.
          </p>
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-200">
            {predictions.map((p) => {
              const included = includedIds.has(p.id);
              const toggle = togglePredictionInCoupon.bind(
                null,
                date,
                p.id,
                !included
              );
              return (
                <form
                  key={p.id}
                  action={toggle}
                  className="flex items-center justify-between px-4 py-3 gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {p.match?.home_team} vs {p.match?.away_team}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {p.predicted_outcome}{" "}
                      {p.predicted_odds ? `@${p.predicted_odds}` : ""}
                    </p>
                  </div>
                  <button
                    type="submit"
                    className={`text-sm font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${
                      included
                        ? "bg-win/10 text-win"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {included ? "Dans le coupon ✓" : "Ajouter"}
                  </button>
                </form>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
