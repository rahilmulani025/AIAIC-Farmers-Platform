import { Printer, Share2, Square, Volume2 } from "lucide-react";
import { useState } from "react";

import { useI18n } from "@/lib/i18n";
import { useSpeech } from "@/lib/use-speech";

/**
 * Listen + share/print for one piece of advice. Both are pure browser actions;
 * nothing is sent anywhere.
 */
export function AdviceActions({ text, title }: { text: string; title: string }) {
  const { t, lang } = useI18n();
  const speech = useSpeech(lang);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const payload = `${text}\n\n${window.location.href}`;
    const nav = window.navigator as Navigator & {
      share?: (data: { title: string; text: string }) => Promise<void>;
    };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title, text: payload });
        return;
      } catch {
        /* user dismissed the sheet — fall through to copy */
      }
    }
    try {
      await window.navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 4000);
    } catch {
      window.print();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {speech.supported ? (
          <button
            type="button"
            onClick={() => speech.toggle(text)}
            aria-pressed={speech.speaking}
            className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-card px-4 text-lg font-bold text-primary"
          >
            {speech.speaking ? (
              <Square aria-hidden className="size-6" />
            ) : (
              <Volume2 aria-hidden className="size-6" />
            )}
            {speech.speaking ? t("speak.stop") : t("speak.play")}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => void share()}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-border bg-card px-4 text-lg font-bold text-foreground"
        >
          <Share2 aria-hidden className="size-6" />
          {t("share.button")}
          <Printer aria-hidden className="size-5 text-muted-foreground" />
        </button>
      </div>
      {copied ? (
        <p role="status" className="mt-2 text-base font-semibold text-success">
          {t("share.copied")}
        </p>
      ) : null}
    </div>
  );
}
