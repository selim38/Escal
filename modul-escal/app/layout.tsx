import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * `next/font` a été retiré : c'est une fonctionnalité build-time de Next, absente
 * du build Vite, et un `@font-face` déclaré dans un shadow root est ignoré par les
 * navigateurs. La police Archivo est auto-hébergée dans `public/fonts/`
 * et déclarée par `wc/fonts.ts` (Web Component) ou par `app/globals.css` (Next),
 * avec une pile système en repli — voir `--kre-font-sans` dans `lib/theme.css`.
 */

export const metadata: Metadata = {
  title: "Kit Rénovation Escalier — Configurateur de devis",
  description:
    "Estimez le coût matériaux de votre rénovation d’escalier et envoyez une demande de devis.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <head>
        <link
          rel="preload"
          href="/calcul/fonts/archivo-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
