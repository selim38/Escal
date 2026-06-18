import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export statique — déployé en FTP sous escal.point-soft.fr/admin
  output: "export",

  // Servi depuis le sous-dossier /admin
  basePath: "/admin",

  // Pas d'optimiseur d'images sur hébergement statique (mutualisé IONOS)
  images: {
    unoptimized: true,
  },

  // Accès au serveur de dev depuis le réseau local (HMR / hot reload)
  allowedDevOrigins: ["192.168.15.122"],
};

export default nextConfig;
