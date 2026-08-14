import { Link } from "@tanstack/react-router";

import { ConfidenceMeter } from "@/components/farm/ConfidenceMeter";
import { AlertTriangle } from "lucide-react";

import { recommendationLabel } from "@/lib/aiaic-labels";
import { SERVICE_ICON } from "@/lib/service-icons";
import {
  confidenceLevel,
  isAbstention,
  type IntelligenceItem,
  type Service,
} from "@/lib/aiaic-types";
import { useI18n } from "@/lib/i18n";

export function RecommendationCard({
  service,
  item,
  index,
  search,
}: {
  service: Service;
  item: IntelligenceItem;
  index: number;
  search: { region?: string; crop?: string; land?: string; services?: string };
}) {
  const { t, lang } = useI18n();
  const abstained = isAbstention(item);
  const level = confidenceLevel(item);
  const subject = [item.subject?.crop, item.subject?.region].filter(Boolean).join(" • ");
  const Icon = SERVICE_ICON[service];

  return (
    <article className="rounded-3xl border-2 border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon aria-hidden className="size-7 text-primary" strokeWidth={2.25} />
        <h2 className="text-lg font-bold uppercase tracking-wide text-muted-foreground">
          {t(`service.${service}`)}
        </h2>
      </div>

      {abstained ? (
        <>
          <p className="mt-3 text-2xl font-extrabold leading-tight text-foreground">
            {t("abstain.title")}
          </p>
          <p className="mt-2 text-lg leading-relaxed text-foreground/80">
            {item.recommendation_detail ?? t("abstain.body")}
          </p>
        </>
      ) : (
        <>
          <p className="mt-3 text-2xl font-extrabold leading-tight text-foreground">
            {recommendationLabel(item.recommendation, lang)}
          </p>
          {item.recommendation_detail ? (
            <p className="mt-2 text-lg leading-relaxed text-foreground/80">
              {item.recommendation_detail}
            </p>
          ) : null}
        </>
      )}

      {subject ? <p className="mt-3 text-base text-muted-foreground">{subject}</p> : null}

      <div className="mt-4 border-t border-border pt-4">
        <ConfidenceMeter level={level} />
        {item.calibrated === false ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-warning-soft px-3 py-2 text-base font-semibold text-warning-foreground">
            <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0" />
            <span>{t("conf.uncalibrated")}</span>
          </p>
        ) : null}
      </div>

      <Link
        to="/advice/$service"
        params={{ service }}
        search={{ ...search, i: index }}
        className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-primary px-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {t("result.open")}
      </Link>
    </article>
  );
}
