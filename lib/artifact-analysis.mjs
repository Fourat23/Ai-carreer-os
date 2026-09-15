// V77 · CP7 — `ArtifactAnalysis` : CE QUE QUATRE SURFACES ANALYSENT VRAIMENT.
//
// ── CE QUE LE CP0 A MESURÉ ──────────────────────────────────────────────
//
// `kubernetes`, `cloud-lab`, `cloud-foundations` et `security` **valident et
// analysent réellement** : elles acceptent un artefact, le valident contre un
// schéma, refusent `422` s'il est mal formé, puis rendent des diagnostics
// classés par sévérité et par dimension. Elles répondent `200` avec un résultat
// substantiel — et **n'écrivent pas un octet**.
//
// C'est la moitié `D7` de la dette : *« six surfaces calculent et ne gardent
// rien ».* Le CP3 en a réglé une (`terminal`, en `USAGE_ONLY`). Il en restait
// cinq ; celles-ci sont les quatre qui observent un vrai travail.
//
// ── POURQUOI `OBSERVED`, ET PAS PLUS ────────────────────────────────────
//
// L'apprenant rédige **vraiment** l'artefact : un manifeste Kubernetes, une
// topologie réseau, une architecture cloud, un scénario de sécurité. Ce n'est
// pas un choix dans une liste fermée — c'est une production. À ce titre, elle
// mérite un fait, et le contrat gelé lui donne `OBSERVED`.
//
// Mais pas davantage, et la raison est décisive :
//
//   > **Un compte de diagnostics n'est pas un verdict.**
//
// L'analyseur signale ce qu'il sait reconnaître. `0 diagnostic` veut dire
// *« rien de ce que je sais détecter n'a été détecté »* — jamais *« c'est
// juste »*. Une architecture vide déclenche peu de règles ; une architecture
// riche et correcte en déclenche parfois beaucoup, en `observation`. Traiter
// `total === 0` comme une réussite serait fabriquer un verdict à partir d'un
// silence, et récompenser le vide.
//
// Ce module ne porte donc **aucune issue** : ni `passed`, ni `score`, ni
// `reussite`. Même discipline que `UsageEvent` au CP3, pour une raison
// différente — là, il n'y avait rien à juger ; ici, il y a un vrai travail que
// le produit ne sait pas juger.
//
// ── LA GARDE QUI COMPTE LE PLUS ─────────────────────────────────────────
//
// Les quatre routes acceptent `analyze` **sans** artefact : elles retombent
// alors sur la fixture fournie par le produit. Analyser la fixture n'est pas un
// travail de l'apprenant — c'est une page qui s'affiche. Un fait n'est écrit
// que si un artefact a été RÉELLEMENT POSTÉ, et `artefactFourni` porte cette
// distinction jusque dans les données.
import { normalizeEnvelope, dedupSorted } from './event-model.mjs';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

/** Les quatre surfaces analytiques. Vocabulaire FERMÉ. */
export const SURFACES_ANALYTIQUES = Object.freeze([
  'kubernetes', 'cloud-lab', 'cloud-foundations', 'security',
]);

/** Sévérités des diagnostics, reprises telles quelles des quatre analyseurs. */
export const SEVERITES = Object.freeze(['blocking', 'risk', 'warning', 'observation']);

/** Borne dure, alignée sur les autres faits du produit. */
export const MAX_ARTIFACT_ANALYSES = 20_000;

/**
 * Champs INTERDITS sur ce fait. Exportés pour que les tests et la porte les
 * vérifient plutôt que de faire confiance au commentaire ci-dessus.
 */
export const CHAMPS_INTERDITS = Object.freeze([
  'passed', 'success', 'outcome', 'score', 'allPassed', 'validation', 'reussite',
]);

const int = (v, min, max) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
};

/**
 * ── LE FAIT ──────────────────────────────────────────────────────────────
 *
 * @param raw.surface         l'une des quatre surfaces analytiques
 * @param raw.artifactId      le scénario travaillé
 * @param raw.artefactFourni  l'apprenant a-t-il POSTÉ un artefact (sinon : la fixture)
 * @param raw.diagnostics     nombre total de diagnostics rendus
 * @param raw.parSeverite     leur répartition, telle que l'analyseur l'a produite
 * @param raw.dimensions      les dimensions touchées, telles quelles
 * @param raw.empreinte       empreinte de l'artefact soumis
 */
export function normalizeArtifactAnalysis(raw, { now = null, legacy = false } = {}) {
  const r = isObj(raw) ? raw : {};
  const env = normalizeEnvelope({ ...r, grain: 'project' }, { now, legacy });
  if (!env) return null;

  if (!SURFACES_ANALYTIQUES.includes(r.surface)) return null;
  const artifactId = str(r.artifactId, 120);
  if (!artifactId) return null;

  // ── SANS ARTEFACT DE L'APPRENANT, PAS DE FAIT ──
  //
  // C'est un refus, pas une valeur par défaut. Enregistrer l'analyse de la
  // fixture reviendrait à compter une page vue comme du travail — nommément
  // interdit, et la façon la plus facile de gonfler une couverture.
  if (r.artefactFourni !== true) return null;

  const total = int(r.diagnostics, 0, 100_000);
  if (total === null) return null;

  // Répartition par liste blanche : une sévérité inconnue n'entre pas.
  const src = isObj(r.parSeverite) ? r.parSeverite : {};
  const parSeverite = {};
  for (const s of SEVERITES) {
    const n = int(src[s], 0, 100_000);
    if (n !== null) parSeverite[s] = n;
  }

  return {
    ...env,
    grain: 'project',
    surface: r.surface,
    artifactId,
    /** Toujours `true` : le fait n'existe pas autrement. Écrit pour être lisible. */
    artefactFourni: true,
    diagnostics: total,
    parSeverite,
    dimensions: Array.isArray(r.dimensions)
      ? [...new Set(r.dimensions.filter((d) => typeof d === 'string' && d.trim()).map((d) => d.trim().slice(0, 60)))].slice(0, 20)
      : [],
    /**
     * ── DEUX CONSTANTES, ET ELLES SONT STRUCTURELLES ──
     *
     * `niveau` ne dépend ni de l'artefact ni du résultat : la surface ne sait
     * pas juger, donc elle ne jugera jamais, quel que soit ce qui est soumis.
     * `simulation` non plus : aucun cluster, aucun réseau, aucun appel cloud,
     * aucune credential réelle — les quatre routes le disent en tête de fichier.
     */
    niveau: 'OBSERVED',
    simulation: true,
    empreinte: str(r.empreinte, 500) || '∅',
    tailleArtefact: int(r.tailleArtefact, 0, 10_000_000) ?? 0,
  };
}

/**
 * ── EMPREINTE D'UN ARTEFACT ──────────────────────────────────────────────
 *
 * `empreinteReponses` (V75 · CP10) sérialise `clé=valeur` : elle convient à des
 * réponses plates, pas à un manifeste Kubernetes imbriqué, où tout deviendrait
 * `[object Object]` et où deux architectures différentes auraient la même
 * empreinte — c'est-à-dire l'inverse de ce qu'on demande à une empreinte.
 *
 * On sérialise donc en JSON à CLÉS TRIÉES — de sorte qu'un simple changement
 * d'ordre de champs ne crée pas une fausse « nouvelle version » — puis on en
 * prend une empreinte FNV-1a, déterministe et sans dépendance. Ce n'est pas une
 * empreinte cryptographique et n'a pas à l'être : elle sert à distinguer deux
 * soumissions, pas à résister à un adversaire.
 */
export function empreinteDArtefact(artefact) {
  const stable = (v) => {
    if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
    if (isObj(v)) return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;
    return JSON.stringify(v ?? null);
  };
  const texte = stable(artefact);
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i += 1) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `fnv1a-${h.toString(16).padStart(8, '0')}-${texte.length}`;
}

/**
 * CLÉ MÉTIER : surface + artefact + seconde SERVEUR + empreinte de ce qui a été
 * soumis. Reprise de V75 · CP10 : deux livraisons de la même requête font un
 * fait, deux versions différentes de l'artefact en font deux — même à la même
 * seconde, parce que ce sont deux productions.
 */
export function artifactAnalysisKey(a) {
  return `${a.surface}|${a.artifactId}|${String(a.at).slice(0, 19)}|${a.empreinte ?? '∅'}`;
}

/** Normalise et déduplique une liste persistée. Triée par date, pas par insertion. */
export function normalizeArtifactAnalyses(list) {
  const out = [];
  for (const a of Array.isArray(list) ? list : []) {
    const n = normalizeArtifactAnalysis(a, { now: null, legacy: true });
    if (n) out.push(n);
  }
  return dedupSorted(out, artifactAnalysisKey, { max: MAX_ARTIFACT_ANALYSES });
}

/** L'historique d'un artefact, reconstructible. Rien n'est jamais écrasé. */
export function historiqueDeLArtefact(list, surface, artifactId) {
  return normalizeArtifactAnalyses(list)
    .filter((a) => a.surface === surface && a.artifactId === artifactId);
}

/**
 * ── CE QU'ON A LE DROIT DE DIRE ──────────────────────────────────────────
 *
 * Des nombres et des dates. Aucun verbe de réussite, et surtout : **aucune
 * lecture de la baisse du nombre de diagnostics comme un progrès.** Passer de
 * 12 à 3 peut être une correction, ou la suppression de la moitié de
 * l'architecture. Le produit ne sait pas lequel, et il le dit.
 */
export function lectureDesAnalyses(list, surface, artifactId) {
  const h = historiqueDeLArtefact(list, surface, artifactId);
  const comptes = h.map((a) => a.diagnostics);
  return {
    surface,
    artifactId,
    soumissions: h.length,
    diagnostics: comptes,
    premier: h[0]?.at ?? null,
    dernier: h[h.length - 1]?.at ?? null,
    /** Ce fait ne vaut JAMAIS une réussite. Le champ existe pour le rappeler. */
    vautReussite: false,
    lecture: h.length === 0
      ? `Aucun artefact soumis sur « ${artifactId} ».`
      : `${h.length} artefact${h.length > 1 ? 's' : ''} soumis — diagnostics rendus : ${comptes.join(' → ')}.`
        + ' Un compte de diagnostics n’est pas un verdict : l’analyseur signale ce qu’il sait reconnaître.',
  };
}
