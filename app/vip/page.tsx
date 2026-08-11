import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Abonnement VIP",
  description:
    "Débloquez nos analyses complètes, pronostics à forte cote et accès anticipé.",
};

const ADVANTAGES = [
  "Analyses complètes sur tous les pronostics (pas seulement l'accroche)",
  "Pronostics exclusifs à cote élevée",
  "Accès anticipé avant publication publique",
  "Groupe privé (Telegram/WhatsApp)",
];

export default function VipPage() {
  return (
    <div className="max-w-xl mx-auto text-center space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Passez VIP</h1>
        <p className="text-neutral-600 mt-2">
          Accédez à l&apos;intégralité de nos analyses et pronostics
          exclusifs.
        </p>
      </div>

      <ul className="text-left bg-white border border-neutral-200 rounded-xl p-6 space-y-3">
        {ADVANTAGES.map((a) => (
          <li key={a} className="flex items-start gap-2">
            <span className="text-win font-bold">✓</span>
            <span>{a}</span>
          </li>
        ))}
      </ul>

      {/*
        TODO V1.1 : brancher sur Stripe Checkout (ou CinetPay/Fedapay
        pour Mobile Money) via une Server Action qui crée la session
        de paiement puis redirige l'utilisateur.
      */}
      <button
        disabled
        className="bg-yellow-400 text-brand-dark font-semibold px-8 py-3 rounded-full opacity-60 cursor-not-allowed"
        title="Paiement à venir"
      >
        S&apos;abonner — bientôt disponible
      </button>
    </div>
  );
}
