import { StrictMode } from "react";
import type { ReactElement } from "react";

import { DevisConfigurator } from "@/components/devis-configurator";
import type { KreConfig } from "@/lib/config";

/**
 * Arbre React monté dans le shadow root.
 *
 * Isolé du custom element pour que `element.ts` reste du DOM pur (facile à lire
 * et à tester) et que ce module concentre les providers.
 */
export function renderConfigurator(config: KreConfig): ReactElement {
  return (
    <StrictMode>
      <DevisConfigurator config={config} />
    </StrictMode>
  );
}
