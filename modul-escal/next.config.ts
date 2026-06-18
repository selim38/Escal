import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Accès au serveur de dev depuis le réseau local (HMR / hot reload)
  allowedDevOrigins: ["192.168.15.122"],

  // Export statique — déployé en FTP sous escal.point-soft.fr/calcul
  output: "export",

  // Servi depuis le sous-dossier /calcul
  basePath: "/calcul",

  // Pas d'optimiseur d'images sur un hébergement statique (Ionos mutualisé)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
