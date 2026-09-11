// V75 · CP2 — MODÈLE ÉVÉNEMENTIEL V2. Le contrat commun à tous les faits.
//
// ── POURQUOI CE MODULE ───────────────────────────────────────────────────
//
// Le CP0 a inventorié sept événements persistés et constaté qu'ils n'obéissent
// à aucune règle commune :
//
//   · `ExerciseAttempt`  provenance obligatoire, clé métier, issue dérivée ;
//   · `RecallAttempt`    provenance, clé métier ;
//   · `Evidence`         provenance, clé métier, mais AUCUN `conceptId` (D4) ;
//   · `DayAttempt`       outcome en CHAÎNE LIBRE, ni provenance ni clé (D3) ;
//   · `WeeklyReview`     ni horodatage, ni provenance, ni version (D6) ;
//   · `Submission`       ni provenance ;
//   · `TransferAttempt`  inexistant.
//
// Les deux premiers sont corrects parce que V74 les a écrits sous contrat. Les
// autres sont antérieurs. Ce module énonce le contrat **une seule fois**, pour
// que les faits nouveaux n'aient plus à le redécouvrir, et que les anciens
// puissent s'y conformer sans migration destructive.
//
// ── CE QUE CE MODULE N'EST PAS ───────────────────────────────────────────
//
// Ce n'est pas un bus d'événements, ni un moteur. Il ne stocke rien, ne décide
// rien et n'a aucune I/O. Il fournit un VOCABULAIRE et des NORMALISEURS purs.
//
// ── RÈGLE ABSOLUE : AUCUNE MIGRATION DESTRUCTIVE ─────────────────────────
//
// Un fait ancien, écrit avant ce contrat, doit continuer à être lu. Les champs
// ajoutés reçoivent une valeur par défaut explicite ; aucun fait n'est rejeté
// pour n'avoir pas connu le contrat au moment de son écriture. Ce qui est
// refusé, ce sont les faits NOUVEAUX mal formés — pas l'histoire.

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

/**
 * Version du schéma événementiel. Portée par chaque fait NOUVEAU ; absente sur
 * les faits antérieurs, où elle vaut `1` par convention de lecture.
 *
 * Elle existe pour une raison précise : sans elle, on ne peut pas distinguer
 * « champ absent parce qu'ancien » de « champ absent parce que mal écrit ». Le
 * CP0 a montré ce que coûte cette confusion — c'est exactement le
 * contournement G9 de V74 (« absence d'échec enregistré = absence d'échec »).
 */
export const EVENT_SCHEMA_VERSION = 2;

/** Grains auxquels un fait peut se rattacher. Un fait déclare le sien. */
export const GRAINS = ['day', 'concept', 'competency', 'exercise', 'project', 'week', 'challenge'];

/**
 * Issues d'une tentative, quel que soit le type de fait.
 *
 * `DayAttempt` (D3) écrivait une chaîne libre bornée à 40 caractères : un
 * `outcome` pouvait valoir n'importe quoi, et rien ne le relisait. Fermer le
 * vocabulaire est la moitié de la dette ; l'autre moitié est la provenance.
 */
export const ATTEMPT_OUTCOMES = ['success', 'partial', 'failure', 'abandoned', 'attempted'];
const OUTCOME_SET = new Set(ATTEMPT_OUTCOMES);

const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const iso = (v) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : null);

/**
 * ── LA PROVENANCE ────────────────────────────────────────────────────────
 *
 * `producer` est OBLIGATOIRE sur un fait nouveau. C'est la règle §3.6 du
 * contrat de V74, et elle vaut pour tous les faits : *un fait sans producteur
 * est refusé, jamais réparé en silence*.
 *
 * Sur un fait ANCIEN, l'absence de provenance n'est pas une faute : elle est
 * enregistrée telle quelle avec `producer: 'legacy'`, ce qui la rend visible
 * plutôt que muette.
 */
export function normalizeProvenance(raw, { legacy = false } = {}) {
  const p = isObj(raw) ? raw : {};
  const producer = str(p.producer, 60);
  if (!producer) return legacy ? { producer: 'legacy', method: '', note: '' } : null;
  return { producer, method: str(p.method, 80), note: str(p.note, 200) };
}

/**
 * ── L'ENVELOPPE COMMUNE ──────────────────────────────────────────────────
 *
 * Tout fait porte : quand (serveur), qui l'a produit, à quel grain il se
 * rattache, et sous quelle version de schéma il a été écrit.
 *
 * `at` n'est JAMAIS accepté depuis le client — le contrat V74 §3.6 l'a gelé et
 * V75 ne le rouvre pas. L'appelant serveur fournit `now`.
 */
export function normalizeEnvelope(raw, { now, legacy = false } = {}) {
  const r = isObj(raw) ? raw : {};
  const at = iso(r.at) ?? iso(now);
  if (!at) return null;
  const provenance = normalizeProvenance(r.provenance, { legacy });
  if (!provenance) return null;
  const grain = GRAINS.includes(r.grain) ? r.grain : null;
  return {
    at,
    provenance,
    grain,
    // Un fait sans version est un fait d'avant le contrat : on le lit comme v1
    // plutôt que de le rejeter ou de prétendre qu'il est à jour.
    schemaVersion: Number.isInteger(r.schemaVersion) ? r.schemaVersion
      : (legacy ? 1 : EVENT_SCHEMA_VERSION),
  };
}

/**
 * ── D3 — `DayAttempt`, TYPÉ plutôt que supprimé ──────────────────────────
 *
 * Le CP0 a mesuré : **1 producteur, 0 consommateur réel**, `outcome` en chaîne
 * libre, ni provenance ni idempotence.
 *
 * Quatre options étaient ouvertes : disparaître · être typé · être remplacé ·
 * rester legacy. **Décision : être TYPÉ, et rester lisible.**
 *
 * Pourquoi pas « disparaître », qui serait pourtant tentant vu ses zéro
 * lecteurs : parce que la progression d'un apprenant réel peut déjà en
 * contenir, et que supprimer un champ persisté est une migration destructive —
 * interdite par le brief. Un fait qu'on ne lit plus n'est pas un fait qu'on a
 * le droit d'effacer.
 *
 * Pourquoi pas « être remplacé » : `ExerciseAttempt` (V74) couvre déjà le
 * verdict objectif au grain exercice. `DayAttempt` dit autre chose — *« j'ai
 * travaillé cette journée »* — et le remplacer par un fait au grain exercice
 * confondrait deux grains, ce que ce sprint passe justement son temps à
 * séparer.
 *
 * Ce qui change : vocabulaire FERMÉ, provenance présente, clé métier, version.
 * Ce qui ne change pas : la forme persistée `{ at, outcome, summary }` reste
 * lisible, et les entrées anciennes traversent sans être rejetées.
 */
export function normalizeDayAttempt(raw, { now = null, legacy = false } = {}) {
  const r = isObj(raw) ? raw : {};
  const env = normalizeEnvelope({ ...r, grain: 'day' }, { now, legacy });
  if (!env) return null;
  const day = Number.isInteger(r.day) && r.day >= 1 && r.day <= 365 ? r.day : null;
  return {
    ...env,
    grain: 'day',
    day,
    // Vocabulaire fermé. Une valeur inconnue devient `attempted` — la plus
    // neutre — au lieu d'être conservée telle quelle : on ne veut pas qu'un
    // outcome fantaisiste survive à la normalisation.
    outcome: OUTCOME_SET.has(r.outcome) ? r.outcome : 'attempted',
    summary: str(r.summary, 500),
  };
}

/** Clé métier d'une tentative de journée : jour + seconde + issue. */
export function dayAttemptKey(a) {
  return `${a.day ?? '?'}|${String(a.at).slice(0, 19)}|${a.outcome}`;
}

/**
 * ── D6 — `WeeklyReview`, HORODATÉE et tracée ─────────────────────────────
 *
 * Le CP0 a mesuré : forme `{ done, note, score }` imposée par le handler, mais
 * **aucun horodatage, aucune provenance, aucune version**, un `score` de 0 à 5
 * **auto-déclaré**, et **zéro lecteur** dans l'interface.
 *
 * Ce qui change ici : `at`, `provenance` et `schemaVersion` sont ajoutés,
 * **additivement**. Les trois champs existants gardent exactement leur
 * sémantique et leurs bornes.
 *
 * Ce qui NE change PAS, et c'est délibéré : `score` reste une **auto-évaluation
 * déclarée**, et ce module ne le convertit en rien d'autre. Le CP0 de V74 avait
 * établi que ce produit souffre d'un excès de déclaratif ; la réponse n'est pas
 * de maquiller une déclaration en mesure, c'est de la nommer pour ce qu'elle
 * est. Le champ s'appelle donc `scoreDeclare`, et l'ancien `score` reste lu.
 */
export function normalizeWeeklyReview(raw, { now = null, legacy = true } = {}) {
  const r = isObj(raw) ? raw : {};
  const env = normalizeEnvelope({ ...r, grain: 'week' }, { now, legacy });
  const n = Number(r.scoreDeclare ?? r.score);
  return {
    done: typeof r.done === 'boolean' ? r.done : false,
    note: str(r.note, 4000),
    // Borne inchangée (0..5) — V75 n'invente aucun barème.
    scoreDeclare: Number.isFinite(n) ? Math.max(0, Math.min(5, n)) : null,
    at: env?.at ?? null,
    provenance: env?.provenance ?? { producer: 'legacy', method: '', note: '' },
    schemaVersion: env?.schemaVersion ?? 1,
  };
}

/**
 * ── DÉDUPLICATION GÉNÉRIQUE ──────────────────────────────────────────────
 *
 * Même règle que V74 : trier à la lecture, ne jamais supposer l'ordre
 * d'écriture. Une projection qui dépend de l'ordre d'insertion n'est pas
 * rejouable, et la rejouabilité est le critère V10 du contrat gelé.
 */
export function dedupSorted(list, keyOf, { max = 20000 } = {}) {
  if (!Array.isArray(list)) return [];
  const vus = new Set();
  const out = [];
  for (const x of list.slice(-max)) {
    if (!x) continue;
    const k = keyOf(x);
    if (vus.has(k)) continue;
    vus.add(k);
    out.push(x);
  }
  out.sort((a, b) => String(a.at).localeCompare(String(b.at)));
  return out;
}

/**
 * Inventaire déclaratif des faits du produit et de leur conformité au contrat.
 * Publié pour que la porte `v75:check` puisse le vérifier, et pour qu'un
 * lecteur sache d'un coup d'œil ce qui reste à payer.
 */
export const FAITS = [
  { nom: 'ExerciseAttempt', grain: 'exercise', provenance: true, cle: true, horodate: true, version: false, conceptId: false },
  { nom: 'RecallAttempt', grain: 'concept', provenance: true, cle: true, horodate: true, version: false, conceptId: true },
  { nom: 'Evidence', grain: 'competency', provenance: true, cle: true, horodate: true, version: false, conceptId: 'CP3' },
  { nom: 'DayAttempt', grain: 'day', provenance: true, cle: true, horodate: true, version: true, conceptId: false },
  { nom: 'WeeklyReview', grain: 'week', provenance: true, cle: true, horodate: true, version: true, conceptId: false },
  { nom: 'TransferAttempt', grain: 'challenge', provenance: true, cle: true, horodate: true, version: true, conceptId: true },
];
