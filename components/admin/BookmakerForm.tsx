"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { Bookmaker } from "@/types";
import type { FormActionState } from "@/app/admin/actions";

const initialState: FormActionState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-brand text-white font-semibold px-6 py-2.5 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-60"
    >
      {pending ? "Enregistrement..." : label}
    </button>
  );
}

export function BookmakerForm({
  bookmaker,
  action,
}: {
  bookmaker?: Bookmaker;
  action: (
    prevState: FormActionState,
    formData: FormData
  ) => Promise<FormActionState>;
}) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1">Nom</label>
        <input
          name="name"
          defaultValue={bookmaker?.name}
          required
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Slug (URL — généré automatiquement si laissé vide)
        </label>
        <input
          name="slug"
          defaultValue={bookmaker?.slug}
          placeholder="ex: winbet"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Logo (URL de l'image)</label>
        <input
          name="logo_url"
          defaultValue={bookmaker?.logo_url ?? ""}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Texte du bonus</label>
        <input
          name="bonus_text"
          defaultValue={bookmaker?.bonus_text ?? ""}
          placeholder="ex: 100% jusqu'à 50 000 FCFA sur le 1er dépôt"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={bookmaker?.description ?? ""}
          rows={5}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Note (0 à 5)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            name="rating"
            defaultValue={bookmaker?.rating ?? ""}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            defaultChecked={bookmaker?.is_published ?? true}
          />
          <label htmlFor="is_published" className="text-sm">
            Publié (visible sur le site)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Lien d&apos;affiliation</label>
        <input
          name="affiliate_link"
          defaultValue={bookmaker?.affiliate_link ?? ""}
          placeholder="https://..."
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Mention légale</label>
        <input
          name="legal_disclaimer"
          defaultValue={bookmaker?.legal_disclaimer ?? ""}
          placeholder="ex: 18+. Jouer comporte des risques..."
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      {state.error && (
        <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <SubmitButton label={bookmaker ? "Enregistrer les modifications" : "Créer le bookmaker"} />
    </form>
  );
}
