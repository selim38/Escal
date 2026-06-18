import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Accès au serveur de dev depuis le réseau local (HMR / hot reload)
  allowedDevOrigins: ["192.168.15.122"],

  // Export statique — décommenter pour le build démo FTP
  output: "export",

  // Pas d'optimiseur d'images sur un hébergement statique (Ionos mutualisé)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
