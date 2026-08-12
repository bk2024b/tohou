"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface FormActionState {
  error: string | null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function optionalText(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function optionalNumber(formData: FormData, key: string): number | null {
  const value = formData.get(key);
  if (!value || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

// ============================================================
// BOOKMAKERS
// ============================================================
export async function upsertBookmaker(
  id: string | null,
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Le nom est requis." };

  const supabase = createClient();
  const slug = optionalText(formData, "slug") ?? slugify(name);

  const payload = {
    name,
    slug,
    logo_url: optionalText(formData, "logo_url"),
    description: optionalText(formData, "description"),
    bonus_text: optionalText(formData, "bonus_text"),
    rating: optionalNumber(formData, "rating"),
    affiliate_link: optionalText(formData, "affiliate_link"),
    legal_disclaimer: optionalText(formData, "legal_disclaimer"),
    is_published: formData.get("is_published") === "on",
  };

  const { error } = id
    ? await supabase.from("bookmakers").update(payload).eq("id", id)
    : await supabase.from("bookmakers").insert(payload);

  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Ce slug est déjà utilisé par un autre bookmaker."
        : error.message,
    };
  }

  revalidatePath("/admin/bookmakers");
  revalidatePath("/bookmakers");
  redirect("/admin/bookmakers");
}

export async function deleteBookmaker(id: string) {
  const supabase = createClient();
  await supabase.from("bookmakers").delete().eq("id", id);
  revalidatePath("/admin/bookmakers");
  revalidatePath("/bookmakers");
}

// ============================================================
// PREDICTIONS
// ============================================================
export async function upsertPrediction(
  id: string | null,
  _prevState: FormActionState,
  formData: FormData
): Promise<FormActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const matchId = String(formData.get("match_id") ?? "");
  const analysisText = String(formData.get("analysis_text") ?? "").trim();
  const predictedOutcome = String(formData.get("predicted_outcome") ?? "").trim();

  if (!title || !matchId || !analysisText || !predictedOutcome) {
    return {
      error: "Match, titre, analyse et pronostic affiché sont obligatoires.",
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const slug = optionalText(formData, "slug") ?? slugify(title);

  const payload = {
    match_id: matchId,
    author_id: user?.id ?? null,
    slug,
    title,
    analysis_text: analysisText,
    analysis_preview: optionalText(formData, "analysis_preview"),
    predicted_outcome: predictedOutcome,
    market: optionalText(formData, "market"),
    selection: optionalText(formData, "selection"),
    predicted_odds: optionalNumber(formData, "predicted_odds"),
    confidence_level: optionalNumber(formData, "confidence_level"),
    is_vip: formData.get("is_vip") === "on",
  };

  const { error } = id
    ? await supabase.from("predictions").update(payload).eq("id", id)
    : await supabase.from("predictions").insert(payload);

  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Ce slug est déjà utilisé par un autre pronostic."
        : error.message,
    };
  }

  revalidatePath("/admin/predictions");
  revalidatePath("/");
  revalidatePath("/pronostics");
  redirect("/admin/predictions");
}

export async function deletePrediction(id: string) {
  const supabase = createClient();
  await supabase.from("predictions").delete().eq("id", id);
  revalidatePath("/admin/predictions");
  revalidatePath("/");
}

// ============================================================
// COUPON DU JOUR
// ============================================================
export async function setCouponOdds(couponDate: string, formData: FormData) {
  const supabase = createClient();
  const totalOdds = optionalNumber(formData, "total_odds");

  await supabase
    .from("coupons")
    .upsert({ coupon_date: couponDate, total_odds: totalOdds }, { onConflict: "coupon_date" });

  revalidatePath("/admin/coupons");
  revalidatePath("/coupon-du-jour");
}

export async function togglePredictionInCoupon(
  couponDate: string,
  predictionId: string,
  include: boolean
) {
  const supabase = createClient();

  // S'assure que le coupon du jour existe sans écraser sa cote déjà saisie
  const { data: coupon } = await supabase
    .from("coupons")
    .upsert({ coupon_date: couponDate }, { onConflict: "coupon_date" })
    .select("id")
    .single();

  if (!coupon) return;

  if (include) {
    await supabase
      .from("coupon_predictions")
      .insert({ coupon_id: coupon.id, prediction_id: predictionId });
  } else {
    await supabase
      .from("coupon_predictions")
      .delete()
      .eq("coupon_id", coupon.id)
      .eq("prediction_id", predictionId);
  }

  revalidatePath("/admin/coupons");
  revalidatePath("/coupon-du-jour");
}
