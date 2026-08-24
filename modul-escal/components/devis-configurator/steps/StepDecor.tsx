"use client";

import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { useAsset } from "@/lib/asset";
import { DECOR_CATALOG } from "@/lib/decor-catalog";
import { useT } from "@/lib/i18n/useT";
import { useFieldError } from "@/lib/useFieldError";
import type { Decor, QuoteFormDraft } from "@/lib/quote-schema";

import { SampleCta } from "../ui/SampleCta";

export function StepDecor() {
  const { watch, setValue } = useFormContext<QuoteFormDraft>();
  const value = watch("decor");
  const error = useFieldError("decor");
  const asset = useAsset();
  const { m } = useT();

  const select = (d: Decor) => {
    setValue("decor", d, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-center text-xl font-bold tracking-tight text-heading sm:text-2xl">
        {m.steps.decor.title}
      </h2>

      <fieldset className="flex flex-wrap justify-center gap-3 sm:gap-5">
        <legend className="sr-only">{m.steps.decor.title}</legend>
        {DECOR_CATALOG.map((item) => {
          const selected = value === item.id;
          const label = m.catalog.decor[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => select(item.id)}
              aria-pressed={selected}
              className={`group relative w-[calc(50%-6px)] min-w-0 overflow-hidden rounded-lg bg-surface text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-[calc(33.333%-14px)] md:w-[calc(16.667%-17px)] ${
                selected
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-[var(--color-surface)]"
                  : "ring-1 ring-border hover:shadow-md hover:ring-brand-medium/40"
              } `}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-muted-bg">
                {item.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset(item.imageSrc)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full scale-100 object-cover sm:scale-[1.25]"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: item.swatch }}
                  />
                )}
                {selected ? (
                  <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <Check className="size-4 stroke-[3]" aria-hidden />
                  </span>
                ) : null}
              </div>
              <div className="flex h-10 items-center justify-center border-t border-border px-2 text-center">
                <span className="line-clamp-2 text-xs font-medium leading-tight text-muted">
                  {label}
                </span>
              </div>
            </button>
          );
        })}
      </fieldset>

      <SampleCta decorLabel={value ? m.catalog.decor[value] : undefined} />

      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
