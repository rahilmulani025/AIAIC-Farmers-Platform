import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Archive, ClipboardList, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DashboardSummary } from "@/components/farm/DashboardSummary";
import { PlantCheck } from "@/components/farm/PlantCheck";
import { RecommendationCard } from "@/components/farm/RecommendationCard";
import { FailureBlock, LoadingBlock, StateBlock } from "@/components/farm/StateBlock";
import { farmSearchSchema, intelligenceQueryOptions, parseServices } from "@/lib/aiaic-query";
import { catalogOptions, catalogQueryOptions, subjectSupport } from "@/lib/catalog-query";
import type { ServiceResult } from "@/lib/aiaic-types";
import { loadCachedAdvice, saveCachedAdvice, saveFarm, savePlantResult } from "@/lib/farm-storage";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/result")({
  validateSearch: farmSearchSchema,
  head: () => ({
    meta: [
      { title: "Today's Advice — AIAIC Kisan" },
      {
        name: "description",
        content:
          "Today's mandi price, water, weather, crop and storage guidance for your district, with how sure the system is and where the data came from.",
      },
      { property: "og:title", content: "Today's Advice — AIAIC Kisan" },
      {
        property: "og:description",
        content: "Real agricultural intelligence in simple words, with confidence and sources.",
      },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { t, lang } = useI18n();
  const search = Route.useSearch();
  const services = parseServices(search.services);
  const query = useQuery(intelligenceQueryOptions(search));

  const catalogQuery = useQuery(catalogQueryOptions());
  const options = catalogOptions(catalogQuery.data);
  const support = subjectSupport(options, {
    region: search.mandi ?? search.region,
    crop: search.crop,
  });

  const cacheKey = useMemo(
    () => `${services.join(",")}|${search.region ?? ""}|${search.crop ?? ""}|${search.mandi ?? ""}`,
    [services, search.region, search.crop, search.mandi],
  );
  const [cached, setCached] = useState<{ savedAt: string; results: ServiceResult[] } | null>(null);

  // Remember the farm so a returning farmer does not refill the form.
  useEffect(() => {
    saveFarm({
      ...(search.region ? { region: search.region } : {}),
      ...(search.crop ? { crop: search.crop } : {}),
      ...(search.mandi ? { mandi: search.mandi } : {}),
      ...(search.land ? { land: search.land } : {}),
      services: services.join(","),
    });
  }, [search.region, search.crop, search.mandi, search.land, services]);

  // Keep the last good answer on the device, and read it back when the
  // service cannot be reached.
  useEffect(() => {
    setCached(loadCachedAdvice(cacheKey));
  }, [cacheKey]);

  useEffect(() => {
    if (query.data?.results) saveCachedAdvice(cacheKey, query.data.results);
  }, [query.data, cacheKey]);

  const subject = [search.crop, search.mandi ?? search.region].filter(Boolean).join(" • ");
  const linkSearch = {
    ...(search.region ? { region: search.region } : {}),
    ...(search.crop ? { crop: search.crop } : {}),
    ...(search.mandi ? { mandi: search.mandi } : {}),
    ...(search.land ? { land: search.land } : {}),
    services: services.join(","),
  };

  const retryButton = (
    <button
      type="button"
      onClick={() => void query.refetch()}
      className="flex min-h-14 items-center justify-center rounded-2xl bg-primary px-6 text-lg font-bold text-primary-foreground"
    >
      {t("result.retry")}
    </button>
  );

  const everyServiceFailed =
    query.data?.results.length !== undefined &&
    query.data.results.length > 0 &&
    query.data.results.every((r) => !r.ok);
  const showCached = Boolean(cached) && (query.isError || everyServiceFailed);
  const results: ServiceResult[] = showCached
    ? (cached?.results ?? [])
    : (query.data?.results ?? []);

  const savedWhen = cached
    ? new Intl.DateTimeFormat(lang === "en" ? "en-IN" : lang === "hi" ? "hi-IN" : "mr-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(cached.savedAt))
    : "";

  const updatedAt = showCached
    ? (cached?.savedAt ?? new Date().toISOString())
    : (results
        .map((r) => r.fetchedAt)
        .sort()
        .at(-1) ?? new Date().toISOString());

  const hasAnyResult = results.length > 0;

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
      <header>
        <h1 className="text-3xl font-extrabold text-foreground">{t("result.title")}</h1>
        {subject ? (
          <p className="mt-2 text-lg text-foreground/75">
            {t("result.for")}: <span className="font-bold">{subject}</span>
            {search.land ? ` • ${search.land}` : ""}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/ask"
            search={linkSearch}
            className="inline-flex min-h-12 items-center rounded-xl bg-secondary px-4 text-base font-bold text-secondary-foreground"
          >
            <ArrowLeft aria-hidden className="mr-2 size-5" />
            {t("result.back")}
          </Link>
          <Link
            to="/review"
            search={linkSearch}
            className="inline-flex min-h-12 items-center rounded-xl border-2 border-border px-4 text-base font-bold text-foreground/80"
          >
            <ClipboardList aria-hidden className="mr-2 size-5" />
            {t("home.review")}
          </Link>
        </div>
      </header>

      {!query.isPending && hasAnyResult ? (
        <div className="mt-6">
          <DashboardSummary
            results={results}
            subject={subject}
            land={search.land}
            updatedAt={updatedAt}
            search={linkSearch}
          />
        </div>
      ) : null}

      <div className="mt-6">
        <PlantCheck crop={search.crop} onResult={(result) => savePlantResult(result)} />
      </div>

      <div className="mt-6">
        {query.isPending ? (
          <LoadingBlock label={t("result.loading")} />
        ) : (
          <div className="space-y-5">
            {showCached ? (
              <StateBlock
                tone="warning"
                icon={Archive}
                title={t("cache.title")}
                body={t("cache.body", { when: savedWhen })}
                action={retryButton}
              />
            ) : null}

            {query.isError && !showCached ? (
              <FailureBlock reason="request_failed" action={retryButton} />
            ) : null}

            {!showCached && !query.isError && results.length === 0 ? (
              <StateBlock
                icon={SearchX}
                title={t("result.empty.title")}
                body={
                  support.anyUnknown ? t("state.unknown.subject") : t("result.empty.body")
                }
                action={retryButton}
              />
            ) : null}

            {results.map((result) => {
              if (!result.ok) {
                return (
                  <section key={result.service} aria-label={t(`service.${result.service}`)}>
                    <h2 className="mb-2 text-lg font-bold uppercase tracking-wide text-muted-foreground">
                      {t(`service.${result.service}`)}
                    </h2>
                    <FailureBlock reason={result.reason} action={retryButton} />
                  </section>
                );
              }
              if (result.items.length === 0) {
                const serviceSupport = subjectSupport(
                  options,
                  {
                    region:
                      result.service === "market" && search.mandi
                        ? search.mandi
                        : search.region,
                    crop: search.crop,
                  },
                  result.service,
                );
                return (
                  <section key={result.service} aria-label={t(`service.${result.service}`)}>
                    <h2 className="mb-2 text-lg font-bold uppercase tracking-wide text-muted-foreground">
                      {t(`service.${result.service}`)}
                    </h2>
                    <StateBlock
                      icon={SearchX}
                      title={t("result.empty.title")}
                      body={
                        serviceSupport.anyUnknown
                          ? t("state.unknown.subject")
                          : t("result.empty.body")
                      }
                    />
                  </section>
                );
              }
              return result.items.map((item, index) => (
                <RecommendationCard
                  key={`${result.service}-${index}`}
                  service={result.service}
                  item={item}
                  index={index}
                  search={linkSearch}
                />
              ));
            })}
          </div>
        )}
      </div>
    </div>
  );
}
