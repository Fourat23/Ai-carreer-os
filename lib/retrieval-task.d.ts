export interface Archetype {
  id: string; forme: string; minutes: number;
  exige: string[]; exigeCode: boolean;
  titre: string; consigne: string; verifier: string; note?: string;
}
export interface Tache {
  archetype: string; forme: string; titre: string; consigne: string;
  verifier: string; minutes: number; note: string | null;
}
export declare const ARCHETYPES: Archetype[];
export declare const SECTION_LABEL: Record<string, string>;
export declare function archetypesDisponibles(titres: string[], aDuCode?: boolean): Archetype[];
export declare function tachePour(
  forme: string, titres: string[], aDuCode?: boolean, options?: { exclure?: string[] },
): Tache | null;
export declare function couverture(lecons: { id: string; titres: string[]; aDuCode: boolean }[]): {
  total: number;
  archetypes: { id: string; forme: string; lecons: number; minutes: number }[];
  leconsSansAucunArchetype: number;
  formesCouvertes: string[];
};
