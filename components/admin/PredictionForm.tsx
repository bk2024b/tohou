"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import type { Prediction, Match } from "@/types";
import type { FormActionState } from "@/app/admin/actions";

const initialState: FormActionState = { error: null };

const MARKET_HINTS: Record<string, string> = {
  "1x2": "Sélection attendue : home | draw | away",
  double_chance: "Sélection attendue : 1x | x2 | 12",
  btts: "Sélection attendue : yes | no",
  over_under:
    "Sélection attendue : over_2.5 | under_2.5 (le nombre est le seuil de buts)",
};

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

export function PredictionForm({
  prediction,
  matches,
  action,
}: {
  prediction?: Prediction & { analysis_text?: string };
  matches: Match[];
  action: (
    prevState: FormActionState,
    formData: FormData
  ) => Promise<FormActionState>;
}) {
  const [state, formAction] = useFormState(action, initialState);
  const [market, setMarket] = useState(prediction?.market ?? "");

  return (
    <form action={formAction} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1">Match</label>
        <select
          name="match_id"
          defaultValue={prediction?.match_id ?? ""}
          required
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        >
          <option value="">— Sélectionner un match —</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>
              {m.home_team} vs {m.away_team} —{" "}
              {new Date(m.match_date).toLocaleString("fr-FR")}
            </option>
          ))}
        </select>
        {matches.length === 0 && (
          <p className="text-xs text-neutral-500 mt-1">
            Aucun match à venir en base. Lancez l&apos;ingestion des matchs
            avant de créer un pronostic.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Titre</label>
        <input
          name="title"
          defaultValue={prediction?.title}
          required
          placeholder="ex: PSG solide favori face à Nice"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Slug (généré automatiquement si laissé vide)
        </label>
        <input
          name="slug"
          defaultValue={prediction?.slug}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Accroche (visible même pour un non-VIP)
        </label>
        <textarea
          name="analysis_preview"
          defaultValue={prediction?.analysis_preview ?? ""}
          rows={2}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Analyse complète</label>
        <textarea
          name="analysis_text"
          defaultValue={prediction?.analysis_text ?? ""}
          required
          rows={6}
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Pronostic affiché</label>
        <input
          name="predicted_outcome"
          defaultValue={prediction?.predicted_outcome}
          required
          placeholder="ex: Victoire PSG"
          className="w-full border border-neutral-300 rounded-lg px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Marché (règlement automatique)
          </label>
          <select
            name="market"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          >
            <option value="">Aucun (réglage manuel)</option>
            <option value="1x2">1X2</option>
            <option value="double_chance">Double chance</option>
            <option value="btts">Les deux équipes marquent</option>
            <option value="over_under">Total buts (over/under)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sélection</label>
          <input
            name="selection"
            defaultValue={prediction?.selection ?? ""}
            placeholder={market ? MARKET_HINTS[market] : "—"}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>
      </div>
      {market && (
        <p className="text-xs text-neutral-500 -mt-2">{MARKET_HINTS[market]}</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cote</label>
          <input
            type="number"
            step="0.01"
            name="predicted_odds"
            defaultValue={prediction?.predicted_odds ?? ""}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confiance (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            name="confidence_level"
            defaultValue={prediction?.confidence_level ?? ""}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            id="is_vip"
            name="is_vip"
            defaultChecked={prediction?.is_vip ?? false}
          />
          <label htmlFor="is_vip" className="text-sm">
            VIP
          </label>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <SubmitButton
        label={prediction ? "Enregistrer les modifications" : "Créer le pronostic"}
      />
    </form>
  );
}
