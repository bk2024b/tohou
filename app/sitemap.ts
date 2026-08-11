import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pronoscore.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  const { data: predictions } = await supabase
    .from("predictions")
    .select("slug, published_at")
    .order("published_at", { ascending: false })
    .limit(1000);

  const { data: bookmakers } = await supabase
    .from("bookmakers")
    .select("slug");

  const predictionUrls: MetadataRoute.Sitemap = (predictions ?? []).map(
    (p) => ({
      url: `${SITE_URL}/pronostics/${p.published_at.slice(0, 10)}/${p.slug}`,
      lastModified: p.published_at,
      changeFrequency: "daily",
    })
  );

  const bookmakerUrls: MetadataRoute.Sitemap = (bookmakers ?? []).map(
    (b) => ({
      url: `${SITE_URL}/bookmakers/${b.slug}`,
      changeFrequency: "weekly",
    })
  );

  return [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/coupon-du-jour`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/evenements`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/resultats`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/bookmakers`, changeFrequency: "weekly", priority: 0.6 },
    ...predictionUrls,
    ...bookmakerUrls,
  ];
}
