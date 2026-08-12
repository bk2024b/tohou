import { BookmakerForm } from "@/components/admin/BookmakerForm";
import { upsertBookmaker } from "@/app/admin/actions";

export default function NewBookmakerPage() {
  const action = upsertBookmaker.bind(null, null);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Nouveau bookmaker</h1>
      <BookmakerForm action={action} />
    </div>
  );
}
