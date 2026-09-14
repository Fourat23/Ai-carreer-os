// V75 · CP12 — INSTRUMENTATION D'UNE VALIDATION HUMAINE. Module PUR.
//
// ── CE QUE CE MODULE NE FAIT PAS, ET C'EST LE PLUS IMPORTANT ────────────
//
// **Il n'exécute aucune étude, ne recrute aucun participant, et ne produit
// aucun résultat.** Le brief est explicite : *« Ne pas prétendre exécuter une
// étude humaine sans participants »*, et le §7 du contrat gelé déclare depuis
// le CP1 :
//
//   > `REAL_HUMAN_LEARNING_EVIDENCE = NOT YET MEASURED` — inchangé depuis V72,
//   > et **V75 ne le changera pas**.
//
// Ce que ce module fait : **rendre la mesure possible**. Il définit les étapes
// d'un protocole, les faits qu'il faudrait enregistrer, et — tout aussi
// important — **ceux qu'il ne faut pas**.
//
// ── POURQUOI UN PROTOCOLE, ET PAS SIMPLEMENT « PLUS DE TÉLÉMÉTRIE » ─────
//
// Le produit sait déjà enregistrer des tentatives de rappel, d'exercice et de
// transfert. Ce qu'il ne sait pas, c'est **isoler l'effet d'un apprentissage** :
// sans mesure AVANT, un rappel réussi peut signifier « j'ai appris » ou « je le
// savais déjà ». Sans DÉLAI, il peut signifier « c'est encore en mémoire de
// travail ». Sans TRANSFERT, il peut signifier « j'ai retenu la forme de la
// question ».
//
// Les sept étapes existent pour lever ces trois ambiguïtés, et rien d'autre.
//
// ── LA RÈGLE DE COLLECTE ────────────────────────────────────────────────
//
// **Minimum utile, et opt-in.** Un produit d'apprentissage personnel n'a aucune
// raison de construire une analytique de SaaS. Ce module publie donc aussi
// `NON_COLLECTE` : ce que le protocole **refuse** d'enregistrer, écrit noir sur
// blanc pour pouvoir être vérifié.

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');
const iso = (v) => (typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : null);

/**
 * ── LES SEPT ÉTAPES ──────────────────────────────────────────────────────
 *
 * L'ordre est le protocole. Chacune répond à une ambiguïté précise, et aucune
 * n'est décorative.
 */
export const ETAPES = Object.freeze([
  'PRETEST',
  'LEARNING',
  'IMMEDIATE_RETRIEVAL',
  'DELAY',
  'DELAYED_RETRIEVAL',
  'TRANSFER',
  'CONFUSION_REPORT',
]);
const ETAPE_SET = new Set(ETAPES);

/** Ce que chaque étape sert à lever comme ambiguïté. Publié, pas supposé. */
export const RAISON_DE_L_ETAPE = Object.freeze({
  PRETEST: 'sans mesure AVANT, une réussite peut signifier « j’ai appris » ou « je le savais déjà »',
  LEARNING: 'la séance elle-même : ce qui a été lu, tenté, corrigé',
  IMMEDIATE_RETRIEVAL: 'ce qui est restituable tout de suite — plafond haut, valeur faible',
  DELAY: 'le délai est la variable : sans lui, on mesure la mémoire de travail',
  DELAYED_RETRIEVAL: 'ce qui reste après le délai. C’est la seule mesure qui intéresse',
  TRANSFER: 'sans transfert, une réussite peut signifier « j’ai retenu la forme de la question »',
  CONFUSION_REPORT: 'ce que l’apprenant DIT ne pas comprendre — déclaratif, et nommé comme tel',
});

/** Issues d'une étape. Vocabulaire fermé, aligné sur le contrat du CP2. */
export const ISSUES = Object.freeze(['success', 'partial', 'failure', 'skipped']);
const ISSUE_SET = new Set(ISSUES);

/**
 * ── DÉLAI MINIMAL ENTRE LES DEUX RAPPELS ─────────────────────────────────
 *
 * **Déclaré, pas mesuré.** Vingt-quatre heures parce qu'un rappel le même jour
 * ne distingue pas la mémoire durable de la mémoire de travail — c'est la
 * raison d'être de l'étape `DELAY`. Aucune donnée réelle ne permet de calibrer
 * ce seuil, et le CP13 ne le recalibrera pas.
 */
export const DELAI_MINIMAL_H = 24;

/**
 * ── CE QUI N'EST PAS ENREGISTRÉ ──────────────────────────────────────────
 *
 * Écrit pour être **vérifiable**, pas pour rassurer. Une porte peut le lire.
 */
export const NON_COLLECTE = Object.freeze([
  'aucune frappe, aucun mouvement de souris, aucun défilement',
  'aucune durée de lecture estimée à partir du temps passé sur une page',
  'aucun identifiant de machine, de navigateur, de réseau ou de localisation',
  'aucune comparaison entre apprenants, aucun percentile, aucun classement',
  'aucun envoi vers un tiers : les faits restent dans le fichier de progression local',
  'aucune inférence de niveau, de vitesse d’apprentissage ou de potentiel',
]);

/**
 * ── UN ÉVÉNEMENT D'ÉTUDE ─────────────────────────────────────────────────
 *
 * Même contrat que les six autres faits du produit (CP2) : horloge serveur,
 * provenance obligatoire, vocabulaire fermé, version de schéma.
 *
 * @param raw.studySessionId  la session d'étude — opt-in, révocable
 * @param raw.stage           l'une des sept étapes
 * @param raw.conceptIds      **cardinalité réelle**, comme partout ailleurs
 * @param raw.outcome         issue observée, ou `skipped`
 * @param raw.durationMs      **uniquement si réellement mesurable** — voir plus bas
 * @param raw.helpConsulted   la correction a-t-elle été ouverte AVANT la réponse
 */
export function normalizeStudyEvent(raw, { now = null } = {}) {
  const r = isObj(raw) ? raw : {};
  const at = iso(r.at) ?? iso(now);
  if (!at) return null;

  const studySessionId = str(r.studySessionId, 120);
  if (!studySessionId) return null;
  if (!ETAPE_SET.has(r.stage)) return null;

  const producer = str(r.provenance?.producer, 60);
  if (!producer) return null;

  // ── LA DURÉE : MESURÉE OU ABSENTE, JAMAIS ESTIMÉE ──
  //
  // Le brief dit « duration si réellement mesurable ». Une durée déduite du
  // temps passé sur une page mesure surtout les onglets laissés ouverts. On
  // n'accepte donc qu'une durée bornée par le protocole lui-même, et on la
  // laisse à `null` sinon — `null` étant une réponse, pas un trou.
  const d = Number(r.durationMs);
  const durationMs = Number.isFinite(d) && d > 0 && d <= 4 * 3600 * 1000 ? Math.round(d) : null;

  return {
    at,
    studySessionId,
    stage: r.stage,
    conceptIds: Array.isArray(r.conceptIds)
      ? [...new Set(r.conceptIds.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, 120)))].slice(0, 12)
      : [],
    outcome: ISSUE_SET.has(r.outcome) ? r.outcome : 'skipped',
    durationMs,
    /** La correction a-t-elle été ouverte AVANT la réponse (règle R-b de V74). */
    helpConsulted: r.helpConsulted === true,
    /** Texte libre de l'apprenant, pour `CONFUSION_REPORT`. Déclaratif. */
    note: str(r.note, 2000),
    provenance: { producer, method: str(r.provenance?.method, 80) },
    schemaVersion: 2,
  };
}

/** Clé métier : session + étape + seconde + concepts. */
export function studyEventKey(e) {
  return `${e.studySessionId}|${e.stage}|${String(e.at).slice(0, 19)}|${(e.conceptIds ?? []).join(',')}`;
}

/**
 * ── OÙ EN EST UNE SESSION D'ÉTUDE ────────────────────────────────────────
 *
 * Projection PURE : l'état d'une session se déduit de ses événements, il n'est
 * jamais stocké. Même règle que le mode de récupération au CP6 — un état
 * persisté survit à la situation qui l'a produit.
 */
export function etatDeLEtude(events = [], { now = null } = {}) {
  const faits = (Array.isArray(events) ? events : [])
    .map((e) => normalizeStudyEvent(e, { now }))
    .filter(Boolean)
    .sort((a, b) => a.at.localeCompare(b.at));

  const parEtape = new Map(ETAPES.map((s) => [s, faits.filter((f) => f.stage === s)]));
  const faite = (s) => parEtape.get(s).length > 0;

  // Le délai est la seule condition TEMPORELLE du protocole, et elle se vérifie
  // sur les faits — pas sur une déclaration.
  const derniereImmediate = parEtape.get('IMMEDIATE_RETRIEVAL').at(-1) ?? null;
  const premiereDifferee = parEtape.get('DELAYED_RETRIEVAL')[0] ?? null;
  const delaiH = derniereImmediate && premiereDifferee
    ? Math.round((Date.parse(premiereDifferee.at) - Date.parse(derniereImmediate.at)) / 3600_000)
    : null;

  const prochaine = ETAPES.find((s) => !faite(s)) ?? null;

  return {
    total: faits.length,
    etapes: Object.fromEntries(ETAPES.map((s) => [s, parEtape.get(s).length])),
    prochaine,
    complete: ETAPES.every(faite),
    delaiH,
    /**
     * Le délai est-il suffisant pour que le rappel différé veuille dire quelque
     * chose ? `null` tant que les deux rappels n'ont pas eu lieu.
     */
    delaiSuffisant: delaiH == null ? null : delaiH >= DELAI_MINIMAL_H,
    /**
     * **Toujours `false`.** Une étude instrumentée n'est pas une étude menée :
     * il n'y a ni participant, ni protocole exécuté, ni résultat. Ce champ
     * existe pour que personne n'ait à le déduire.
     */
    conclusionPossible: false,
  };
}

/**
 * Ce qu'on peut dire d'une session, et ce qu'on ne peut pas. Publié pour que
 * la surface n'ait pas à le réinventer — et pour qu'un test puisse le vérifier.
 */
export function lectureDe(etat) {
  if (!etat || etat.total === 0) {
    return 'Aucune donnée d’étude. Le protocole est décrit, il n’a pas été exécuté.';
  }
  if (!etat.complete) {
    return `Protocole entamé, étape suivante : ${etat.prochaine}. Rien ne peut en être conclu tant qu’il n’est pas complet.`;
  }
  if (etat.delaiSuffisant === false) {
    return `Le rappel différé a eu lieu ${etat.delaiH} h après l’immédiat, soit moins que les ${DELAI_MINIMAL_H} h du protocole : il mesure surtout la mémoire de travail.`;
  }
  return 'Protocole complet pour cette session. Une session n’est pas une étude : aucune conclusion sur l’apprentissage ne peut en être tirée.';
}
