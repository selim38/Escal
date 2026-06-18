import { DevisConfigurator } from "@/components/devis-configurator";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <header className="border-b border-border bg-surface/90 py-6 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Kit Rénovation Escalier
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-3xl">
            Configurateur de devis
          </h1>
          <p className="text-sm text-muted sm:text-base">
            Estimation matériaux pour la rénovation de votre escalier. Aucun
            paiement en ligne — votre demande est transmise à un commercial.
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
        <DevisConfigurator />
      </main>

    </div>
  );
}
