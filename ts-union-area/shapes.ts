// Type de forme — lecture seule.
export type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number };
