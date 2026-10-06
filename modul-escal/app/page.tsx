import { DevisConfigurator } from "@/components/devis-configurator";

/**
 * Page de démonstration / recette interne du configurateur (`/calcul`).
 *
 * L'en-tête et le conteneur de largeur vivent désormais **dans** le composant :
 * il doit être autonome pour être livré comme Web Component. Cette page ne fait
 * plus que le monter.
 */
export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      {/* Largeur calée sur le conteneur de la page « Devis gratuit » de la
          maquette Knewledge (1240 px, marges de 32 px). */}
      <main className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col overflow-x-clip px-4 py-10 sm:px-8">
        <DevisConfigurator />
      </main>
    </div>
  );
}
