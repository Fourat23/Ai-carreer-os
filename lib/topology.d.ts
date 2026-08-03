// Déclarations de types pour le modèle de topologie cloud (lib/topology.mjs).

export type NodeKind =
  | 'client' | 'dns' | 'cdn' | 'load-balancer' | 'reverse-proxy' | 'api'
  | 'frontend' | 'backend' | 'worker' | 'queue' | 'cache' | 'relational-db'
  | 'nosql-db' | 'object-storage' | 'file-storage' | 'block-storage' | 'nat'
  | 'gateway' | 'subnet' | 'firewall' | 'secret-store' | 'monitoring' | 'backup'
  | 'scheduler';
export type EdgeKind =
  | 'depends-on' | 'routes-to' | 'reads' | 'writes' | 'replicates-to'
  | 'backs-up' | 'monitors' | 'resolves';
export type Environment = 'development' | 'testing' | 'staging' | 'preproduction' | 'production';
export type ObjectiveKind =
  | 'availability' | 'cost' | 'performance' | 'security' | 'maintainability'
  | 'complexity' | 'rpo' | 'rto';

export const NODE_KINDS: NodeKind[];
export const EDGE_KINDS: EdgeKind[];
export const DEPENDENCY_EDGE_KINDS: Set<EdgeKind>;
export const ENVIRONMENTS: Environment[];
export const OBJECTIVE_KINDS: ObjectiveKind[];
export const TOPOLOGY_CAPS: {
  maxNodes: number; maxEdges: number; maxZones: number; maxEnvironments: number;
  maxDepth: number; maxChain: number; maxSerializedBytes: number;
};

export interface Zone { id: string; label: string }
export interface TopoNode {
  id: string; kind: NodeKind; label: string;
  zone?: string | null; environment?: Environment | null;
  props?: Record<string, unknown>;
}
export interface TopoEdge {
  id: string; from: string; to: string; kind: EdgeKind;
  props?: Record<string, unknown>;
}
export interface Constraint { id: string; kind: string; target?: unknown }
export interface Objective { id: string; kind: ObjectiveKind; target?: unknown }
export interface Topology {
  id: string; title: string; description: string;
  environments?: Environment[]; zones?: Zone[];
  nodes: TopoNode[]; edges: TopoEdge[];
  constraints?: Constraint[]; objectives?: Objective[];
  skills: string[]; dayRefs: number[]; trackScope?: string[] | null;
  missionRefs?: string[];
}
export interface TopologyValidationCtx {
  skillIds?: { has: (s: string) => boolean };
  validDays?: Set<number>;
  trackIds?: Set<string>;
}

export function findCycle(nodes: TopoNode[], edges: TopoEdge[]): string[] | null;
export function longestChain(nodes: TopoNode[], edges: TopoEdge[]): number;
export function validateTopology(topo: Topology, ctx?: TopologyValidationCtx): { ok: boolean; errors: string[] };
export function publicTopologyView(topo: Topology): Record<string, unknown>;
