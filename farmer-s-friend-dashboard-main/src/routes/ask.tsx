import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { BigSelect } from "@/components/farm/BigSelect";
import { Check, WifiOff } from "lucide-react";

import { catalogOptions, catalogQueryOptions, displayName } from "@/lib/catalog-query";
import { SERVICE_ICON } from "@/lib/service-icons";
import { farmSearchSchema, parseServices } from "@/lib/aiaic-query";
import { SERVICES, type Service } from "@/lib/aiaic-types";
import { loadFarm, saveFarm } from "@/lib/farm-storage";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ask")({
  validateSearch: farmSearchSchema,
  head: () => ({
    meta: [
      { title: "Your Farm Details — AIAIC Kisan" },
      {
        name: "description",
        content:
          "Enter your district, crop and land size to get today's real agricultural intelligence in simple language.",
      },
      { property: "og:title", content: "Your Farm Details — AIAIC Kisan" },
      {
        property: "og:description",
        content: "District, crop and land size — three simple questions before your advice.",
      },
    ],
  }),
  component: AskPage,
});

function AskPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const search = Route.useSearch();

  const [region, setRegion] = useState(search.region ?? "");
  const [crop, setCrop] = useState(search.crop ?? "");
  const [mandi, setMandi] = useState(search.mandi ?? "");
  const [land, setLand] = useState(search.land ?? "");
  const [selected, setSelected] = useState<Service[]>(parseServices(search.services));

  // Valid districts, crops and APMC markets come from the engine's own catalog;
  // the built-in lists are only a fallback when the service is unreachable.
  const catalogQuery = useQuery(catalogQueryOptions());
  const options = catalogOptions(catalogQuery.data);

  // Prefill from the saved farm (browser-only, so after hydration) unless the
  // URL already carries a choice.
  useEffect(() => {
    const saved = loadFarm();
    if (!saved) return;
    if (!search.region && saved.region) setRegion(saved.region);
    if (!search.crop && saved.crop) setCrop(saved.crop);
    if (!search.mandi && saved.mandi) setMandi(saved.mandi);
    if (!search.land && saved.land) setLand(saved.land);
    if (!search.services && saved.services) setSelected(parseServices(saved.services));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (service: Service) => {
    setSelected((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
    );
  };

  const submit = () => {
    const services = selected.length ? selected : [...SERVICES];
    const wantsMarket = services.includes("market");
    const marketChoice = wantsMarket && mandi ? mandi : "";
    saveFarm({
      ...(region ? { region } : {}),
      ...(crop ? { crop } : {}),
      ...(marketChoice ? { mandi: marketChoice } : {}),
      ...(land ? { land } : {}),
      services: services.join(","),
    });
    navigate({
      to: "/result",
      search: {
        ...(region ? { region } : {}),
        ...(crop ? { crop } : {}),
        ...(marketChoice ? { mandi: marketChoice } : {}),
        ...(land ? { land } : {}),
        services: services.join(","),
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-32 pt-6">
      <h1 className="text-3xl font-extrabold text-foreground">{t("ask.title")}</h1>
      <p className="mt-2 text-lg text-foreground/75">{t("ask.subtitle")}</p>

      {!catalogQuery.isPending && !options.live ? (
        <p className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-warning bg-warning-soft px-4 py-3 text-base font-semibold text-warning-foreground">
          <WifiOff aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{t("ask.options.stale")}</span>
        </p>
      ) : null}

      <div className="mt-8 space-y-8">
        <BigSelect
          label={t("ask.district")}
          help={t("ask.district.help")}
          anyLabel={t("ask.district.any")}
          options={options.regions}
          display={displayName}
          value={region}
          onChange={setRegion}
        />

        <BigSelect
          label={t("ask.crop")}
          anyLabel={t("ask.crop.any")}
          options={options.crops}
          display={displayName}
          value={crop}
          onChange={setCrop}
        />

        {selected.includes("market") ? (
          <BigSelect
            label={t("ask.mandi")}
            help={t("ask.mandi.help")}
            anyLabel={t("ask.mandi.any")}
            options={options.mandis}
            display={displayName}
            value={mandi}
            onChange={setMandi}
          />
        ) : null}

        <div>
          <label htmlFor="land" className="block text-xl font-bold text-foreground">
            {t("ask.land")}
          </label>
          <p className="mt-1 text-base text-muted-foreground">{t("ask.land.help")}</p>
          <input
            id="land"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            value={land}
            onChange={(e) => setLand(e.target.value)}
            className="mt-2 min-h-16 w-full rounded-2xl border-2 border-input bg-card px-4 text-xl font-semibold text-foreground outline-none focus:border-ring"
          />
        </div>

        <fieldset>
          <legend className="text-xl font-bold text-foreground">{t("ask.services")}</legend>
          <p className="mt-1 text-base text-muted-foreground">{t("ask.services.help")}</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {options.services.map((service) => {
              const active = selected.includes(service);
              const Icon = SERVICE_ICON[service];
              return (
                <button
                  key={service}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(service)}
                  className={cn(
                    "flex min-h-16 items-center gap-3 rounded-2xl border-2 px-4 text-left text-lg font-bold transition-colors",
                    active
                      ? "border-primary bg-success-soft text-foreground"
                      : "border-border bg-card text-foreground/80",
                  )}
                >
                  <Icon aria-hidden className="size-7 shrink-0 text-primary" strokeWidth={2.25} />
                  <span className="flex-1">{t(`service.${service}`)}</span>
                  {active ? <Check aria-hidden className="size-7 shrink-0 text-primary" /> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t-2 border-border bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto w-full max-w-xl">
          <button
            type="button"
            onClick={submit}
            className="flex min-h-16 w-full items-center justify-center rounded-3xl bg-primary px-6 text-2xl font-extrabold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
          >
            {t("ask.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
