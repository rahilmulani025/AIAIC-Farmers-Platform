import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";

import { ConfidenceMeter } from "@/components/farm/ConfidenceMeter";
import { EvidenceCard } from "@/components/farm/EvidenceCard";
import { FailureBlock, LoadingBlock, StateBlock } from "@/components/farm/StateBlock";
import { AlertTriangle, ArrowLeft, Clock, FileWarning, Phone, SearchX } from "lucide-react";

import { AdviceActions } from "@/components/farm/AdviceActions";
import { FeedbackBlock } from "@/components/farm/FeedbackBlock";
import { adviceText, summaryLine } from "@/lib/advice-text";
import { isTechnicalLine, recommendationLabel } from "@/lib/aiaic-labels";
import { SERVICE_ICON } from "@/lib/service-icons";
import { farmSearchSchema, intelligenceQueryOptions, parseServices } from "@/lib/aiaic-query";
import {
  confidenceLevel,
  daysOld,
  isAbstention,
  isService,
  observedAt,
  type IntelligenceItem,
  type Service,
} from "@/lib/aiaic-types";
import { useI18n } from "@/lib/i18n";

const detailSearchSchema = farmSearchSchema.extend({ i: z.number().int().min(0).optional() });

export const Route = createFileRoute("/advice/$service")({
  validateSearch: detailSearchSchema,
  params: {
    parse: (params) => {
      if (!isService(params.service)) throw notFound();
      return { service: params.service as Service };
    },
    stringify: (params) => ({ service: params.service }),
  },
  head: () => ({
    meta: [
      { title: "Advice Details — AIAIC Kisan" },
      {
        name: "description",
        content:
          "Full details of one AIAIC suggestion: what to do, why, the exact data sources, how sure the system is, what it does not know, and your next step.",
      },
      { property: "og:title", content: "Advice Details — AIAIC Kisan" },
      {
        property: "og:description",
        content: "Suggestion, reason, evidence, confidence and limitations — all in plain words.",
      },
    ],
  }),
  component: AdviceDetail,
});

function AdviceDetail() {
  const { t } = useI18n();
  const { service } = Route.useParams();
  const search = Route.useSearch();
  const query = useQuery(intelligenceQueryOptions(search));
  const services = parseServices(search.services);

  const ServiceIcon = SERVICE_ICON[service];
  const backSearch = {
    ...(search.region ? { region: search.region } : {}),
    ...(search.crop ? { crop: search.crop } : {}),
    ...(search.land ? { land: search.land } : {}),
    services: services.join(","),
  };

  const result = query.data?.results.find((r) => r.service === service);
  const item = result?.ok ? result.items[search.i ?? 0] : undefined;

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
      <Link
        to="/result"
        search={backSearch}
        className="inline-flex min-h-12 items-center rounded-xl bg-secondary px-4 text-base font-bold text-secondary-foreground"
      >
        <ArrowLeft aria-hidden className="mr-2 size-5" />
        {t("result.title")}
      </Link>

      <h1 className="mt-4 flex items-center gap-3 text-3xl font-extrabold text-foreground">
        <ServiceIcon aria-hidden className="size-9 text-primary" strokeWidth={2.25} />
        {t(`service.${service}`)}
      </h1>

      <div className="mt-6">
        {query.isPending ? (
          <LoadingBlock label={t("result.loading")} />
        ) : query.isError ? (
          <FailureBlock reason="request_failed" />
        ) : !result ? (
          <FailureBlock reason="not_found" />
        ) : !result.ok ? (
          <FailureBlock reason={result.reason} />
        ) : !item ? (
          <StateBlock
            icon={SearchX}
            title={t("result.empty.title")}
            body={t("result.empty.body")}
          />
        ) : (
          <ItemDetail item={item} service={service} farm={search} />
        )}
      </div>
    </div>
  );
}

function ItemDetail({
  item,
  service,
  farm,
}: {
  item: IntelligenceItem;
  service: Service;
  farm: { region?: string | undefined; crop?: string | undefined; mandi?: string | undefined };
}) {
  const { t, lang } = useI18n();
  const [showTechnical, setShowTechnical] = useState(false);

  const abstained = isAbstention(item);
  const level = confidenceLevel(item);
  const lines = item.explainability ?? [];
  const simple = lines.filter((line) => !isTechnicalLine(line));
  const technical = lines.filter((line) => isTechnicalLine(line));
  const sources = item.sources_used ?? [];
  const limits = item.known_unknowns ?? [];
  const observed = observedAt(item);
  const age = observed ? daysOld(observed) : null;
  const subject = [item.subject?.crop, item.subject?.region].filter(Boolean).join(" • ");
  const serviceLabel = t(`service.${service}`);
  const spoken = adviceText(item, serviceLabel, t, lang);
  const decisionId = item.decision_id ?? item.supporting_evidence?.decision_id;

  return (
    <div className="space-y-8">
      {/* 1. Recommendation */}
      <section aria-labelledby="rec-heading">
        <h2
          id="rec-heading"
          className="text-lg font-bold uppercase tracking-wide text-muted-foreground"
        >
          {abstained ? t("abstain.title") : t("detail.recommendation")}
        </h2>
        <div className="mt-2 rounded-3xl border-2 border-primary bg-card p-5">
          <p className="text-3xl font-extrabold leading-tight text-foreground">
            {abstained ? t("abstain.title") : recommendationLabel(item.recommendation, lang)}
          </p>
          <p className="mt-3 text-lg leading-relaxed text-foreground/80">
            {item.recommendation_detail ?? (abstained ? t("abstain.body") : "")}
          </p>
          {subject ? <p className="mt-3 text-base text-muted-foreground">{subject}</p> : null}
        </div>
        {item.calibrated === false ? (
          <p className="mt-3 flex items-start gap-3 rounded-2xl border-2 border-warning bg-warning-soft px-4 py-3 text-lg font-semibold text-warning-foreground">
            <AlertTriangle aria-hidden className="mt-1 size-6 shrink-0" />
            <span>{t("conf.uncalibrated")}</span>
          </p>
        ) : null}
      </section>

      {/* Plain-language one-liner + listen / share */}
      <section aria-labelledby="summary-heading">
        <h2
          id="summary-heading"
          className="text-lg font-bold uppercase tracking-wide text-muted-foreground"
        >
          {t("detail.summary")}
        </h2>
        <p className="mt-2 rounded-2xl border-2 border-border bg-card p-4 text-lg leading-relaxed text-foreground">
          {summaryLine(item, t)}
        </p>
        <div className="mt-3">
          <AdviceActions text={spoken} title={serviceLabel} />
        </div>
      </section>

      {/* 2. Why */}
      <section aria-labelledby="why-heading">
        <h2
          id="why-heading"
          className="text-lg font-bold uppercase tracking-wide text-muted-foreground"
        >
          {t("detail.why")}
        </h2>
        {simple.length ? (
          <ol className="mt-2 space-y-3">
            {simple.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl border-2 border-border bg-card p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-extrabold text-secondary-foreground">
                  {i + 1}
                </span>
                <p className="text-lg leading-relaxed text-foreground">{line}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-lg text-foreground/75">{t("limits.none")}</p>
        )}

        {technical.length ? (
          <>
            <button
              type="button"
              onClick={() => setShowTechnical((v) => !v)}
              aria-expanded={showTechnical}
              className="mt-3 inline-flex min-h-12 items-center rounded-xl bg-secondary px-4 text-base font-bold text-secondary-foreground"
            >
              {showTechnical ? t("detail.why.less") : t("detail.why.more")}
            </button>
            {showTechnical ? (
              <ul className="mt-3 space-y-2 rounded-2xl bg-muted p-4">
                {technical.map((line, i) => (
                  <li key={i} className="break-words text-base leading-relaxed text-foreground/80">
                    {line}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </section>

      {/* 3. Evidence */}
      <section aria-labelledby="evidence-heading">
        <h2
          id="evidence-heading"
          className="text-lg font-bold uppercase tracking-wide text-muted-foreground"
        >
          {t("detail.evidence")}
        </h2>
        {sources.length ? (
          <ul className="mt-2 space-y-3">
            {sources.map((source, i) => (
              <EvidenceCard key={source.source_id ?? i} source={source} />
            ))}
          </ul>
        ) : (
          <div className="mt-2">
            <StateBlock tone="warning" icon={FileWarning} title={t("evidence.none")} />
          </div>
        )}
        {age !== null && age > 2 ? (
          <div className="mt-3">
            <StateBlock
              tone="warning"
              icon={Clock}
              title={t("stale.title")}
              body={t("stale.body", { days: age })}
            />
          </div>
        ) : null}
      </section>

      {/* 4. Confidence + limits */}
      <section aria-labelledby="conf-heading">
        <h2
          id="conf-heading"
          className="text-lg font-bold uppercase tracking-wide text-muted-foreground"
        >
          {t("detail.confidence")}
        </h2>
        <div className="mt-2 rounded-3xl border-2 border-border bg-card p-5">
          <ConfidenceMeter level={level} showBody />
        </div>

        <h3 className="mt-5 text-lg font-bold uppercase tracking-wide text-muted-foreground">
          {t("detail.limits")}
        </h3>
        {limits.length ? (
          <ul className="mt-2 space-y-2">
            {limits.map((line, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-2xl border-2 border-warning bg-warning-soft p-4 text-lg leading-relaxed text-warning-foreground"
              >
                <AlertTriangle aria-hidden className="mt-1 size-5 shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-lg text-foreground/75">{t("limits.none")}</p>
        )}
      </section>

      {/* 5. Next action */}
      <section aria-labelledby="next-heading">
        <h2
          id="next-heading"
          className="text-lg font-bold uppercase tracking-wide text-muted-foreground"
        >
          {t("detail.next")}
        </h2>
        <div className="mt-2 rounded-3xl border-2 border-primary bg-success-soft p-5">
          <p className="text-lg leading-relaxed text-foreground">{t("detail.next.body")}</p>
          <a
            href="tel:18001801551"
            className="mt-4 flex min-h-16 w-full items-center justify-center rounded-2xl bg-primary px-4 text-xl font-extrabold text-primary-foreground"
          >
            <Phone aria-hidden className="mr-2 size-6" />
            {t("detail.next.call")}
          </a>
          {(item.decision_id ?? item.supporting_evidence?.decision_id) ? (
            <p className="mt-3 break-all text-base text-muted-foreground">
              {t("detail.decision")}: {item.decision_id ?? item.supporting_evidence?.decision_id}
            </p>
          ) : null}
        </div>
      </section>

      <FeedbackBlock
        service={service}
        decisionId={decisionId}
        region={farm.region}
        crop={farm.crop}
        mandi={farm.mandi}
        recommendation={item.recommendation}
      />
    </div>
  );
}
