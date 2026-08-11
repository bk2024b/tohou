import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PronoScore — Pronostics football, cotes et résultats du jour",
    template: "%s | PronoScore",
  },
  description:
    "Pronostics football quotidiens, comparatif des meilleurs bookmakers, coupon du jour et résultats en temps réel.",
};

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/evenements", label: "Événements" },
  { href: "/pronostics", label: "Pronostics" },
  { href: "/coupon-du-jour", label: "Coupon du jour" },
  { href: "/resultats", label: "Résultats" },
  { href: "/bookmakers", label: "Bookmakers" },
  { href: "/vip", label: "VIP" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <header className="bg-brand text-white sticky top-0 z-50 shadow-md">
          <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Prono<span className="text-yellow-400">Score</span>
            </Link>
            <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-yellow-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/vip"
              className="bg-yellow-400 text-brand-dark font-semibold text-sm px-4 py-1.5 rounded-full hover:bg-yellow-300 transition-colors"
            >
              Devenir VIP
            </Link>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 min-h-[70vh]">
          {children}
        </main>

        <footer className="bg-neutral-900 text-neutral-400 text-sm mt-12">
          <div className="max-w-6xl mx-auto px-4 py-8 space-y-2">
            <p>
              PronoScore est un site d&apos;information et de pronostics. Les
              jeux d&apos;argent et de hasard sont interdits aux mineurs et
              comportent des risques : endettement, isolement, dépendance.
              Jouez avec modération.
            </p>
            <p>© {new Date().getFullYear()} PronoScore. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
