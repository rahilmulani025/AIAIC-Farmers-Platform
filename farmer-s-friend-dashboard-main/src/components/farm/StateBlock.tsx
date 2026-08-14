import { AlertTriangle, HelpCircle, Map, WifiOff, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n";
import type { FailureReason } from "@/lib/aiaic-types";
import { cn } from "@/lib/utils";

export function StateBlock({
  tone = "neutral",
  icon,
  title,
  body,
  action,
}: {
  tone?: "neutral" | "warning" | "danger";
  icon?: LucideIcon;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-3xl border-2 p-5 text-center",
        tone === "neutral" && "border-border bg-card",
        tone === "warning" && "border-warning bg-warning-soft",
        tone === "danger" && "border-danger bg-danger-soft",
      )}
    >
      {icon ? (
        <div className="mb-3 flex justify-center">
          {(() => {
            const Icon = icon;
            return <Icon aria-hidden className="size-10" strokeWidth={2.25} />;
          })()}
        </div>
      ) : null}
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      {body ? <p className="mt-2 text-lg leading-relaxed text-foreground/80">{body}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function FailureBlock({ reason, action }: { reason: FailureReason; action?: ReactNode }) {
  const { t } = useI18n();
  const map: Record<FailureReason, { key: string; icon: LucideIcon; tone: "warning" | "danger" }> =
    {
      offline: { key: "state.offline", icon: WifiOff, tone: "warning" },
      not_found: { key: "state.notfound", icon: Map, tone: "warning" },
      bad_response: { key: "state.bad", icon: HelpCircle, tone: "danger" },
      request_failed: { key: "state.failed", icon: AlertTriangle, tone: "danger" },
    };
  const entry = map[reason];

  return (
    <StateBlock
      tone={entry.tone}
      icon={entry.icon}
      title={t(`${entry.key}.title`)}
      body={t(`${entry.key}.body`)}
      {...(action ? { action } : {})}
    />
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <p className="text-center text-lg font-semibold text-muted-foreground">{label}</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse rounded-3xl border-2 border-border bg-card p-5">
          <div className="h-6 w-1/3 rounded-full bg-muted" />
          <div className="mt-4 h-9 w-2/3 rounded-full bg-muted" />
          <div className="mt-3 h-5 w-full rounded-full bg-muted" />
          <div className="mt-2 h-5 w-4/5 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}
