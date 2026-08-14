import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/farm/LanguageSwitcher";
import { loadFarm, type SavedFarm } from "@/lib/farm-storage";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AIAIC Kisan — Simple Farm Advice from Real Data" },
      {
        name: "description",
        content:
          "Plain-language crop, water, weather and mandi price guidance for Maharashtra farmers, built on real government data with honest confidence and sources.",
      },
      { property: "og:title", content: "AIAIC Kisan — Simple Farm Advice from Real Data" },
      {
        property: "og:description",
        content:
          "Enter your district and crop to see today's real agricultural intelligence in simple words, with sources and limitations shown clearly.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { t } = useI18n();
  const [saved, setSaved] = useState<SavedFarm | null>(null);

  // Saved farm lives in the browser, so read it after hydration.
  useEffect(() => {
    const farm = loadFarm();
    if (farm && (farm.region || farm.crop)) setSaved(farm);
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-16 pt-6">
      <header className="text-center">
        <p className="text-lg font-bold uppercase tracking-widest text-primary">{t("app.name")}</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight text-foreground">
          {t("app.tagline")}
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-foreground/80">{t("home.lead")}</p>
      </header>

      <div className="mt-8">
        <LanguageSwitcher />
      </div>

      {saved ? (
        <Link
          to="/result"
          search={{
            ...(saved.region ? { region: saved.region } : {}),
            ...(saved.crop ? { crop: saved.crop } : {}),
            ...(saved.land ? { land: saved.land } : {}),
            ...(saved.services ? { services: saved.services } : {}),
          }}
          className="mt-8 flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl bg-primary px-6 text-xl font-extrabold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
        >
          <RotateCcw aria-hidden className="size-6 shrink-0" />
          <span>
            {t("home.continue")}
            <span className="block text-base font-semibold opacity-90">
              {[saved.crop, saved.region].filter(Boolean).join(" • ")}
            </span>
          </span>
        </Link>
      ) : null}

      <Link
        to="/ask"
        className={`flex min-h-16 w-full items-center justify-center rounded-3xl px-6 text-2xl font-extrabold shadow-md transition-colors ${
          saved
            ? "mt-3 border-2 border-primary bg-card text-primary hover:bg-secondary"
            : "mt-8 bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {t("home.cta")}
      </Link>

      <section className="mt-10" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-2xl font-bold text-foreground">
          {t("home.how")}
        </h2>
        <ol className="mt-4 space-y-3">
          {["home.step1", "home.step2", "home.step3"].map((key, i) => (
            <li
              key={key}
              className="flex items-start gap-4 rounded-2xl bg-card p-4 border-2 border-border"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-xl font-extrabold text-secondary-foreground">
                {i + 1}
              </span>
              <span className="text-lg leading-relaxed text-foreground">{t(key)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="disclaimer-heading"
        className="mt-10 rounded-3xl border-2 border-warning bg-warning-soft p-5"
      >
        <h2
          id="disclaimer-heading"
          className="flex items-center gap-2 text-xl font-extrabold text-warning-foreground"
        >
          <AlertTriangle aria-hidden className="size-6 shrink-0" />
          {t("home.demo.title")}
        </h2>
        <p className="mt-2 text-lg leading-relaxed text-warning-foreground">
          {t("home.demo.body")}
        </p>
      </section>
    </div>
  );
}
