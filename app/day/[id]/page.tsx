import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FlaskConical, Check, ArrowRight } from 'lucide-react';
import { getDay, getDayHtml, getSolutionHtml, getDayChecklist, getProgram } from '@/lib/program';
import { getDayProgress, getActiveTrackId, readProgress } from '@/lib/progress-server';
import { getCatalogue } from '@/lib/catalogue-server';
import { resolveTrackDays, trackNeighbors } from '@/lib/catalogue';
import { getDayExerciseIndex } from '@/lib/day-exercises-server';
import { selectDayExercises } from '@/lib/day-exercises';
import { getExercise } from '@/lib/exercises-server';
import { missionsForDay, missionProgressFor } from '@/lib/missions-server';
import { getRuntimeAdapter } from '@/lib/runtime.mjs';
import { hasLabEvidence } from '@/lib/lab-progress';
import { EMPTY_DAY_PROGRESS } from '@/lib/types';
import { stripDayLeadHtml, splitDayHtml, isDayMetaLine } from '@/lib/day-view';
import { annotateDayHtml, deriveActivities, deriveDayPhases } from '@/lib/section-family';
import { sessionView } from '@/lib/learning-engine';
import { SectionHeader, Status, PhaseRail, ContextLine } from '@/app/ui';
import DayPanel from './DayPanel';
import DayMission from './DayMission';
import DayCorrection from './DayCorrection';
import DayEvidence from './DayEvidence';

export const dynamic = 'force-dynamic';

// Libellés FR des rôles pédagogiques dérivés (ADR-013). Affichés seulement quand
// une journée porte plusieurs exercices, pour distinguer le principal des compléments.
const DAY_ROLE_LABELS: Record<string, string> = {
  principal: 'Principal', complement: 'Complément', remediation: 'Remédiation', challenge: 'Défi',
};

export default async function DayPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  // V61 · en écran étroit, un volet à la fois. Mesuré : à 375 px, l'atelier
  // déroulé faisait 21 860 px. Le sélecteur est SANS JavaScript — de vrais
  // liens sur un paramètre d'URL — donc il fonctionne au clavier et sans
  // script. En grand écran, la CSS ignore cette valeur et monte les trois
  // zones à la fois.
  const spRaw = (await searchParams)?.v;
  const vAsked = Array.isArray(spRaw) ? spRaw[0] : spRaw;
  const pane = vAsked === 'faire' || vAsked === 'plan' ? vAsked : 'lire';
  const dayNum = Number(id);
  if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 365) notFound();

  const meta = getDay(dayNum);
  const rawHtml = getDayHtml(dayNum);
  if (!meta || !rawHtml) notFound();
  const html = annotateDayHtml(stripDayLeadHtml(rawHtml));
  const activities = deriveActivities(html);
  const phases = deriveDayPhases(html);
  // V61 · les deux registres de la journée, séparés par la taxonomie que le
  // corpus porte déjà. Aucun contenu modifié : les sections changent de
  // colonne, elles ne changent pas de texte.
  const split = splitDayHtml(html);
  const solution = getSolutionHtml(dayNum);
  const checklist = getDayChecklist(dayNum);
  const progress = getDayProgress(dayNum) ?? { ...EMPTY_DAY_PROGRESS };
  // V64 · l'état de travail de la journée, DÉRIVÉ (ADR-064). Une lecture ne
  // mute jamais rien : `sessionView` est une fonction pure sur la progression
  // déjà lue, elle ne crée aucune session au passage.
  const session = sessionView(progress, activities);

  // Navigation BORNÉE au parcours actif : précédent/suivant sont les journées
  // voisines dans resolveTrackDays (jamais day±1). Si la journée est hors du
  // parcours actif (contenu partagé consultable), on retombe sur une navigation
  // linéaire du programme sans position de parcours.
  const catalogue = getCatalogue();
  const trackDays = resolveTrackDays(catalogue, getActiveTrackId());
  const nb = trackNeighbors(trackDays, dayNum);
  const prevDay = nb.inTrack ? nb.prev : (dayNum > 1 ? dayNum - 1 : null);
  const nextDay = nb.inTrack ? nb.next : (dayNum < 365 ? dayNum + 1 : null);
  const trackTotal = nb.inTrack ? nb.total : null;
  const trackPosition = nb.inTrack ? nb.position : null;

  // Exercices de code liés à ce jour (fixture, sans toucher au Markdown).
  // Sélection/ordre PURS (par difficulté puis id), statut via preuve de réussite.
  const labExercises = selectDayExercises(
    getDayExerciseIndex(),
    dayNum,
    (exId) => getExercise(exId),
    (exId) => hasLabEvidence(progress, exId),
  ).map((x) => ({ ...x, runtimeLabel: getRuntimeAdapter(x.runtime)?.label ?? x.runtime }));

  // Missions d'ingénierie reliées à ce jour (dérivé de dayRefs ; statut via progression).
  const MISSION_CAT: Record<string, string> = { 'debt-maintenance': 'Dette & maintenance', performance: 'Performance', documentation: 'Documentation', incident: 'Incident' };
  const MISSION_STATUS: Record<string, string> = { 'not-started': 'À commencer', 'in-progress': 'En cours', 'deliverables-incomplete': 'Livrables incomplets', 'ready-for-review': 'Prêt pour revue', done: 'Terminé' };
  const flatProgress = readProgress();
  const dayMissions = missionsForDay(dayNum).map((m) => {
    const st = missionProgressFor(flatProgress, m).status;
    return { id: m.id, title: m.title, category: MISSION_CAT[m.category] ?? m.category, statusLabel: MISSION_STATUS[st] ?? 'À commencer', done: st === 'done' };
  });

  // Accroche : première phrase du contenu, si le corpus en fournit une. Aucun
  // texte inventé — si elle n'existe pas, le hero n'en affiche simplement pas.
  const leadMatch = rawHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const leadRaw = leadMatch
    ? leadMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220) || null
    : null;
  // La première « phrase » du corpus est en réalité sa ligne de métadonnées,
  // sur les 365 journées. Elle est portée par la ligne de contexte ; elle
  // n'est plus promue en chapeau éditorial.
  const lead = leadRaw && !isDayMetaLine(leadRaw) ? leadRaw : null;
  const monthTitle = getProgram().months.find((m: { month: number }) => m.month === meta.month)?.title;
  // Une journée « fait faire » si elle porte au moins une activité praticable.
  // V61 · UN SEUL compte. Le bouton annonçait « Aller à la pratique (17) »
  // pendant que l'en-tête de la zone FAIRE affichait « 24 activités » : deux
  // décomptes de la même chose sur le même écran.
  const doCount = split.actCount + labExercises.length + dayMissions.length;

  return (
    <div className="day-view page-workspace">
      {/* ── ZONE 0 · LIGNE DE CONTEXTE ───────────────────────────────────
          Où suis-je, dans quoi, à quelle échelle. Rien que des faits déjà
          présents dans `program.json` et dans le catalogue. */}
      <ContextLine
        label="Position de la journée"
        facts={[
          { k: 'Journée', v: trackPosition && trackTotal ? `${trackPosition} / ${trackTotal}` : `${dayNum} / 365`, here: true },
          { k: 'Position', v: `M${meta.month} · S${meta.week}` },
          { k: 'Compétence', v: meta.skillName },
          { k: 'Difficulté', v: `${meta.difficulty} / 5` },
          { k: 'Durée', v: `${meta.hours} h` },
        ]}
        tail={monthTitle}
      />
      {/* ── ZONE 1 · MISSION ─────────────────────────────────────────────
          Le focal de la page : quelle journée, pourquoi, et par où entrer.
          Il reste HORS de l'atelier, en flux normal — c'est la seule chose
          qu'on lit avant de se mettre au travail. */}
      <DayMission
        day={dayNum}
        title={meta.title}
        lead={lead}
        skillName={meta.skillName}
        difficulty={meta.difficulty}
        hours={meta.hours}
        week={meta.week}
        month={meta.month}
        monthTitle={monthTitle}
        status={progress.status}
        prevDay={prevDay}
        nextDay={nextDay}
        trackTotal={trackTotal}
        trackPosition={trackPosition}
        actions={
          <>
            <a className="btn cta" href="#travail">
              {doCount > 0 ? `Aller à la pratique (${doCount})` : 'Aller au travail du jour'}
            </a>
            {solution && <a className="btn" href="#correction">Voir la correction</a>}
          </>
        }
      />

      {/* ── ZONE 2 · L'ATELIER ───────────────────────────────────────────
          V61 · la journée cesse d'être un article de 14 mètres et devient un
          poste de travail BORNÉ, exactement comme `/lab` et les cinq routes
          de détail technique le sont déjà (`.wb`, V58). Trois zones qui
          défilent indépendamment, dans la hauteur de la fenêtre :

            DÉROULÉ   le PhaseRail, permanent, navigable
            LIRE      les sections de lecture du corpus
            FAIRE     les sections d'action du corpus, PUIS les activités
                      réelles — exercices, missions, checklist, correction,
                      preuves. Un seul endroit où l'on produit.

          Rien n'est masqué : tout le contenu de la journée est monté, dans
          des zones à défilement. Sous 1100 px, l'atelier se dé-borne et
          redevient un flux vertical ordinaire. */}
      {/* Sélecteur de volet — visible seulement sous 1100 px. */}
      <nav className="day-panes" aria-label="Volet affiché">
        {([['lire', 'Lire', split.readCount], ['faire', 'Faire', doCount], ['plan', 'Plan', phases.length]] as const).map(([v, lab, n]) => (
          <a key={v} href={`/day/${dayNum}?v=${v}#travail`}
             className={`day-pane-b${pane === v ? ' is-on' : ''}`}
             aria-current={pane === v ? 'true' : undefined}>
            {lab}<span className="day-pane-n">{n}</span>
          </a>
        ))}
      </nav>

      <div className={`day-shop v-${pane}`} id="travail">
        <aside className="day-shop-ctx" aria-label="Déroulé de la journée">
          <PhaseRail phases={phases} variant="rail" />
        </aside>

        <section className="day-shop-read" aria-labelledby="day-read-h" tabIndex={0}>
          <header className="day-zone-head">
            <h2 id="day-read-h" className="day-zone-t">Lire</h2>
            <span className="day-zone-n">{split.readCount} sections</span>
          </header>
          <article className="prose day-read" dangerouslySetInnerHTML={{ __html: split.read }} />
        </section>

        {/* FAIRE — matière différente : autre fond, arête d'accent pleine
            hauteur, affordances propres. Le changement de geste est porté par
            la surface, pas par une étiquette. */}
        <section className="day-shop-do" aria-labelledby="day-do-h" tabIndex={0}>
          <header className="day-zone-head is-do">
            <h2 id="day-do-h" className="day-zone-t">Faire</h2>
            <span className="day-zone-n">{doCount} activités</span>
          </header>

          {labExercises.length > 0 && (
            <section className="day-lab">
              <SectionHeader label="Laboratoire" title="Exercices de code" />
              <div className="day-lab-list">
                {labExercises.map((x) => (
                  <Link key={x.id} href={`/lab/${x.id}`} className="day-lab-item">
                    <FlaskConical size={15} strokeWidth={2} />
                    <span className="day-lab-title">{x.title}</span>
                    <span className="day-lab-meta">
                      {labExercises.length > 1 && x.role && (
                        <span className={`day-lab-role role-${x.role}`}>{DAY_ROLE_LABELS[x.role] ?? x.role}</span>
                      )}
                      <span className="day-lab-runtime">{x.runtimeLabel}</span>
                      {x.difficulty ? <span className="day-lab-diff" title={`Difficulté ${x.difficulty}/5`} aria-label={`Difficulté ${x.difficulty} sur 5`}>{'●'.repeat(x.difficulty)}<span className="day-lab-diff-off">{'●'.repeat(Math.max(0, 5 - x.difficulty))}</span></span> : null}
                    </span>
                    {x.status === 'passed'
                      ? <Status tone="positive" icon={<Check size={12} />} label="Réussi" />
                      : <Status tone="neutral" label="À faire" />}
                    <ArrowRight size={14} className="day-lab-go" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {dayMissions.length > 0 && (
            <section className="day-lab day-missions">
              <SectionHeader label="Missions" title="Missions d'ingénierie" />
              <div className="day-lab-list">
                {dayMissions.map((m) => (
                  <Link key={m.id} href={`/missions/${m.id}`} className="day-lab-item">
                    <span className="day-lab-title">{m.title}</span>
                    <span className="day-lab-meta">
                      <span className="day-lab-runtime">{m.category}</span>
                    </span>
                    {m.done ? <Status tone="positive" icon={<Check size={12} />} label="Terminé" /> : <Status tone="neutral" label={m.statusLabel} />}
                    <ArrowRight size={14} className="day-lab-go" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Les sections d'ACTION du corpus. Elles étaient noyées dans
              l'article de lecture ; elles sont désormais là où l'on agit. */}
          {split.act && (
            <article className="prose day-do-prose" dangerouslySetInnerHTML={{ __html: split.act }} />
          )}

          <DayPanel day={dayNum} nextDay={nextDay} initial={progress} checklist={checklist} activities={activities} session={session} />

          {solution && (
            <div id="correction">
              <DayCorrection day={dayNum} solutionHtml={solution} isReview={!!meta.isReview} initial={progress} skillId={meta.skill} />
            </div>
          )}

          <DayEvidence day={dayNum} initial={progress.evidence ?? []} skillId={meta.skill} skillName={meta.skillName} />
        </section>
      </div>
    </div>
  );
}
