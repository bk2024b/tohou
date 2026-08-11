"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { signIn, signUp, type AuthActionState } from "@/app/auth/actions";

const initialState: AuthActionState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-brand text-white font-semibold py-2.5 rounded-full hover:bg-brand-dark transition-colors disabled:opacity-60"
    >
      {pending ? "Chargement..." : label}
    </button>
  );
}

export function AuthForm({ initialMode }: { initialMode: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loginState, loginAction] = useFormState(signIn, initialState);
  const [signupState, signupAction] = useFormState(signUp, initialState);

  const isLogin = mode === "login";
  const state = isLogin ? loginState : signupState;

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div className="flex rounded-full bg-neutral-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 py-2 rounded-full transition-colors ${
            isLogin ? "bg-white shadow text-brand" : "text-neutral-500"
          }`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 rounded-full transition-colors ${
            !isLogin ? "bg-white shadow text-brand" : "text-neutral-500"
          }`}
        >
          Inscription
        </button>
      </div>

      <form action={isLogin ? loginAction : signupAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {state.error && (
          <p className="text-sm text-loss bg-loss/10 border border-loss/30 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <SubmitButton label={isLogin ? "Se connecter" : "Créer mon compte"} />
      </form>
    </div>
  );
}
