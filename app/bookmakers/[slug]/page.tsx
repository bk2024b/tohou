import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Bookmaker } from "@/types";

export const revalidate = 3600;

async function getBookmaker(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("bookmakers")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as unknown as Bookmaker | null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const bookmaker = await getBookmaker(params.slug);
  if (!bookmaker) return {};
  return {
    title: `${bookmaker.name} : avis, bonus et code promo`,
    description: bookmaker.bonus_text ?? undefined,
  };
}

export default async function BookmakerDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const bookmaker = await getBookmaker(params.slug);
  if (!bookmaker) notFound();

  return (
    <article className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        {bookmaker.logo_url && (
          <Image
            src={bookmaker.logo_url}
            alt={bookmaker.name}
            width={120}
            height={60}
            className="object-contain"
          />
        )}
        <h1 className="text-2xl font-bold">{bookmaker.name}</h1>
      </div>

      {bookmaker.bonus_text && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 font-semibold text-yellow-800">
          {bookmaker.bonus_text}
        </div>
      )}

      {bookmaker.description && (
        <div className="prose max-w-none">
          <p>{bookmaker.description}</p>
        </div>
      )}

      {bookmaker.affiliate_link && (
        <a
          href={bookmaker.affiliate_link}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-block bg-brand text-white font-semibold px-6 py-3 rounded-full hover:bg-brand-dark transition-colors"
        >
          S&apos;inscrire sur {bookmaker.name}
        </a>
      )}

      {bookmaker.legal_disclaimer && (
        <p className="text-xs text-neutral-400">{bookmaker.legal_disclaimer}</p>
      )}
    </article>
  );
}
