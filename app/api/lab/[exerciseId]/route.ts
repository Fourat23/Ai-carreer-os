// API du laboratoire de code. GET → arborescence + méta de l'exercice.
// POST { action, files } → save | run | reset. Toute l'exécution passe par le
// gestionnaire sécurisé (CP7) : sandbox, allowlist, timeout, sortie bornée,
// aucun secret transmis. Aucun shell libre.
import { NextRequest, NextResponse } from 'next/server';
import { getExercise } from '@/lib/exercises-server';
import { resolveActiveFile } from '@/lib/exercise-files';
import { getDayExerciseIndex } from '@/lib/day-exercises-server';
import { daysForExercise } from '@/lib/day-exercises';
import { readProgress, writeProgress } from '@/lib/progress-server';
import { recordExerciseSuccess } from '@/lib/lab-progress';
import { applyCommand } from '@/lib/learning-engine';
import {
  readWorkspaceTree, writeWorkspaceFile, resetWorkspace, resetWorkspaceFile, runExercise, buildReactPreview,
  conflitsDeRevision, fichiersEditables,
} from '@/lib/workspace-server';
import { splitAttempt } from '@/lib/lab-feedback';
import { remedier } from '@/lib/remediation';
import { ressourcesDe } from '@/lib/remediation-server';
import { conceptsDeLExerciceResolu } from '@/lib/exercise-concepts-server';
import { diagnostiquer, lectureDuDiagnostic } from '@/lib/diagnostic';
import { actionsVues, provenanceDeLaReussite } from '@/lib/hint-view';
import { consigner, historiqueDe, journalDe } from '@/lib/attempt-journal-server';
import { comparerTentatives } from '@/lib/attempt-diff';

export const dynamic = 'force-dynamic';

const MAX_FILES_IN_REQUEST = 40;

function exerciseMeta(ex: { id: string; title: string; summary?: string; runtime?: string; tests: { id: string; name: string; private?: boolean }[] }) {
  return {
    id: ex.id, title: ex.title, summary: ex.summary ?? '', runtime: ex.runtime ?? 'node-js',
    // Anti-fuite : seuls les NOMS des tests publics sont exposés (un nom de test
    // privé pourrait suggérer l'attendu). Le total sert au décompte affiché.
    tests: ex.tests.filter((t) => !t.private).map((t) => ({ id: t.id, name: t.name })),
    testCount: ex.tests.length,
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params;
  const ex = getExercise(exerciseId);
  if (!ex) return NextResponse.json({ error: 'Exercice introuvable.' }, { status: 404 });
  const files = readWorkspaceTree(ex);
  const activeFile = resolveActiveFile(files, (ex as { activeFile?: string }).activeFile ?? null);
  // ── V76 · CP10 — L'HISTORIQUE EXISTAIT, PERSONNE NE LE SERVAIT ──
  //
  // Le fait `ExerciseAttempt` est persisté depuis V74 · CP2, à chaque
  // lancement, réussite comme échec. La surface, elle, tenait sa propre liste
  // dans un `useState` vidé à chaque rechargement : le produit gardait tout et
  // n'en montrait rien au-delà de la session en cours.
  const faits = ((readProgress() as { exerciseAttempts?: { exerciseId?: string }[] }).exerciseAttempts ?? [])
    .filter((a) => a?.exerciseId === ex.id);
  return NextResponse.json({
    exercise: exerciseMeta(ex), files, activeFile,
    history: historiqueDe(ex.id, faits),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ exerciseId: string }> }) {
  const { exerciseId } = await params;
  const ex = getExercise(exerciseId);
  if (!ex) return NextResponse.json({ error: 'Exercice introuvable.' }, { status: 404 });

  let body: { action?: string; files?: Record<string, string> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 }); }
  const action = String(body.action ?? '');
  const files = (body.files && typeof body.files === 'object' && !Array.isArray(body.files)) ? body.files : {};
  if (Object.keys(files).length > MAX_FILES_IN_REQUEST) {
    return NextResponse.json({ error: 'Trop de fichiers.' }, { status: 400 });
  }

  try {
    if (action === 'reset') {
      resetWorkspace(ex);
      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });
    }
    if (action === 'reset-file') {
      const path = String((body as { path?: string }).path ?? '');
      resetWorkspaceFile(ex, path);
      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });
    }
    if (action === 'compare') {
      // ── V76 · CP10 — « QU'EST-CE QUE J'AI CHANGÉ, ET QU'EST-CE QUE ÇA A
      // CHANGÉ ? » ──
      //
      // Deux clés de tentative, et rien d'autre. Pas de plage, pas de
      // « depuis », pas de restauration : `G14` interdit de construire un clone
      // de Git à partir d'un besoin qui tient en une comparaison.
      const { a, b } = body as { a?: unknown; b?: unknown };
      if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) {
        return NextResponse.json({ error: 'Deux tentatives sont nécessaires.' }, { status: 400 });
      }
      const journal = journalDe(ex.id);
      const ea = journal.find((e) => e.cle === a) ?? null;
      const eb = journal.find((e) => e.cle === b) ?? null;
      // L'ordre est imposé par les dates, pas par l'appelant : comparer « du
      // récent vers l'ancien » inverserait ajouts et suppressions et ferait
      // lire un progrès comme une régression.
      const [ancien, recent] = ea && eb && String(ea.at) > String(eb.at) ? [eb, ea] : [ea, eb];
      // Les aides lues ENTRE les deux : c'est ce qui distingue « réussi à la
      // 4ᵉ tentative » de « réussi à la 4ᵉ, après avoir lu la correction ».
      const aidesEntre = (recent?.aides ?? []).filter((x) => !(ancien?.aides ?? []).includes(x));
      return NextResponse.json({ ok: true, comparaison: comparerTentatives(ancien, recent, { aidesEntre }) });
    }
    if (action === 'preview') {
      // Preview React : compile TSX/JSX + construit le srcDoc React (aucun test,
      // aucune écriture disque, aucune donnée privée). Diagnostics de compilation.
      const r = buildReactPreview(ex, files);
      return NextResponse.json({ ok: r.ok, srcDoc: r.srcDoc ?? null, channel: r.channel ?? null, diagnostics: r.diagnostics ?? [] });
    }
    if (action === 'save') {
      // ── V76 · CP9 — UNE SAUVEGARDE PÉRIMÉE EST REFUSÉE ──
      //
      // Le CP9 a mesuré le scénario `T20` du modèle de menace : un onglet
      // laissé ouvert une heure renvoie SON état au prochain autosave, et
      // **écrase silencieusement** le travail fait entre-temps dans un autre
      // onglet. Rien ne le signalait, et rien ne permettait de le retrouver.
      //
      // Le client renvoie donc la révision sur laquelle il a travaillé. Si le
      // fichier a changé depuis, on REFUSE et on rend le contenu actuel : à
      // l'apprenant de choisir, plutôt qu'au dernier écrivain de gagner.
      //
      // Sans `revs`, le comportement reste celui d'avant — un client ancien ne
      // casse pas, il perd seulement la protection.
      const revs = (body as { revs?: Record<string, string> }).revs;
      if (revs && typeof revs === 'object') {
        const conflits = conflitsDeRevision(ex, revs);
        if (conflits.length) {
          return NextResponse.json({
            ok: false, conflit: true, conflits,
            error: 'Ce fichier a changé ailleurs depuis que tu l’as ouvert.',
          }, { status: 409 });
        }
      }
      for (const [path, content] of Object.entries(files)) writeWorkspaceFile(ex, path, String(content));
      return NextResponse.json({ ok: true, files: readWorkspaceTree(ex) });
    }
    if (action === 'run') {
      // Persiste d'abord (les fichiers autorisés) pour que l'état survive au run.
      for (const [path, content] of Object.entries(files)) writeWorkspaceFile(ex, path, String(content));
      const { attempt, stdout, timedOut, error, phase, diagnostics } = await runExercise(ex, files);
      // Anti-fuite : les tests PRIVÉS ne quittent JAMAIS le serveur en détail.
      // On n'expose que les résultats publics + un AGRÉGAT privé (total/réussis),
      // jamais leur nom, attendu, reçu, message ni durée. allPassed/passed/total
      // restent calculés sur l'ensemble (public + privé) pour la preuve.
      const privateIds = new Set(ex.tests.filter((t) => (t as { private?: boolean }).private).map((t) => t.id));
      const { publicResults, privateSummary } = splitAttempt(attempt, privateIds);
      attempt.results = publicResults;
      // ── V64 · la validation déterministe rejoint la session de journée ──
      // Le verdict `allPassed` vient de TESTS RÉELS exécutés en bac à sable :
      // c'est la validation automatique du produit, pas une note attribuée.
      //
      // Deux effets, dans cet ordre :
      //   1. la preuve + le relèvement de compétence (mécanisme V27 inchangé,
      //      idempotent par URL) ;
      //   2. pour chaque journée liée dont la SESSION EST OUVERTE, une
      //      soumission horodatée portant cette validation.
      //
      // Une journée non commencée n'est PAS démarrée d'office : on peut
      // s'entraîner au laboratoire sans ouvrir la journée. Le moteur refuserait
      // d'ailleurs la commande, et un refus n'écrit rien.
      let recorded = false;
      let sessionsUpdated = 0;
      // V74 · CP12 — la remédiation du CP7, enfin rendue à l'apprenant.
      let remediation: unknown = null;
      // V76 · CP6 — ce que le produit OBSERVE de cet échec. `null` en cas de
      // réussite ; `exploitable: false` quand le test ne permet rien d'en dire.
      let diagnostic: ReturnType<typeof lectureDuDiagnostic> = null;
      // V76 · CP7 — comment cette réussite a été obtenue. `null` tant qu'il n'y
      // a pas de réussite : une provenance sans réussite n'a pas de sens.
      let provenance: ReturnType<typeof provenanceDeLaReussite> | null = null;

      // ── V74 · CP2 — LA TENTATIVE EST UN FAIT, QU'ELLE RÉUSSISSE OU NON ──
      //
      // Le CP0 de V74 a établi que ce fichier n'écrivait RIEN quand un exercice
      // échouait : il n'existait pas de branche `else` au test ci-dessous. La
      // cause n'était pas un oubli mais un choix d'objet — le produit
      // persistait la PROJECTION (la preuve, écrite seulement en cas de
      // succès) et jetait le FAIT (la tentative). Un moteur de rétention
      // branché sur des données qui n'enregistrent jamais l'échec ne peut rien
      // mesurer.
      //
      // La tentative est donc écrite AVANT toute projection, systématiquement.
      // `correctionSeen` décide si elle pourra un jour valoir RÉCUPÉRATION
      // (condition R-b du contrat gelé) : une tentative postérieure à
      // l'ouverture de la correction reste un contact significatif, jamais un
      // rappel. En l'absence d'information, le doute joue contre le compteur.
      {
        // V76 · CP10 — une seule horloge pour le FAIT et pour son JOURNAL : la
        // clé métier les relie (`exerciseId | seconde | passed/total`), et deux
        // `new Date()` séparés par une écriture disque peuvent tomber de part et
        // d'autre d'une seconde.
        const maintenant = new Date();
        const editables = fichiersEditables(ex);
        const dayRefsAll = daysForExercise(getDayExerciseIndex(), ex.id);
        const before = readProgress();
        const joursLus = before.days as Record<string, { correctionState?: string }> | undefined;
        const correctionSeen = dayRefsAll.some((d) => {
          const st = joursLus?.[String(d)]?.correctionState;
          return st === 'viewed' || st === 'acknowledged';
        });
        const r = applyCommand(before, {
          type: 'RECORD_EXERCISE_ATTEMPT',
          exerciseId: ex.id,
          passed: attempt.passed,
          total: attempt.total,
          phase: phase === 'compile' ? 'compile' : timedOut ? 'timeout' : 'run',
          durationMs: attempt.durationMs ?? 0,
          dayRefs: dayRefsAll,
          correctionSeen,
          provenance: { producer: 'lab-runner', method: 'sandbox-tests' },
        }, { now: maintenant });
        if (r.ok) writeProgress(r.progress);

        // ── V76 · CP10 — CE QUE LE FAIT NE PORTE PAS ──
        //
        // « 3/5 » puis « 4/5 » ne dit pas LEQUEL est passé au vert, et deux
        // compteurs ne se comparent pas ligne à ligne. Le journal consigne donc
        // ce que le fait n'a pas : résultats par test PUBLIC, code soumis,
        // aides déjà lues. Le fait reste le fait — le journal ne fait jamais
        // autorité, et son écriture ne peut pas faire échouer un lancement.
        consigner(ex.id, {
          at: maintenant.toISOString(),
          passed: attempt.passed,
          total: attempt.total,
          phase: phase === 'compile' ? 'compile' : timedOut ? 'timeout' : 'run',
          durationMs: attempt.durationMs ?? 0,
          // PUBLICS uniquement : archiver les résultats privés contournerait
          // l'anti-fuite par la porte d'une fonctionnalité de confort.
          resultats: publicResults,
          fichiers: Object.fromEntries(
            Object.entries(files).filter(([p]) => editables.has(p)).map(([p, c]) => [p, String(c)]),
          ),
          aides: actionsVues((before as { hintViews?: unknown[] }).hintViews ?? [], ex.id),
        });

        // ── V74 · CP12 — QUE FAIRE APRÈS CET ÉCHEC ──
        //
        // Le CP7 avait écrit le moteur ; l'audit du CP12 a constaté qu'il
        // n'était appelé nulle part. Une échelle de remédiation que personne ne
        // voit n'aide personne.
        //
        // La règle centrale du CP7 tient toute seule ici : **la correction
        // complète est la DERNIÈRE marche**. Ce que l'apprenant reçoit au
        // premier échec est un sous-problème ou un retour au modèle mental, pas
        // la réponse — et le contrat §1.4 (R-b) explique pourquoi : une
        // tentative postérieure à l'ouverture de la correction ne vaut plus
        // récupération.
        if (!attempt.allPassed) {
          const apres = r.ok ? r.progress : before;
          const tentatives = ((apres as { exerciseAttempts?: unknown[] }).exerciseAttempts ?? []) as Parameters<typeof remedier>[0]['attempts'];
          const res = ressourcesDe(ex.id);
          // ── V76 · CP6 — LE SYMPTÔME OBSERVÉ REJOINT ENFIN L'AIDE ──
          //
          // Le CP0 avait mesuré que l'échelle d'aide montait sur le NOMBRE de
          // tentatives, jamais sur la MANIÈRE d'échouer — et que cette route
          // jetait l'information : elle ne transmettait que `{ name }` pour
          // chaque test échoué, laissant tomber `expected` et `received` que le
          // produit possédait pourtant.
          //
          // Le diagnostic est calculé sur les seuls résultats PUBLICS : en tirer
          // un d'un test privé publierait son attendu, et l'anti-fuite prime.
          diagnostic = lectureDuDiagnostic(diagnostiquer({
            resultatsPublics: publicResults,
            compilation: (diagnostics ?? []) as { message?: string; line?: number; file?: string }[],
            phase: phase === 'compile' ? 'compile' : timedOut ? 'timeout' : 'test',
            erreur: error,
          }));

          remediation = remedier({
            attempts: tentatives,
            exerciseId: ex.id,
            now: new Date().toISOString(),
            sections: res.sections,
            misconception: res.misconception,
            voisinPlusSimple: res.voisinPlusSimple,
            // Seuls les tests PUBLICS échoués sont nommés : nommer un test privé
            // révélerait l'attendu, et l'anti-fuite du produit est antérieur au
            // CP12. Un sous-problème tiré d'un test privé serait une fuite.
            testsEchoues: publicResults.filter((t) => !t.passed).map((t) => ({ name: t.name })),
            // L'échelle reçoit désormais l'OBSERVATION, pas seulement le message
            // de compilation : c'est elle qui rend l'indice spécifique au
            // symptôme plutôt qu'au compteur d'échecs.
            diagnostic: diagnostic?.exploitable
              ? diagnostic.observation
              : ((diagnostics ?? []).map((d) => (d as { message?: string }).message).filter(Boolean)[0] ?? null),
            correctionVue: correctionSeen,
            // V76 · CP7 — les marches DÉJÀ LUES sur cet exercice. Sans elles,
            // l'échelle reproposait à l'identique l'aide que l'apprenant venait
            // de lire : une échelle qui se répète n'est pas une échelle.
            dejaVues: actionsVues(
              (apres as { hintViews?: unknown[] }).hintViews ?? [],
              ex.id,
            ),
          });

          // ── V76 · CP7 — L'AIDE SERVIE EST ENREGISTRÉE ──
          //
          // Le fait est écrit AVANT d'être rendu : une aide affichée puis
          // perdue au rafraîchissement laisserait l'échelle croire qu'elle n'a
          // rien donné. Idempotent par clé métier — deux affichages du même
          // indice à la même seconde ne sont pas deux consultations.
          const marche = remediation as { action?: string; niveau?: number } | null;
          if (marche?.action) {
            const rv = applyCommand(r.ok ? r.progress : before, {
              type: 'RECORD_HINT_VIEW',
              exerciseId: ex.id,
              action: marche.action,
              niveau: marche.niveau ?? 0,
              // Servie après un échec, pas ouverte par l'apprenant.
              declenchee: 'auto',
              provenance: { producer: 'lab-runner', method: 'echelle-aide' },
            }, { now: new Date() });
            if (rv.ok) writeProgress(rv.progress);
          }
        }
      }

      if (attempt.allPassed) {
        const dayRefs = daysForExercise(getDayExerciseIndex(), ex.id);
        if (dayRefs.length) {
          // Résolu UNE fois, transmis aux DEUX producteurs de preuves : sinon
          // le second retombe sur le rattachement par journée et rend la
          // désambiguïsation inutile pour cet exercice.
          const concepts = conceptsDeLExerciceResolu(ex.id, ex.skills ?? []).concepts;
          let progress = recordExerciseSuccess(readProgress(), {
            exerciseId: ex.id, title: ex.title, skills: ex.skills ?? [], dayRefs,
            // V75 · CP3 puis CP4 — la preuve porte enfin ses CONCEPTS quand ils
            // sont connus sans ambiguïté. Le CP0 a mesuré 67 exercices
            // multi-concepts PAR CONCEPTION : la liste peut en contenir
            // plusieurs, et ce n'est pas un défaut à trancher.
            //
            // Le CP4 élargit la source : aux deux règles de déclaration
            // s'ajoutent la journée à leçon unique (R3) et l'intersection de
            // compétences canoniques (R4). Quand AUCUNE règle ne tranche, la
            // liste revient VIDE — l'exercice reste ambigu, et la preuve le dit
            // au lieu de désigner une leçon au hasard.
            conceptIds: concepts,
          });
          const checkedAt = new Date().toISOString();
          for (const d of dayRefs) {
            const r = applyCommand(progress, {
              type: 'SUBMIT',
              day: d,
              stepId: `lab-${ex.id}`,
              kind: 'exercise',
              content: `Exercice ${ex.id} — tous les tests passent.`,
              validation: {
                status: 'passed',
                kind: 'exercise-tests',
                checkedAt,
                detail: `${attempt.passed}/${attempt.total} tests`,
                score: { passed: attempt.passed, total: attempt.total },
              },
              // Même identifiant de preuve que `recordExerciseSuccess` : les
              // deux chemins convergent sur UNE preuve, jamais deux.
              evidenceId: `lab-${ex.id}`,
              evidenceTitle: `Exercice réussi : ${ex.title}`,
              evidenceUrl: `/lab/${ex.id}`,
              skills: ex.skills ?? [],
              conceptIds: concepts,
            }, { now: new Date() });
            if (r.ok) { progress = r.progress; sessionsUpdated += 1; }
          }
          writeProgress(progress);
          recorded = true;
          // ── V76 · CP7 — LA PROVENANCE DE CETTE RÉUSSITE ──
          //
          // « Réussi sans aide » et « réussi après avoir consulté la
          // correction » sont deux faits différents, et le contrat gelé (§1.12)
          // exige que la seconde le montre. Elle reste une RÉUSSITE : on décrit,
          // on ne dévalue pas, et `provenanceDeLaReussite` rend toujours
          // `reussite: true`.
          provenance = provenanceDeLaReussite(
            (progress as { hintViews?: unknown[] }).hintViews ?? [],
            ex.id,
          );
        }
      }
      // V76 · CP10 — l'historique est rendu APRÈS l'écriture : la surface n'a
      // plus à tenir sa propre liste, donc plus à la perdre au rechargement.
      const faitsApres = ((readProgress() as { exerciseAttempts?: { exerciseId?: string }[] }).exerciseAttempts ?? [])
        .filter((a) => a?.exerciseId === ex.id);
      return NextResponse.json({ ok: true, attempt, privateSummary, stdout, timedOut, error, phase: phase ?? 'test', diagnostics: diagnostics ?? [], recorded, sessionsUpdated, remediation, diagnostic, provenance, history: historiqueDe(ex.id, faitsApres) });
    }
    return NextResponse.json({ error: 'Action inconnue.' }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message ?? 'Erreur.' }, { status: 400 });
  }
}
