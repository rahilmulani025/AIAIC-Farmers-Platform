import { recommendationLabel } from "./aiaic-labels";
import {
  confidenceLevel,
  daysOld,
  isAbstention,
  observedAt,
  type IntelligenceItem,
} from "./aiaic-types";
import type { Lang } from "./i18n";

type T = (key: string, vars?: Record<string, string | number>) => string;

/** One-line, plain-language summary of how this advice was reached. */
export function summaryLine(item: IntelligenceItem, t: T): string {
  const count = (item.sources_used ?? []).length;
  const sources =
    count === 0
      ? t("detail.summary.sources.none")
      : count === 1
        ? t("detail.summary.sources.one")
        : t("detail.summary.sources", { count });

  const observed = observedAt(item);
  const age = observed ? daysOld(observed) : null;
  const ageText =
    age === null
      ? t("detail.summary.age.unknown")
      : age <= 0
        ? t("detail.summary.age.today")
        : t("detail.summary.age.days", { days: age });

  return t("detail.summary.body", {
    sources,
    age: ageText,
    conf: t(`conf.${confidenceLevel(item)}`),
  });
}

/** Plain text used for the read-out and for sharing / printing. */
export function adviceText(item: IntelligenceItem, serviceLabel: string, t: T, lang: Lang): string {
  const abstained = isAbstention(item);
  const headline = abstained ? t("abstain.title") : recommendationLabel(item.recommendation, lang);
  const detail = item.recommendation_detail ?? (abstained ? t("abstain.body") : "");
  const why = (item.explainability ?? []).slice(0, 3);
  const reference = item.decision_id ?? item.supporting_evidence?.decision_id;

  return [
    serviceLabel,
    headline,
    detail,
    summaryLine(item, t),
    why.length ? `${t("detail.why")}: ${why.join(" ")}` : "",
    t("conf.uncalibrated"),
    t("detail.next.body"),
    reference ? `${t("detail.decision")}: ${reference}` : "",
  ]
    .filter((line) => line && line.trim().length > 0)
    .join("\n\n");
}
