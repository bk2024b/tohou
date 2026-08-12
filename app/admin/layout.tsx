import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/bookmakers", label: "Bookmakers" },
  { href: "/admin/predictions", label: "Pronostics" },
  { href: "/admin/coupons", label: "Coupon du jour" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="grid md:grid-cols-[200px_1fr] gap-8">
      <aside className="space-y-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <div>{children}</div>
    </div>
  );
}
