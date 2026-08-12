"use client";

import { useTransition } from "react";

export function DeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Confirmer la suppression ? Cette action est définitive.")) {
          startTransition(() => {
            onDelete();
          });
        }
      }}
      className="text-loss text-sm font-medium hover:underline disabled:opacity-50"
    >
      {pending ? "Suppression..." : "Supprimer"}
    </button>
  );
}
