import { queryOptions } from "@tanstack/react-query";

import { CROPS, DISTRICTS, MANDIS } from "./aiaic-labels";
import {
  SERVICES,
  isService,
  type Catalog,
  type CatalogResult,
  type PerServiceItem,
  type Service,
} from "./aiaic-types";
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
  perService?: Record<string, PerServiceItem> | undefined;
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
    perService: catalog?.per_service,
    uncalibrated: catalog?.uncalibrated === true,
  };
}

/**
 * Derives valid dropdown options (regions, crops, mandis) for one or more services
 * from `per_service[service].crop_list` and `region_list`, avoiding union pollution across services.
 */
export function getFilteredOptions(
  options: CatalogOptions,
  selectedServices?: Service[] | Service,
): { regions: string[]; crops: string[]; mandis: string[] } {
  const list: Service[] = !selectedServices
    ? options.services
    : Array.isArray(selectedServices)
      ? selectedServices.length > 0
        ? selectedServices
        : options.services
      : [selectedServices];

  if (!options.live || !options.perService) {
    return {
      regions: options.regions,
      crops: options.crops,
      mandis: options.mandis,
    };
  }

  const regionSet = new Set<string>();
  const cropSet = new Set<string>();

  for (const s of list) {
    const entry = options.perService[s];
    if (entry) {
      for (const r of entry.region_list ?? []) {
        if (r && r.trim()) regionSet.add(r.trim());
      }
      for (const c of entry.crop_list ?? []) {
        if (c && c.trim()) cropSet.add(c.trim());
      }
    }
  }

  return {
    regions: regionSet.size > 0 ? Array.from(regionSet) : options.regions,
    crops: cropSet.size > 0 ? Array.from(cropSet) : options.crops,
    mandis: options.mandis,
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
 * Whether the engine's catalog knows this subject for a specific service or overall.
 * An unknown region or crop comes back as an empty `[]` with HTTP 200, so knowing this lets us say
 * "the engine has no data for this district/crop" instead of "nothing today".
 */
export function subjectSupport(
  options: CatalogOptions,
  subject: { region?: string | undefined; crop?: string | undefined },
  service?: Service,
): { regionKnown: boolean; cropKnown: boolean; anyUnknown: boolean } {
  const region = subject.region?.trim();
  const crop = subject.crop?.trim();

  if (!options.live) {
    return { regionKnown: true, cropKnown: true, anyUnknown: false };
  }

  if (service && options.perService && options.perService[service]) {
    const sEntry = options.perService[service];
    const sRegions = sEntry.region_list?.length ? sEntry.region_list : options.regions;
    const sCrops = sEntry.crop_list?.length ? sEntry.crop_list : options.crops;

    const regionKnown =
      !region ||
      sRegions.some((r) => norm(r) === norm(region)) ||
      (service === "market" && options.mandis.some((m) => norm(m) === norm(region)));
    const cropKnown = !crop || sCrops.some((c) => norm(c) === norm(crop));

    return { regionKnown, cropKnown, anyUnknown: !regionKnown || !cropKnown };
  }

  const regionKnown =
    !region ||
    options.regions.some((r) => norm(r) === norm(region)) ||
    options.mandis.some((m) => norm(m) === norm(region));
  const cropKnown = !crop || options.crops.some((c) => norm(c) === norm(crop));
  return { regionKnown, cropKnown, anyUnknown: !regionKnown || !cropKnown };
}
