import { Link } from "@tanstack/react-router";
import { ClipboardList, LayoutDashboard, Phone } from "lucide-react";

import { AdviceActions } from "@/components/farm/AdviceActions";
import { ConfidenceMeter } from "@/components/farm/ConfidenceMeter";
import { adviceText } from "@/lib/advice-text";
import {
  confidenceLevel,
  type ServiceResult,
  type IntelligenceItem,
  type Service,
} from "@/lib/aiaic-types";
import { useI18n } from "@/lib/i18n";
import { SERVICE_ICON } from "@/lib/service-icons";

type FlatItem = { service: Service; item: IntelligenceItem; index: number };

function flattenResults(results: ServiceResult[]): FlatItem[] {
  const flat: FlatItem[] = [];
  for (const result of results) {
    if (!result.ok) continue;
    for (let i = 0; i < result.items.length; i++) {
      flat.push({ service: result.service, item: result.items[i]!, index: i });
    }
  }
  return flat;
}

export function DashboardSummary({
  results,
  subject,
  land,
  updatedAt,
  search,
}: {
  results: ServiceResult[];
  subject: string;
  land?: string | undefined;
  updatedAt: string;
  search: { region?: string; crop?: string; mandi?: string; land?: string; services?: string };
}) {
  const { t, lang } = useI18n();
  const items = flattenResults(results);

  const counts = {
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
    abstained: 0,
  };

  for (const { item } of items) {
    if (item.abstained || item.recommendation === "ABSTAIN") {
      counts.abstained += 1;
    } else {
      counts[confidenceLevel(item)] += 1;
    }
  }

  const hasAdvice = items.length > 0;
  const updatedTime = new Intl.DateTimeFormat(
    lang === "en" ? "en-IN" : lang === "hi" ? "hi-IN" : "mr-IN",
    { dateStyle: "medium", timeStyle: "short" },
  ).format(new Date(updatedAt));

  const combinedText = items
    .map(({ item, service }, i) => {
      const label = `${i + 1}. ${t(`service.${service}`)}`;
      return adviceText(item, label, t, lang);
    })
    .join("\n\n---\n\n");

  const summaryText = hasAdvice
    ? t("dashboard.summary", {
        total: items.length,
        high: counts.high,
        medium: counts.medium,
        low: counts.low,
      })
    : t("dashboard.empty");

  return (
    <section
      className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm"
      aria-label={t("dashboard.title")}
    >
      <div className="flex items-center gap-3">
        <LayoutDashboard aria-hidden className="size-7 text-primary" strokeWidth={2.25} />
        <h2 className="text-lg font-bold uppercase tracking-wide text-muted-foreground">
          {t("dashboard.title")}
        </h2>
      </div>

      <p className="mt-3 text-3xl font-extrabold leading-tight text-foreground">
        {t("result.title")}
      </p>
      {subject ? (
        <p className="mt-2 text-lg text-foreground/75">
          {t("result.for")}: <span className="font-bold">{subject}</span>
          {land ? ` • ${land}` : ""}
        </p>
      ) : null}

      <p className="mt-3 text-lg leading-relaxed text-foreground/80">{summaryText}</p>

      {hasAdvice ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {counts.high > 0 ? (
            <div className="rounded-2xl bg-success-soft px-3 py-3 text-center">
              <span className="block text-2xl font-extrabold text-success">{counts.high}</span>
              <span className="text-sm font-semibold text-foreground/80">{t("conf.high")}</span>
            </div>
          ) : null}
          {counts.medium > 0 ? (
            <div className="rounded-2xl bg-warning-soft px-3 py-3 text-center">
              <span className="block text-2xl font-extrabold text-warning-foreground">
                {counts.medium}
              </span>
              <span className="text-sm font-semibold text-foreground/80">{t("conf.medium")}</span>
            </div>
          ) : null}
          {counts.low > 0 ? (
            <div className="rounded-2xl bg-danger-soft px-3 py-3 text-center">
              <span className="block text-2xl font-extrabold text-danger">{counts.low}</span>
              <span className="text-sm font-semibold text-foreground/80">{t("conf.low")}</span>
            </div>
          ) : null}
          {counts.unknown > 0 ? (
            <div className="rounded-2xl bg-muted px-3 py-3 text-center">
              <span className="block text-2xl font-extrabold text-muted-foreground">
                {counts.unknown}
              </span>
              <span className="text-sm font-semibold text-foreground/80">{t("conf.unknown")}</span>
            </div>
          ) : null}
          {counts.abstained > 0 ? (
            <div className="rounded-2xl bg-muted px-3 py-3 text-center">
              <span className="block text-2xl font-extrabold text-muted-foreground">
                {counts.abstained}
              </span>
              <span className="text-sm font-semibold text-foreground/80">{t("abstain.title")}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-4 text-base text-muted-foreground">
        {t("dashboard.updated")}: {updatedTime}
      </p>

      {hasAdvice ? (
        <div className="mt-4">
          <AdviceActions text={combinedText} title={t("app.name")} />
        </div>
      ) : null}

      {hasAdvice ? (
        <div className="mt-5 space-y-2">
          <p className="text-base font-semibold text-foreground/80">{t("dashboard.jump")}</p>
          <div className="flex flex-wrap gap-2">
            {items.map(({ service, index }) => {
              const Icon = SERVICE_ICON[service];
              return (
                <Link
                  key={`${service}-${index}`}
                  to="/advice/$service"
                  params={{ service }}
                  search={{ ...search, i: index }}
                  className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-border bg-background px-3 text-base font-bold text-foreground/80 transition-colors hover:bg-accent"
                >
                  <Icon aria-hidden className="size-5 text-primary" />
                  {t(`service.${service}`)}
                </Link>
              );
            })}
            <Link
              to="/review"
              search={search}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-border bg-background px-3 text-base font-bold text-foreground/80 transition-colors hover:bg-accent"
            >
              <ClipboardList aria-hidden className="size-5 text-primary" />
              {t("home.review")}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl bg-warning-soft px-4 py-3">
        <p className="flex items-start gap-2 text-base font-semibold text-warning-foreground">
          <Phone aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{t("detail.next.call")}</span>
        </p>
      </div>
    </section>
  );
}
