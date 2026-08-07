// Types pour lib/cloud-cost.mjs (estimateur factice déterministe, pur).
import type { CloudArchitecture } from './cloud-architecture';

export interface CostEstimate {
  total: number; currency: string;
  byResource: { resourceId: string; kind: string; units: number; unitCost: number; cost: number }[];
  simulated: true; disclaimer: string;
}
export function estimateMonthlyCost(arch: CloudArchitecture, priceBook?: unknown): CostEstimate;
