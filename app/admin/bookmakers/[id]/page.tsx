import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookmakerForm } from "@/components/admin/BookmakerForm";
import { upsertBookmaker } from "@/app/admin/actions";
import type { Bookmaker } from "@/types";

export default async function EditBookmakerPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("bookmakers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!data) notFound();

  const bookmaker = data as unknown as Bookmaker;
  const action = upsertBookmaker.bind(null, bookmaker.id);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Modifier {bookmaker.name}</h1>
      <BookmakerForm bookmaker={bookmaker} action={action} />
    </div>
  );
}
