import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kit Rénovation Escalier · Dashboard Admin",
  description: "Interface d'administration — Kit Rénovation Escalier",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
