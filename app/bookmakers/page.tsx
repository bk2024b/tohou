import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Bookmaker } from "@/types";

export const metadata: Metadata = {
  title: "Comparatif des meilleurs bookmakers",
  description:
    "Comparez les bonus, avis et notes des meilleurs sites de paris sportifs.",
};

export const revalidate = 3600;

export default async function BookmakersPage() {
  const supabase = createClient();
  const { data: bookmakers } = await supabase
    .from("bookmakers")
    .select("*")
    .order("rating", { ascending: false });

  const list = (bookmakers ?? []) as unknown as Bookmaker[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Comparatif des bookmakers</h1>
      <div className="grid gap-4">
        {list.map((b) => (
          <div
            key={b.id}
            className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4"
          >
            {b.logo_url && (
              <Image
                src={b.logo_url}
                alt={b.name}
                width={100}
                height={50}
                className="object-contain"
              />
            )}
            <div className="flex-1 text-center sm:text-left">
              <Link href={`/bookmakers/${b.slug}`} className="font-bold text-lg">
                {b.name}
              </Link>
              {b.bonus_text && (
                <p className="text-sm text-neutral-600">{b.bonus_text}</p>
              )}
              {b.rating && (
                <p className="text-yellow-500 font-semibold text-sm mt-1">
                  {"★".repeat(Math.round(b.rating))} {b.rating}/5
                </p>
              )}
            </div>
            {b.affiliate_link && (
              <a
                href={b.affiliate_link}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="bg-brand text-white font-semibold px-5 py-2.5 rounded-full hover:bg-brand-dark transition-colors whitespace-nowrap"
              >
                S&apos;inscrire
              </a>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-neutral-400">
        18+. Jouer comporte des risques : endettement, isolement, dépendance.
        Les liens vers les bookmakers sont des liens d&apos;affiliation.
      </p>
    </div>
  );
}
