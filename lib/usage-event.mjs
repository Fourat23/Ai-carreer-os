// V77 · CP3 — L'USAGE OBSERVÉ, ET RIEN DE PLUS. Module PUR.
//
// ── CE QUE LE CP0 A MESURÉ, ET POURQUOI CE FAIT EST SI PAUVRE ───────────
//
// Le terminal **exécute vraiment** : `exitCode 0`, 263 octets de sortie, une
// commande allowlistée dans un bac à sable. Le produit voit tout cela et n'en
// garde rien.
//
// Mais le CP0 a aussi mesuré ce que le terminal **n'a pas** : ses trois tâches
// ne portent aucun critère de réussite pédagogique, et leurs arguments sont des
// **énumérations fermées**. `term-list-files` demande de choisir entre `-1`,
// `-l` et `-la` — trois options toutes valides. Sa propre description dit
// « démonstration d'exécution bornée ».
//
//   > Un apprenant qui choisit `-la` parmi trois options valides n'a rien
//   > démontré.
//
// Fabriquer un `TerminalAttempt(success = true)` inventerait donc un verdict
// pédagogique là où il n'y a qu'un usage. Le contrat gelé l'interdit
// nommément.
//
// ── ALORS POURQUOI ÉCRIRE QUELQUE CHOSE ? ───────────────────────────────
//
// Parce que V78 observera des humains, et qu'une question légitime restera sans
// réponse si l'on n'écrit rien :
//
//   > « ce participant a-t-il pratiqué au terminal, ou n'y est-il jamais
//   >   allé ? »
//
// C'est un fait d'USAGE. Il ne dit pas que quelqu'un a réussi ; il dit que
// quelque chose a eu lieu. C'est peu, et c'est exactement ce que le produit
// sait.
//
// ── LES CINQ CONTRAINTES, GELÉES AU CP1 §3.4 ────────────────────────────
//
//   1. vit dans un champ SÉPARÉ de l'état (`usageEvents`) ;
//   2. ne produit JAMAIS d'`EVIDENCE` ;
//   3. n'entre dans AUCUN moteur (compétence, rétention, récupération) ;
//   4. borné, exportable et supprimable comme le reste ;
//   5. ne porte JAMAIS `passed`, `success`, `outcome` ni `score`.
//
// Sans ces cinq règles, un événement d'usage serait de la télémétrie déguisée
// en pédagogie. Avec elles, il répond à une question modeste, et à une seule.
import { dedupSorted } from './event-model.mjs';

/** Les surfaces autorisées à émettre un usage. Vocabulaire FERMÉ. */
export const SURFACES_USAGE = Object.freeze(['terminal', 'pipelines']);

/** Ce qui a été fait. Volontairement pauvre : aucun verbe de réussite. */
export const ACTIONS_USAGE = Object.freeze(['run']);

/** Plafond de conservation, aligné sur les autres faits du produit. */
export const MAX_USAGE_EVENTS = 5_000;

/**
 * Les champs INTERDITS dans le détail d'un usage. Exportés pour que les tests
 * et la porte puissent les vérifier plutôt que de faire confiance à ce
 * commentaire.
 */
export const CHAMPS_INTERDITS = Object.freeze(['passed', 'success', 'outcome', 'score', 'allPassed', 'validation']);

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const iso = (v) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : null);
const int = (v, min, max) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

/**
 * Un fait « une fonctionnalité a été utilisée ».
 *
 * Même discipline que les huit autres faits du produit : horloge SERVEUR,
 * provenance obligatoire, vocabulaire fermé, version de schéma. La différence
 * tient en une ligne : **il ne porte aucune issue**.
 *
 * @param raw.surface   `terminal` ou `pipelines`
 * @param raw.ref       ce qui a été utilisé (identifiant de tâche, de pipeline)
 * @param raw.detail    faits observés seulement — adaptateur, code de sortie, durée
 */
export function normalizeUsageEvent(raw, { now = null } = {}) {
  const r = isObj(raw) ? raw : {};
  const at = iso(r.at) ?? iso(now);
  if (!at) return null;

  if (!SURFACES_USAGE.includes(r.surface)) return null;
  if (!ACTIONS_USAGE.includes(r.action)) return null;

  const ref = str(r.ref, 120);
  if (!ref) return null;

  // Provenance obligatoire — un fait sans producteur est refusé, jamais réparé.
  const producer = str(r.provenance?.producer, 60);
  if (!producer) return null;

  // ── LE DÉTAIL EST UNE LISTE BLANCHE, PAS UN FILTRE ──
  //
  // Recopier l'objet reçu en retirant les champs interdits laisserait passer
  // tout ce qu'on n'a pas pensé à interdire. On ne garde donc que ce qu'on a
  // décidé d'observer, nommément.
  const d = isObj(r.detail) ? r.detail : {};
  const detail = {};
  const adapter = str(d.adapter, 30);
  if (adapter) detail.adapter = adapter;
  const exitCode = int(d.exitCode, -255, 255);
  if (exitCode !== null) detail.exitCode = exitCode;
  const durationMs = int(d.durationMs, 0, 86_400_000);
  if (durationMs !== null) detail.durationMs = durationMs;
  const disponible = typeof d.disponible === 'boolean' ? d.disponible : null;
  if (disponible !== null) detail.disponible = disponible;

  return {
    at,
    surface: r.surface,
    action: r.action,
    ref,
    detail,
    provenance: { producer, method: str(r.provenance?.method, 80) },
    schemaVersion: 1,
  };
}

/**
 * Clé métier : une même surface, une même référence, à la même seconde, est le
 * même usage. Un double-clic ou un rejeu réseau ne compte pas deux fois.
 */
export function usageEventKey(e) {
  return `${e.surface}|${e.ref}|${String(e.at).slice(0, 19)}`;
}

/** Normalise et déduplique une liste persistée. Triée par date, pas par insertion. */
export function normalizeUsageEvents(list) {
  const out = [];
  for (const e of Array.isArray(list) ? list : []) {
    const n = normalizeUsageEvent(e, { now: null });
    if (n) out.push(n);
  }
  return dedupSorted(out, usageEventKey, { max: MAX_USAGE_EVENTS });
}

/**
 * ── CE QU'UN USAGE PERMET DE DIRE, ET CE QU'IL NE PERMET PAS ─────────────
 *
 * Répond à *« ce participant a-t-il utilisé cette surface ? »*, et pas à
 * *« l'a-t-il réussie ? »*. La phrase rendue est délibérément descriptive :
 * aucun adjectif de valeur, aucun compteur présenté comme un progrès.
 */
export function usageDe(events, surface) {
  const tous = normalizeUsageEvents(events).filter((e) => e.surface === surface);
  const refs = [...new Set(tous.map((e) => e.ref))];
  return {
    surface,
    executions: tous.length,
    refsDistinctes: refs,
    premier: tous[0]?.at ?? null,
    dernier: tous[tous.length - 1]?.at ?? null,
    /** Ce fait ne vaut JAMAIS une réussite. Le champ existe pour le rappeler. */
    vautReussite: false,
    lecture: tous.length === 0
      ? `Aucune utilisation observée sur « ${surface} ».`
      : `${tous.length} exécution${tous.length > 1 ? 's' : ''} observée${tous.length > 1 ? 's' : ''} `
        + `sur ${refs.length} élément${refs.length > 1 ? 's' : ''} — usage constaté, aucune réussite mesurée.`,
  };
}
