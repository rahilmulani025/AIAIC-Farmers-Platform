import { queryOptions } from "@tanstack/react-query";

import { CROPS, DISTRICTS, MANDIS } from "./aiaic-labels";
import { SERVICES, isService, type Catalog, type CatalogResult, type Service } from "./aiaic-types";
import { getCatalog } from "./catalog.functions";

export const catalogQueryOptions = () =>
  queryOptions({
    queryKey: ["aiaic-catalog"],
    queryFn: () => getCatalog(),
    staleTime: 5 * 60_000,
    retry: 0,
  });

export type CatalogOptions = {
  /** True when the lists below came from the engine, not our built-in fallback. */
  live: boolean;
  regions: string[];
  crops: string[];
  mandis: string[];
  services: Service[];
  uncalibrated: boolean;
};

/** Engine values win; the built-in lists only fill in when the engine is unreachable. */
export function catalogOptions(result: CatalogResult | undefined): CatalogOptions {
  const catalog: Catalog | undefined = result?.ok ? result.catalog : undefined;
  const services = (catalog?.services ?? []).filter(isService);

  return {
    live: Boolean(catalog),
    regions: catalog?.regions?.length ? catalog.regions : [...DISTRICTS],
    crops: catalog?.crops?.length ? catalog.crops : [...CROPS],
    mandis: catalog?.market_mandis?.length ? catalog.market_mandis : [...MANDIS],
    services: services.length ? services : [...SERVICES],
    uncalibrated: catalog?.uncalibrated === true,
  };
}

/** Display-only prettifying; the raw value is always what we send to the engine. */
export function displayName(value: string): string {
  return value
    .split(/(\s+|\/)/)
    .map((part) => (/^[a-z]/.test(part) ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join("");
}

const norm = (v: string) => v.trim().toLowerCase();

/**
 * Whether the engine's catalog knows this subject. An unknown region or crop
 * comes back as an empty `[]` with HTTP 200, so knowing this lets us say
 * "the engine has no data for this district/crop" instead of "nothing today".
 */
export function subjectSupport(
  options: CatalogOptions,
  subject: { region?: string | undefined; crop?: string | undefined },
): { regionKnown: boolean; cropKnown: boolean; anyUnknown: boolean } {
  const region = subject.region?.trim();
  const crop = subject.crop?.trim();
  const regionKnown =
    !region ||
    !options.live ||
    options.regions.some((r) => norm(r) === norm(region)) ||
    options.mandis.some((m) => norm(m) === norm(region));
  const cropKnown = !crop || !options.live || options.crops.some((c) => norm(c) === norm(crop));
  return { regionKnown, cropKnown, anyUnknown: !regionKnown || !cropKnown };
}
