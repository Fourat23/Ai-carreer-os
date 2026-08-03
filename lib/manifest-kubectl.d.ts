// Types pour lib/manifest-kubectl.mjs (adaptateur de disponibilité, I/O bornée).
export type KubectlState = 'absent' | 'cli-only' | 'cluster' | 'denied';
export interface KubectlAvailability {
  state: KubectlState;
  reason: string;
  canExecute: boolean;
  version: string | null;
}
export function parseKubectlState(cliOk: boolean, clusterOk: boolean, denied: boolean, versionText: string | null): KubectlAvailability;
export function kubectlAvailability(): Promise<KubectlAvailability>;
