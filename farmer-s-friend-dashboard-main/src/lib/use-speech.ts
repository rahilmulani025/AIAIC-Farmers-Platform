import { useCallback, useEffect, useState } from "react";

import type { Lang } from "./i18n";

const VOICE_LOCALE: Record<Lang, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
};

/**
 * Read-out of the advice using the browser's built-in speech synthesis.
 * Many target users read slowly; hearing the headline matters more than
 * pixel-perfect text. Support is checked after hydration so SSR stays clean.
 */
export function useSpeech(lang: Lang) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const locale = VOICE_LOCALE[lang];
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      const voice =
        synth.getVoices().find((v) => v.lang === locale) ??
        synth.getVoices().find((v) => v.lang.startsWith(locale.split("-")[0] ?? "")) ??
        null;
      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(utterance);
    },
    [lang],
  );

  const toggle = useCallback(
    (text: string) => {
      if (speaking) stop();
      else speak(text);
    },
    [speaking, speak, stop],
  );

  return { supported, speaking, speak, stop, toggle };
}
