import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { FailureReason } from "./aiaic-types";

const inputSchema = z.object({
  /** Data URL or bare base64 of the photo taken by the farmer. */
  image: z.string().min(32).max(9_000_000),
  filename: z.string().max(120).optional(),
  crop: z.string().trim().max(80).optional(),
});

export type PlantObservation = { label: string; value: string };

export type PlantResult = {
  /** False when no plant-intelligence URL is configured yet. */
  configured: boolean;
  ok: boolean;
  reason?: FailureReason;
  detail?: string;
  status?: number;
  species?: string;
  stage?: string;
  observations: PlantObservation[];
  /** Raw engine JSON, kept as text for the expert review page. */
  raw?: string;
  fetchedAt: string;
};

/**
 * Sends a leaf/plant photo to the Plant Intelligence subsystem and returns the
 * observations it reports. Nothing is invented here: this subsystem describes
 * what it sees (colour, texture, pest signs, stress) and this function passes
 * that through unchanged. No treatment advice is generated.
 */
export const analyzePlantPhoto = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<PlantResult> => {
    const fetchedAt = new Date().toISOString();
    const baseUrl = (process.env["PLANT_BASE_URL"] ?? "").replace(/\/+$/, "");
    if (!baseUrl) {
      return { configured: false, ok: false, reason: "offline", observations: [], fetchedAt };
    }

    const { AIAIC_HEADERS, isTunnelErrorBody } = await import("./aiaic-base.server");

    let body: FormData;
    try {
      body = new FormData();
      const base64 = data.image.includes(",") ? data.image.split(",")[1]! : data.image;
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      body.append("file", new Blob([bytes], { type: "image/jpeg" }), data.filename ?? "plant.jpg");
      if (data.crop) body.append("crop", data.crop);
    } catch {
      return {
        configured: true,
        ok: false,
        reason: "bad_response",
        detail: "image_unreadable",
        observations: [],
        fetchedAt,
      };
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/analyze`, {
        method: "POST",
        headers: { accept: "application/json", "ngrok-skip-browser-warning": "true" },
        body,
        signal: AbortSignal.timeout(45_000),
      });
    } catch (error) {
      console.error("[plant] request failed", error);
      return {
        configured: true,
        ok: false,
        reason: "offline",
        detail: "network",
        observations: [],
        fetchedAt,
      };
    }
    void AIAIC_HEADERS;

    const text = await response.text();
    if (isTunnelErrorBody(text)) {
      return {
        configured: true,
        ok: false,
        reason: "offline",
        status: response.status,
        detail: "tunnel_error_page",
        observations: [],
        fetchedAt,
      };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        configured: true,
        ok: false,
        reason: "bad_response",
        status: response.status,
        detail: "not_json",
        observations: [],
        fetchedAt,
      };
    }

    if (!response.ok) {
      const detail =
        parsed &&
        typeof parsed === "object" &&
        typeof (parsed as { detail?: unknown }).detail === "string"
          ? (parsed as { detail: string }).detail
          : undefined;
      return {
        configured: true,
        ok: false,
        reason: response.status >= 500 ? "offline" : "request_failed",
        status: response.status,
        ...(detail ? { detail } : {}),
        observations: [],
        fetchedAt,
        raw: text,
      };
    }

    const obj = (parsed ?? {}) as Record<string, unknown>;
    const species = pickString(obj, ["plant_species", "species", "plant", "crop"]);
    const stage = pickString(obj, ["growth_stage", "stage"]);

    return {
      configured: true,
      ok: true,
      ...(species ? { species } : {}),
      ...(stage ? { stage } : {}),
      observations: flattenObservations(obj["observations"] ?? obj["analysis"] ?? obj),
      raw: text,
      fetchedAt,
    };
  });

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

const SKIP_KEYS = new Set([
  "plant_species",
  "species",
  "growth_stage",
  "stage",
  "observations",
  "analysis",
]);

/**
 * The subsystem groups observations in nested objects. We flatten them into
 * readable label/value lines without renaming or interpreting anything.
 */
function flattenObservations(source: unknown, prefix = ""): PlantObservation[] {
  if (source === null || source === undefined) return [];
  if (Array.isArray(source)) {
    return source.flatMap((entry, index) =>
      typeof entry === "object" && entry !== null
        ? flattenObservations(entry, prefix)
        : [{ label: prefix || `#${index + 1}`, value: String(entry) }],
    );
  }
  if (typeof source !== "object") {
    return prefix ? [{ label: prefix, value: String(source) }] : [];
  }

  const out: PlantObservation[] = [];
  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    if (!prefix && SKIP_KEYS.has(key)) {
      if (key === "observations" || key === "analysis") continue;
      continue;
    }
    const label = prefix ? `${prefix} — ${humanize(key)}` : humanize(key);
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "object") out.push(...flattenObservations(value, label));
    else out.push({ label, value: String(value) });
  }
  return out.slice(0, 40);
}

function humanize(key: string): string {
  return key.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
