// V75 · CP5 — TRIAGE DE L'ARRIÉRÉ. Module PUR, déterministe, sans I/O.
//
// Contrat gelé : `docs/v75/V75-RECOVERY-CONTRACT-FROZEN.md` §1.7–1.10, §2, §5.
//
// ── LE PROBLÈME QUE CE MODULE TRAITE ─────────────────────────────────────
//
// Le CP0 l'a mesuré : un apprenant irrégulier finit avec **80 % du corpus en
// retard**, un apprenant qui échoue souvent avec **92 %**. À ce stade, « voici
// tes 106 notions en retard » n'est pas une information, c'est un mur. Le
// produit doit pouvoir dire, pour CHAQUE notion due, *ce qu'il en fait
// aujourd'hui et pourquoi*.
//
// ── CE QUE LE TRIAGE N'A PAS LE DROIT DE FAIRE ───────────────────────────
//
// Trier n'est pas soustraire. Les interdits `R1`, `R2` et `R6` du contrat
// disent la même chose sous trois angles : **aucune notion ne quitte la
// mesure**. Le module rend donc toujours `total = actif + différé + garé`, et
// un test l'exige à l'égalité stricte (`I2`).
//
// > **`PARKED` ≠ `MASTERED`.** Garer, c'est décider de ne pas planifier
// > aujourd'hui. Ce n'est ni avoir appris, ni avoir effacé.
//
// ── LA DÉCISION STRUCTURANTE DU CHECKPOINT ───────────────────────────────
//
// Le brief prévient : *« ne pas gagner en mettant 90 % dans PARKED sans
// logique. »* La parade n'est pas un plafond — un plafond se contourne — mais
// la **définition** de `PARKED` :
//
//   **On ne gare jamais une notion parce qu'elle est loin dans la file.**
//   **On la gare parce qu'une CONDITION NOMMÉE la bloque, et cette condition
//   est publiée avec sa levée.**
//
// Conséquence directe, et c'est ce qui rend la triche impossible par
// construction : `différé` signifie « pas aujourd'hui, revient demain tout
// seul », `garé` signifie « ne reviendra pas tant que *X* n'est pas repris ».
// Un moteur qui garerait la moitié de l'arriéré devrait donc produire la
// moitié autant de conditions vérifiables — et chacune est affichable.
//
// ── L'ORDRE DES RÈGLES EST LA GARANTIE ───────────────────────────────────
//
//   T1  ESSENTIELLE (le parcours en dépend sous 14 j)   → URGENT
//   T2  échec non repris                                → IMPORTANT
//   T3  un prérequis est lui-même en retard             → PARKED
//   T4  tout le reste                                   → DEFERRABLE
//
// `T1` avant `T3` : **une notion essentielle n'est jamais garable.**
// `T2` avant `T3` : **un échec ne disparaît jamais au garage** (`R4`).
// Ces deux ordres sont testés négativement ; les inverser rouvre exactement
// les deux façons de cacher la dette que le contrat interdit.
import { PLAFOND_UNITES } from './retention-scheduler.mjs';

const DAY_MS = 86_400_000;

/** Les quatre classes de triage. L'ordre est celui de la cascade. */
export const CLASSES_TRIAGE = Object.freeze(['URGENT', 'IMPORTANT', 'DEFERRABLE', 'PARKED']);

/** Les trois placements. Leur somme vaut l'arriéré total — invariant `I2`. */
export const PLACEMENTS = Object.freeze(['actif', 'differe', 'gare']);

/** Les statuts qui constituent l'arriéré. Gelés par le §2 du contrat V74. */
export const STATUTS_EN_RETARD = Object.freeze(['DUE', 'OVERDUE']);

/**
 * Capacité active par défaut : le plafond d'unités du scheduler V74.
 *
 * Ce n'est PAS un second plafond. Le triage ne re-décide pas ce que la séance
 * peut contenir — il lit la décision déjà prise au CP4 de V74. Deux plafonds
 * concurrents finiraient par diverger, et la page afficherait deux vérités.
 */
export const CAPACITE_ACTIVE_DEFAUT = PLAFOND_UNITES;

const joursEntre = (a, b) => (!a || !b ? null : Math.floor((Date.parse(b) - Date.parse(a)) / DAY_MS));

/** Échec dont l'apprenant n'est pas revenu : le signal le plus actionnable. */
function echecVivant(f) {
  return Boolean(f?.lastFailureAt && (!f.lastSuccessAt || f.lastSuccessAt < f.lastFailureAt));
}

/**
 * ── LE TRIAGE ────────────────────────────────────────────────────────────
 *
 * @param {object} o
 * @param {object[]} o.fiches        fiches du Learner Memory Model (CP2 de V74)
 * @param {(id:string)=>string|null} o.dueAtOf  échéance du scheduler (CP4 de V74)
 * @param {(f:object,dueAt:string|null,now:string)=>string} o.statutDe  `retention-priority`
 * @param {(id:string)=>boolean} o.estEssentielle  le parcours en dépend sous l'horizon
 * @param {(id:string)=>string[]} o.prerequisDe    prérequis déclarés (graphe V73)
 * @param {(id:string)=>number} o.minutesDe        minutes estimées par le scheduler
 * @param {(id:string)=>number} o.scoreDe          priorité du CP3 de V74, pour l'ORDRE
 * @param {(id:string)=>({inDays:number}|null)} [o.besoinDe]  échéance curriculaire
 * @param {number} [o.capaciteActive]  nombre d'unités que la séance prend RÉELLEMENT
 * @param {(id:string)=>string} [o.libelleDe]  titre lisible d'une notion
 * @param {string} o.now
 */
export function trierArriere({
  fiches = [],
  dueAtOf = () => null,
  statutDe = () => 'HEALTHY',
  estEssentielle = () => false,
  prerequisDe = () => [],
  minutesDe = () => 0,
  scoreDe = () => 0,
  besoinDe = () => null,
  capaciteActive = CAPACITE_ACTIVE_DEFAUT,
  // ── V75 · CP8 — LE NOM LISIBLE, INJECTÉ ──
  //
  // L'audit du CP8 a lu la page rendue : le garage y annonçait *« on reprend
  // d'abord « observability-logging » »*. C'est un identifiant de fichier, pas
  // une notion — exactement le jargon moteur que le brief interdit. Le module
  // reste PUR (il ne lit pas le corpus) : le libellé est injecté, et retombe
  // sur l'identifiant quand l'appelant n'en connaît pas.
  libelleDe = (id) => id,
  now,
} = {}) {
  // ── I1 · L'ARRIÉRÉ EST MESURÉ AVANT TOUTE DÉCISION DE PLAN ──
  //
  // Le défaut P2 du CP0 est né exactement de l'inverse : la page lisait la
  // longueur d'une file PLAFONNÉE et l'annonçait comme le total (84 réels,
  // « 8 » affichés). Ici l'arriéré est constitué d'abord, et rien de ce qui
  // suit ne peut en retirer un élément.
  const statuts = new Map();
  const echeanceDe = new Map();
  const enRetard = [];
  for (const f of fiches) {
    const dueAt = dueAtOf(f.id) ?? null;
    const st = statutDe(f, dueAt, now);
    statuts.set(f.id, st);
    echeanceDe.set(f.id, dueAt);
    if (STATUTS_EN_RETARD.includes(st)) enRetard.push(f);
  }
  const idsEnRetard = new Set(enRetard.map((f) => f.id));

  // ── T3 · LES CONDITIONS DE GARAGE, CALCULÉES AVANT LE CLASSEMENT ──
  //
  // Une notion est garable quand au moins un de ses PRÉREQUIS est lui-même en
  // retard : réviser la conséquence avant la cause fait échouer sur la cause et
  // décourage sans rien consolider. C'est la seule forme de garage que ce
  // module connaît, et elle porte toujours le nom du prérequis bloquant.
  //
  // Une dépendance MUTUELLE (A exige B, B exige A) garerait les deux et les
  // rendrait inaccessibles à jamais. On l'exclut explicitement.
  const bloqueePar = new Map();
  for (const f of enRetard) {
    const prereqs = prerequisDe(f.id) ?? [];
    const bloquants = prereqs.filter((p) => p !== f.id && idsEnRetard.has(p)
      && !(prerequisDe(p) ?? []).includes(f.id));
    if (bloquants.length) {
      bloqueePar.set(f.id, [...bloquants].sort((a, b) => scoreDe(b) - scoreDe(a) || a.localeCompare(b)));
    }
  }

  // ── LA CASCADE T1 → T4 ──
  const notions = enRetard.map((f) => {
    const statut = statuts.get(f.id);
    const besoin = besoinDe(f.id);
    const minutes = minutesDe(f.id);
    const base = { id: f.id, statut, minutes, score: scoreDe(f.id) };

    // T1 — ESSENTIELLE. Le parcours en dépend dans l'horizon gelé (§3).
    // C'est le facteur `bloquantes` de `BACKLOG_PRESSURE`, et c'est lui qui
    // déclenche l'urgence — jamais le volume (§3 du contrat, raison écrite).
    if (estEssentielle(f.id)) {
      return {
        ...base,
        classe: 'URGENT',
        raison: besoin && Number.isFinite(besoin.inDays)
          ? `la suite du parcours s'appuie dessus dans ${besoin.inDays} jour${besoin.inDays > 1 ? 's' : ''}`
          : 'la suite du parcours s’appuie dessus',
        conditionDeRetour: null,
      };
    }

    // T2 — ÉCHEC NON REPRIS. Placé AVANT le garage : un échec garé est un échec
    // qui disparaît, et c'est l'interdit R4.
    if (echecVivant(f)) {
      const j = joursEntre(f.lastFailureAt, now);
      return {
        ...base,
        classe: 'IMPORTANT',
        raison: j != null && j >= 0
          ? `ta dernière tentative n'a pas abouti il y a ${j} jour${j > 1 ? 's' : ''}, et tu n'y es pas revenu`
          : 'ta dernière tentative n’a pas abouti et tu n’y es pas revenu',
        conditionDeRetour: null,
      };
    }

    // T3 — GARÉE, parce qu'une CONDITION la bloque. Jamais parce qu'elle est
    // loin dans la file.
    const bloquants = bloqueePar.get(f.id);
    if (bloquants) {
      const nom = libelleDe(bloquants[0]) || bloquants[0];
      return {
        ...base,
        classe: 'PARKED',
        raison: `on reprend d'abord « ${nom} », dont cette notion dépend`,
        conditionDeRetour: `quand « ${nom} » sera repris`,
        bloqueePar: bloquants,
      };
    }

    // T4 — DIFFÉRABLE. En retard, mais rien dans l'horizon n'en dépend et
    // aucun échec n'est en attente. Elle revient demain, toute seule.
    return {
      ...base,
      classe: 'DEFERRABLE',
      raison: 'rien dans les deux prochaines semaines n’en dépend',
      conditionDeRetour: null,
    };
  });

  // ── SOUPAPE · NE JAMAIS TOUT GARER ──
  //
  // Si le garage absorbait l'intégralité de l'arriéré, l'apprenant n'aurait
  // plus rien à travailler et aucune condition ne pourrait se lever : le
  // produit se serait bloqué lui-même en prétendant l'aider. On dégare alors
  // tout, et on le DIT plutôt que de le corriger en silence.
  const soupape = notions.length > 0 && notions.every((n) => n.classe === 'PARKED');
  if (soupape) {
    for (const n of notions) {
      n.classe = 'DEFERRABLE';
      n.raison = 'toutes tes notions en retard dépendent les unes des autres : on repart du début';
      n.conditionDeRetour = null;
    }
  }

  // ── PLACEMENT ──
  //
  // L'ordre de service est celui des classes, puis la priorité du CP3 de V74.
  // Le triage ne recalcule aucun score : il consomme celui qui existe.
  const rang = { URGENT: 0, IMPORTANT: 1, DEFERRABLE: 2, PARKED: 3 };
  const ordonnees = [...notions].sort((a, b) => rang[a.classe] - rang[b.classe]
    || b.score - a.score || a.id.localeCompare(b.id));

  const capacite = Math.max(0, Math.trunc(capaciteActive));
  let pris = 0;
  for (const n of ordonnees) {
    if (n.classe === 'PARKED') { n.placement = 'gare'; continue; }
    if (pris < capacite) { n.placement = 'actif'; pris += 1; continue; }
    // Débordement : une notion URGENTE qui ne rentre pas dans la séance du
    // jour est DIFFÉRÉE, jamais garée. Elle reste urgente et repassera en tête
    // demain — la garer reviendrait à lui inventer une condition de blocage.
    n.placement = 'differe';
  }

  const compte = Object.fromEntries(CLASSES_TRIAGE.map((c) => [c, 0]));
  const placement = Object.fromEntries(PLACEMENTS.map((p) => [p, 0]));
  for (const n of notions) { compte[n.classe] += 1; placement[n.placement] += 1; }

  // ── `BACKLOG_PRESSURE` · CINQ FACTEURS NOMMÉS, AUCUN SCORE ──
  //
  // §2 du contrat : *« il n'existe aucun nombre unique appelé pression »*. Rien
  // ici n'agrège ces cinq valeurs, et un test vérifie qu'aucun champ agrégé
  // n'apparaît — parce qu'un tel nombre finirait affiché, et qu'un nombre
  // affiché sans unité se lit comme une note.
  const echeances = enRetard.map((f) => echeanceDe.get(f.id)).filter(Boolean).sort();
  const pression = {
    bloquantes: compte.URGENT,
    echecsNonRepris: enRetard.filter(echecVivant).length,
    volume: enRetard.length,
    minutesRequises: enRetard.reduce((s, f) => s + (minutesDe(f.id) || 0), 0),
    anciennete: echeances.length ? (joursEntre(echeances[0], now) ?? 0) : 0,
  };

  return {
    /** I1 · l'arriéré, mesuré indépendamment de ce que le plan en fait. */
    total: notions.length,
    notions: ordonnees,
    compte,
    placement,
    pression,
    /** Vrai quand la soupape a dû dégarer l'ensemble. Publié, pas masqué. */
    soupape,
    capaciteActive: capacite,
  };
}

/**
 * Les notions ESSENTIELLES : celles dont dépend une journée des `horizon`
 * prochains jours, prérequis TRANSITIFS compris.
 *
 * `ESSENTIAL` est une propriété du CURRICULUM, pas de l'apprenant (§1.7) :
 * deux apprenants au même point du parcours ont les mêmes notions
 * essentielles. La fonction ne reçoit donc aucune fiche.
 *
 * @param {object} o
 * @param {number} o.jourCourant       position dans le parcours (0 = inconnue)
 * @param {number} o.horizon           `HORIZON_ESSENTIEL`, 14 jours (§3)
 * @param {(j:number)=>string[]} o.leconsDuJour
 * @param {(id:string)=>string[]} o.prerequisDe
 * @returns {Set<string>}
 */
export function notionsEssentielles({
  jourCourant = 0, horizon = 14, leconsDuJour = () => [], prerequisDe = () => [],
} = {}) {
  // Sans position connue, on ne devine pas : un horizon posé au hasard
  // rendrait essentielles des notions prises n'importe où dans l'année.
  // L'ensemble vide est une réponse honnête — aucune notion n'est URGENTE, et
  // le triage retombe sur l'échec non repris, qui lui est toujours observable.
  if (!Number.isFinite(jourCourant) || jourCourant <= 0) return new Set();

  const aVenir = new Set();
  for (let j = jourCourant + 1; j <= jourCourant + horizon; j += 1) {
    for (const l of leconsDuJour(j) ?? []) aVenir.add(l);
  }

  // Fermeture transitive des prérequis : si la journée J+3 enseigne X et que X
  // exige Y, alors Y est exigé avant J+3. S'arrêter au premier niveau
  // manquerait les fondations, qui sont précisément ce que le profil T
  // (« reprend au j250, fondations fragiles ») a en retard.
  const essentielles = new Set();
  const pile = [...aVenir];
  while (pile.length) {
    const x = pile.pop();
    for (const p of prerequisDe(x) ?? []) {
      if (essentielles.has(p)) continue;
      essentielles.add(p);
      pile.push(p);
    }
  }
  // Une notion enseignée dans l'horizon n'est pas « essentielle en retard » :
  // le parcours va la présenter. Seuls ses PRÉREQUIS le sont.
  for (const x of aVenir) essentielles.delete(x);
  return essentielles;
}
