import Link from 'next/link';
import { getProjectHtml, getProgram } from '@/lib/program';
import { readProgress } from '@/lib/progress-server';
import { EvidenceMark, SurfaceHead } from '@/app/ui';
import { annotateProseA11y } from '@/lib/section-family';

export const dynamic = 'force-dynamic';

// V57 · CP8 — /projects passait le test de dominance mais échouait R4 et ne
// portait qu'un hero, une barre d'onglets et un document. Elle ne disait ni
// l'état du projet, ni ses livrables, ni les compétences qu'il mobilise —
// alors que le programme contient tout cela.
//
// Le lien est RÉEL : chaque journée du curriculum porte un champ `project`.
// La page ne fabrique donc aucun avancement : elle lit les journées rattachées
// au projet sélectionné, leur statut, leurs livrables et leurs compétences.
// Quand aucune journée n'est rattachée — c'est le cas de plusieurs fiches —
// la page le dit au lieu de meubler.
//
// Motif propriétaire : EvidenceMark. Raison informationnelle — un projet se
// solde par un artefact, et EvidenceMark exprime la NATURE d'une preuve
// (jamais sa quantité ni un mérite). Chaque livrable de journée est marqué
// pour ce qu'il est : un livrable de projet.
const PROJECTS = [
  { id: '01', num: 1, name: 'TaskFlow CLI', tag: 'Fondations · mois 2' },
  { id: '02', num: 2, name: 'LivreAPI', tag: 'API + Postman · mois 3' },
  { id: '03', num: 3, name: 'BiblioApp', tag: 'Full-stack · mois 4' },
  { id: '04', num: 4, name: 'DataPulse', tag: 'Data + dashboard · mois 5' },
  { id: '05', num: 5, name: 'ChurnScope', tag: 'ML classique · mois 6' },
  { id: '06', num: 6, name: 'DocQA', tag: 'RAG évalué · mois 8-9' },
  { id: 'final', num: null, name: 'DocSense (projet final)', tag: 'Assistant documentaire · mois 11-12' },
];

type Day = {
  day: number; title: string; project: number | null;
  skillName?: string; deliverable?: string | null;
};

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const selected = p ?? '01';
  const html = getProjectHtml(selected);
  const current = PROJECTS.find((x) => x.id === selected) ?? PROJECTS[0];

  const program = getProgram();
  const progress = readProgress();
  const statusOf = (d: number) => progress.days?.[String(d)]?.status ?? 'todo';

  // Journées RÉELLEMENT rattachées au projet, via le champ `project` du
  // programme. Aucune heuristique de titre, aucun rattachement deviné.
  const days: Day[] = current.num == null
    ? []
    : (program.days as Day[]).filter((d) => d.project === current.num);
  const done = days.filter((d) => statusOf(d.day) === 'done').length;
  const skills = [...new Set(days.map((d) => d.skillName).filter(Boolean))] as string[];
  const deliverables = days.filter((d) => d.deliverable);
  const next = days.find((d) => statusOf(d.day) !== 'done') ?? null;

  return (
    <div className="proj">
      {/* ── POSITION : quel projet, où il se situe, ce qu'il prouve ─────────
          V58 · CP10 — bande d'identité partagée (famille « detail » : on
          regarde UN projet, sélectionné par la navigation locale ci-dessous). */}
      <SurfaceHead
        kind="detail"
        eyebrow={<>Portfolio <span className="sep">/</span> projet{' '}
          {PROJECTS.findIndex((x) => x.id === selected) + 1} sur {PROJECTS.length}
          <span className="sep">/</span> {current.tag}</>}
        title={current.name}
        lead={<>Un projet de portefeuille prouve quelque chose de précis à un recruteur :
          ce qu’il produit est portable, relisible et défendable en entretien.</>}
        facts={[
          { k: 'Journées rattachées', v: days.length },
          { k: 'Terminées', v: days.length ? done : '—' },
          { k: 'Compétences', v: skills.length || '—' },
        ]}
      />

      <nav className="proj-nav" aria-label="Projets">
        {PROJECTS.map((pr) => (
          <Link key={pr.id} href={`/projects?p=${pr.id}`} aria-current={selected === pr.id ? 'page' : undefined}>
            {pr.name}
          </Link>
        ))}
      </nav>

      {/* ── ÉTAT + ACTION : uniquement si le programme rattache des journées ─ */}
      {days.length > 0 ? (
        <section className="proj-state" aria-label="État du projet">
          <div className="proj-state-main">
            <div className="proj-sec-head">
              <h2 className="proj-h">Journées du programme</h2>
              <span className="proj-h-note">{done} terminée{done > 1 ? 's' : ''} sur {days.length}</span>
            </div>
            <span className="proj-bar" aria-hidden="true">
              <span className="proj-bar-fill" style={{ width: `${(done / days.length) * 100}%` }} />
            </span>
            <ul className="proj-days">
              {days.map((d) => (
                <li key={d.day} className={`proj-day s-${statusOf(d.day)}`}>
                  <Link href={`/day/${d.day}`}>
                    <span className="proj-day-n">J{d.day}</span>
                    <span className="proj-day-t">{d.title}</span>
                    <span className="proj-day-s">{statusOf(d.day) === 'done' ? 'terminée' : 'à faire'}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {skills.length > 0 && (
              <p className="proj-skills">
                <span className="proj-skills-k">Compétences mobilisées</span>
                {skills.join(' · ')}
              </p>
            )}
          </div>

          <aside className="proj-side">
            {next && (
              <div className="proj-next">
                <span className="proj-next-k">Prochaine journée</span>
                <p className="proj-next-t">Jour {next.day} — {next.title}</p>
                <Link className="btn cta" href={`/day/${next.day}`}>Ouvrir</Link>
              </div>
            )}
            {deliverables.length > 0 && (
              <div className="proj-deliv">
                <div className="proj-sec-head">
                  <h2 className="proj-h">Artefacts attendus</h2>
                  <span className="proj-h-note">{deliverables.length}</span>
                </div>
                <ul className="proj-deliv-list">
                  {deliverables.map((d) => (
                    <li key={d.day}>
                      <EvidenceMark type="project" />
                      <span className="proj-deliv-t">{d.deliverable}</span>
                      <Link href={`/day/${d.day}`} className="proj-deliv-day">jour {d.day}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </section>
      ) : (
        <section className="proj-state proj-state-void" aria-label="État du projet">
          <p className="proj-void">
            Aucune journée du programme ne porte le rattachement à ce projet. Sa fiche
            décrit ce qu’il faut produire ; l’avancement n’est donc pas suivi ici, et
            rien n’est estimé à sa place.
          </p>
        </section>
      )}

      {/* ── LA FICHE : document du curriculum, jamais mis en carte ────────── */}
      <section className="proj-doc" aria-label={`Fiche du projet ${current.name}`}>
        <div className="proj-sec-head">
          <h2 className="proj-h">Fiche projet</h2>
          <span className="proj-h-note">document du curriculum, inchangé</span>
        </div>
        {html
          ? <article className="prose reading" dangerouslySetInnerHTML={{ __html: annotateProseA11y(html) }} />
          : <p className="proj-void">Fiche projet introuvable.</p>}
      </section>
    </div>
  );
}
