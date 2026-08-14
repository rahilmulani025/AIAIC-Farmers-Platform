import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Info, Leaf, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

import { StateBlock } from "@/components/farm/StateBlock";
import { analyzePlantPhoto, type PlantResult } from "@/lib/plant.functions";
import { useI18n } from "@/lib/i18n";

/**
 * Photo check powered by the Plant Intelligence subsystem.
 *
 * Honesty rules are the same as the rest of the app: we show only what that
 * subsystem observed, we never turn an observation into a treatment
 * instruction, and when the subsystem is not connected or not answering we say
 * so instead of showing anything.
 */
export function PlantCheck({
  crop,
  onResult,
}: {
  crop?: string | undefined;
  onResult?: (result: PlantResult | null) => void;
}) {
  const { t } = useI18n();
  const analyze = useServerFn(analyzePlantPhoto);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const image = await readAsDataUrl(file);
      setPreview(image);
      return analyze({ data: { image, filename: file.name, ...(crop ? { crop } : {}) } });
    },
    onSuccess: (result) => onResult?.(result),
    onError: () => onResult?.(null),
  });

  const result = mutation.data;

  return (
    <section
      aria-labelledby="plant-heading"
      className="rounded-3xl border-2 border-border bg-card p-5"
    >
      <h2 id="plant-heading" className="flex items-center gap-2 text-xl font-bold text-foreground">
        <Leaf aria-hidden className="size-6 text-primary" />
        {t("plant.title")}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-foreground/75">{t("plant.lead")}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) mutation.mutate(file);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={mutation.isPending}
        className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-lg font-bold text-primary-foreground disabled:opacity-60"
      >
        {mutation.isPending ? (
          <Loader2 aria-hidden className="size-6 animate-spin" />
        ) : (
          <Camera aria-hidden className="size-6" />
        )}
        {mutation.isPending ? t("plant.working") : t("plant.take")}
      </button>

      {preview ? (
        <img
          src={preview}
          alt={t("plant.photo.alt")}
          className="mt-4 max-h-56 w-full rounded-2xl object-cover"
        />
      ) : null}

      <div className="mt-4">
        {mutation.isError ? (
          <StateBlock
            tone="danger"
            icon={Info}
            title={t("state.failed.title")}
            body={t("state.failed.body")}
          />
        ) : null}

        {result && !result.configured ? (
          <StateBlock
            tone="warning"
            icon={Info}
            title={t("plant.notconnected.title")}
            body={t("plant.notconnected.body")}
          />
        ) : null}

        {result && result.configured && !result.ok ? (
          <StateBlock
            tone="warning"
            icon={Info}
            title={t("state.offline.title")}
            body={t("plant.failed.body")}
          />
        ) : null}

        {result?.ok ? (
          <div className="rounded-2xl border-2 border-border bg-background p-4">
            {result.species || result.stage ? (
              <p className="text-lg font-bold text-foreground">
                {[result.species, result.stage].filter(Boolean).join(" • ")}
              </p>
            ) : null}
            {result.observations.length ? (
              <dl className="mt-2 space-y-2">
                {result.observations.map((observation) => (
                  <div key={observation.label} className="flex flex-wrap gap-x-2 text-base">
                    <dt className="font-bold text-foreground">{observation.label}:</dt>
                    <dd className="text-foreground/80">{observation.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-2 text-base text-foreground/75">{t("plant.noobservations")}</p>
            )}
            <p className="mt-3 rounded-xl bg-warning-soft p-3 text-base font-semibold text-warning-foreground">
              {t("plant.disclaimer")}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}
