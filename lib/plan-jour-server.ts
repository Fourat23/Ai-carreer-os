// V74 · CP12 — LE READ-MODEL DU PLAN DU JOUR.
//
// ── POURQUOI CE FICHIER EXISTE ───────────────────────────────────────────
//
// L'audit du CP12 a établi le fait qui commande ce checkpoint : **aucun des
// six modules écrits entre le CP2 et le CP11 n'était atteignable depuis le
// produit.** `retention-priority`, `retention-scheduler`, `retrieval-task`,
// `daily-plan`, `learner-memory` : zéro référence dans `app/`, zéro read-model.
//
// Le critère BLOQUANT **B12** du contrat gelé dit exactement cela : *« READY
// est interdit si le scheduler n'est pas réellement utilisé par le produit. »*
// Un moteur que personne ne peut voir n'a aucune valeur pédagogique, quelle que
// soit la qualité de ses tests.
//
// Ce module est la seule couche qui manquait : il fait l'I/O que les modules
// purs refusent, assemble la chaîne dans l'ordre du contrat, et rend une
// structure que la page affiche sans recalculer quoi que ce soit.
//
//   faits persistés → learner-memory (CP2) → priorité (CP3) → scheduler (CP4)
//                   → tâche (CP5) → budget de journée (CP10)
//
// ── CE QU'IL NE FAIT PAS ─────────────────────────────────────────────────
//
// Aucune décision. Aucun seuil. Aucune échelle. Il ne fait qu'appeler, dans
// l'ordre, des modules qui décident déjà — c'est la règle « une seule source de
// vérité » héritée de V65, et c'est ce qui empêche cette couche de devenir un
// sixième moteur.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { readProgress } from './progress-server';
import { getMemoryContext } from './learner-memory-server';
import { getConceptCatalogue } from './retention-server';
import { projectLearnerMemory } from './learner-memory';
import { planifier, echeanceDe } from './retention-scheduler';
import { comptesParStatut } from './retention-priority';
import { planDuJour, BUDGET_JOURNEE } from './daily-plan';
import { tachePour } from './retrieval-task';
import { availableFormats, projectRecall, normalizeAttempts } from './retention';

const ROOT = process.cwd();
const pad3 = (n: number) => String(n).padStart(3, '0');

export interface UniteDuPlan {
  id: string;
  titre: string;
  statut: string;
  format: string;
  formatLabel: string;
  /** Consigne issue d'un archétype RÉEL du CP5, ou de la forme V66 à défaut. */
  consigne: string;
  /** Section de la leçon où vérifier APRÈS avoir tenté. */
  verifier: string | null;
  minutes: number;
  /** Phrase explicable du CP3 — au plus deux facteurs cités (critère B10). */
  pourquoi: string;
  journees: number[];
}

export interface PlanDuJour {
  /** `null` quand aucune notion n'a jamais été rencontrée. */
  vide: boolean;
  minutesAccordees: number;
  minutesPlanifiees: number;
  motifBudget: string;
  chargeJour: number | null;
  budgetJournee: number;
  depassement: number;
  unites: UniteDuPlan[];
  differes: { titre: string; motif: string }[];
  arriere: number;
  signal: { niveau: string; message: string | null; proposition: string | null };
  /** Notions sues mais jamais employées ailleurs (signal silencieux du CP11). */
  jamaisTransferees: number;
}

let chargeParJour: Map<number, number> | null = null;

/**
 * Charge de curriculum par journée, lue dans l'artefact publié de V73. Absente,
 * on rend `null` plutôt que zéro : le CP10 distingue « journée inconnue »
 * (budget nominal) de « journée pleine » (budget nul), et les confondre serait
 * le contournement G9.
 */
function getChargeParJour(): Map<number, number> {
  if (chargeParJour) return chargeParJour;
  chargeParJour = new Map();
  const p = join(ROOT, 'docs', 'v73', 'charge-365.json');
  if (existsSync(p)) {
    const j = JSON.parse(readFileSync(p, 'utf8')) as { jours?: { j: number; haut: number }[] };
    for (const d of j.jours ?? []) chargeParJour.set(d.j, d.haut);
  }
  return chargeParJour;
}

let titresParLecon: Map<string, string[]> | null = null;
function getTitres(): Map<string, string[]> {
  if (titresParLecon) return titresParLecon;
  titresParLecon = new Map();
  const { concepts } = getConceptCatalogue();
  for (const c of concepts) {
    const f = join(ROOT, 'curriculum', 'lessons', `${c.id}.md`);
    titresParLecon.set(c.id, existsSync(f)
      ? [...readFileSync(f, 'utf8').matchAll(/^## +(.+)$/gm)].map((m) => m[1]) : []);
  }
  return titresParLecon;
}

/**
 * Le plan du jour, prêt à afficher.
 *
 * @param now        horloge injectée (jamais lue ici)
 * @param jourCourant position de l'apprenant dans le parcours, ou `null`
 */
export function getPlanDuJour(now: string = new Date().toISOString(), jourCourant: number | null = null): PlanDuJour {
  const progress = readProgress() as unknown as {
    days?: Record<string, unknown>; recallAttempts?: unknown[];
    exerciseAttempts?: unknown[]; evidence?: unknown[];
  };
  const ctx = getMemoryContext();

  const projection = projectLearnerMemory({
    facts: {
      days: progress.days ?? {},
      recallAttempts: progress.recallAttempts ?? [],
      exerciseAttempts: progress.exerciseAttempts ?? [],
      evidence: progress.evidence ?? [],
    },
    context: { ...ctx, startDate: null },
    now,
  });

  // Une notion jamais rencontrée n'est pas réactivable : proposer un rappel
  // dessus serait inventer un contact (G1).
  const fiches = projection.concepts.filter((f) => f.firstExposureAt);

  const titresDe = getTitres();
  const { concepts } = getConceptCatalogue();
  const titreDe = new Map(concepts.map((c) => [c.id, c.title]));
  const formatsDe = new Map(concepts.map((c) => [c.id, c.formats]));
  const joursDe = new Map(Object.entries(ctx.conceptDays));

  const attemptsParConcept = new Map<string, unknown[]>();
  for (const a of (progress.recallAttempts ?? []) as { conceptId?: string }[]) {
    if (!a?.conceptId) continue;
    if (!attemptsParConcept.has(a.conceptId)) attemptsParConcept.set(a.conceptId, []);
    attemptsParConcept.get(a.conceptId)!.push(a);
  }

  const charge = jourCourant != null ? getChargeParJour().get(jourCourant) ?? null : null;

  const compte = comptesParStatut(fiches, {
    dueAtOf: (id: string) => echeanceDe(fiches.find((f) => f.id === id))?.dueAt ?? null,
    now,
  });
  const arriere = (compte.DUE ?? 0) + (compte.OVERDUE ?? 0);

  const plan = planDuJour({
    fiches,
    chargeHaut: charge,
    arriere,
    // La TENDANCE demanderait un historique d'arriéré que rien ne persiste.
    // On ne la devine pas : sans elle, le signal reste en « vigilance » et ne
    // propose pas de ralentir. Inventer une tendance serait fabriquer un fait.
    tendance: null,
    now,
    planifierAvec: planifier,
    optionsScheduler: {
      formatsOf: (id: string) => formatsDe.get(id) ?? [],
      recallOf: (id: string) => projectRecall(id, normalizeAttempts(attemptsParConcept.get(id) ?? [])),
    },
  });

  const unites: UniteDuPlan[] = plan.seance.items.map((it) => {
    const id = it.id;
    // L'archétype du CP5 est PRÉFÉRÉ : il cite une section réelle de la leçon.
    // À défaut, la consigne générique de la forme V66 — jamais rien d'inventé.
    const tache = tachePour(it.format, titresDe.get(id) ?? [], false);
    return {
      id,
      titre: titreDe.get(id) ?? id,
      statut: it.statut,
      format: it.format,
      formatLabel: it.formatLabel,
      consigne: tache?.consigne ?? it.prompt ?? '',
      verifier: tache?.verifier ?? null,
      minutes: it.minutes,
      pourquoi: it.pourquoi,
      journees: (joursDe.get(id) ?? []).slice(0, 3),
    };
  });

  return {
    vide: fiches.length === 0,
    minutesAccordees: plan.reactivation.minutesAccordees,
    minutesPlanifiees: plan.seance.minutesPlanifiees,
    motifBudget: plan.reactivation.motif,
    chargeJour: plan.charge.curriculumHaut,
    budgetJournee: BUDGET_JOURNEE.haut,
    depassement: plan.charge.depassement,
    unites,
    differes: plan.seance.differes.slice(0, 5).map((d) => ({
      titre: titreDe.get(d.id) ?? d.id,
      motif: d.motif,
    })),
    arriere,
    signal: plan.signal,
    jamaisTransferees: fiches.filter((f) => f.jamaisTransfere).length,
  };
}

export { pad3 };
