// Déclarations de types pour le modèle de manifest Kubernetes (lib/manifest.mjs).

export type Kind =
  | 'Pod' | 'ReplicaSet' | 'Deployment' | 'StatefulSet' | 'DaemonSet' | 'Job'
  | 'CronJob' | 'Service' | 'Ingress' | 'ConfigMap' | 'Secret' | 'Namespace'
  | 'PersistentVolumeClaim' | 'ServiceAccount' | 'HorizontalPodAutoscaler';
export type ServiceType = 'ClusterIP' | 'NodePort' | 'LoadBalancer';
export type StrategyType = 'RollingUpdate' | 'Recreate';

export const KINDS: Kind[];
export const WORKLOAD_KINDS: Set<Kind>;
export const SERVICE_TYPES: ServiceType[];
export const STRATEGIES: StrategyType[];
export const MANIFEST_CAPS: {
  maxResources: number; maxContainers: number; maxDepth: number;
  maxLabels: number; maxSerializedBytes: number;
};

export interface ResourceMeta {
  name: string; namespace?: string;
  labels?: Record<string, string>; annotations?: Record<string, string>;
}
export interface Resource {
  apiVersion: string; kind: Kind; metadata: ResourceMeta;
  spec?: Record<string, unknown>;
}
export interface ManifestSet {
  id: string; title: string; description: string;
  resources: Resource[];
  skills: string[]; dayRefs: number[]; trackScope?: string[] | null;
  missionRefs?: string[];
}
export interface ManifestValidationCtx {
  skillIds?: { has: (s: string) => boolean };
  validDays?: Set<number>;
  trackIds?: Set<string>;
}

export function resourceKey(r: Resource): string;
export function podTemplateLabels(r: Resource): Record<string, string>;
export function selectorMatches(selector: unknown, labels?: Record<string, string>): boolean;
export function serviceEndpoints(service: Resource, resources: Resource[]): Resource[];
export function podsOf(r: Resource): number;
export function containersOf(r: Resource): Array<Record<string, unknown>>;
export function validateManifestSet(set: ManifestSet, ctx?: ManifestValidationCtx): { ok: boolean; errors: string[] };
export function publicManifestView(set: ManifestSet): Record<string, unknown>;
