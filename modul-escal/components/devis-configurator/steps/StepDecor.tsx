"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { DECOR_CATALOG } from "@/lib/decor-catalog";
import type { Decor, QuoteFormDraft } from "@/lib/quote-schema";

export function StepDecor() {
  const { watch, setValue, formState } = useFormContext<QuoteFormDraft>();
  const value = watch("decor");
  const error = formState.errors.decor?.message;

  const select = (d: Decor) => {
    setValue("decor", d, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-center text-xl font-bold tracking-tight text-[#1e2a4a] sm:text-2xl">
        Choisir le décor
      </h2>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
        {DECOR_CATALOG.map((item) => {
          const selected = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => select(item.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  select(item.id);
                }
              }}
              className={`group relative w-[calc(50%-0.5rem)] max-w-[11.5rem] shrink-0 overflow-hidden rounded-lg bg-white text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-[min(11.5rem,calc(16.666%-1.1rem))] ${
                selected
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-[var(--color-surface)]"
                  : "ring-1 ring-[#e8e4e0] hover:ring-[#c9bfb4] hover:shadow-md"
              } `}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#f3f0ec]">
                {item.imageSrc ? (
                  <Image
                    src={item.imageSrc}
                    alt=""
                    fill
                    className="object-cover scale-[1.25]"
                    sizes="(max-width: 640px) 50vw, 180px"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: item.swatch }}
                  />
                )}
                {selected ? (
                  <span className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                    <Check className="size-4 stroke-[3]" aria-hidden />
                  </span>
                ) : null}
              </div>
              <div className="flex h-10 items-center justify-center border-t border-[#ece8e4] px-2 text-center">
                <span className="text-xs font-medium leading-tight text-[#6b6560]">
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
