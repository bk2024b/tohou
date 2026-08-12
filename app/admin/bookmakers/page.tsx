import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteBookmaker } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Bookmaker } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminBookmakersPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("bookmakers")
    .select("*")
    .order("name", { ascending: true });

  const bookmakers = (data ?? []) as unknown as Bookmaker[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Bookmakers</h1>
        <Link
          href="/admin/bookmakers/new"
          className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-brand-dark transition-colors"
        >
          + Ajouter
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-200">
        {bookmakers.map((b) => (
          <div key={b.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-medium">
                {b.name}
                {!b.is_published && (
                  <span className="ml-2 text-xs text-neutral-400 font-normal">
                    (non publié)
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500">/{b.slug}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href={`/admin/bookmakers/${b.id}`}
                className="text-sm text-brand font-medium hover:underline"
              >
                Modifier
              </Link>
              <DeleteButton onDelete={deleteBookmaker.bind(null, b.id)} />
            </div>
          </div>
        ))}
        {bookmakers.length === 0 && (
          <p className="px-4 py-6 text-sm text-neutral-500">
            Aucun bookmaker pour le moment.
          </p>
        )}
      </div>
    </div>
  );
}
