/// <reference types="vite/client" />

/** Import CSS en chaîne (`?inline`) — utilisé pour la feuille du shadow root. */
declare module "*.css?inline" {
  const css: string;
  export default css;
}
