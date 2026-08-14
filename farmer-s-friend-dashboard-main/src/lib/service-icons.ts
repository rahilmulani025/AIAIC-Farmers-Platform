import { CloudSun, Droplets, IndianRupee, Sprout, Warehouse, type LucideIcon } from "lucide-react";

import type { Service } from "./aiaic-types";

export const SERVICE_ICON: Record<Service, LucideIcon> = {
  market: IndianRupee,
  water: Droplets,
  weather: CloudSun,
  crop: Sprout,
  storage: Warehouse,
};
