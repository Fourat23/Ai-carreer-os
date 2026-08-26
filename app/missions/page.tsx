import Link from 'next/link';
import { listMissions, missionProgressFor } from '@/lib/missions-server';
import { readProgress, getActiveTrackId } from '@/lib/progress-server';
import { SurfaceHead, Status, ListRow, ContextLine } from '@/app/ui';
import type { Tone } from '@/app/ui';

export const dynamic = 'force-dynamic';

// Statut → libellé + ton + rang d'affichage (actionnable d'abord, terminé en dernier).
const STATUS: Record<string, { label: string; tone: Tone; rank: number }> = {
  'in-progress': { label: 'En cours', tone: 'info', rank: 0 },
  'deliverables-incomplete': { label: 'Livrables incomplets', tone: 'attention', rank: 1 },
  'ready-for-review': { label: 'Prêt pour revue', tone: 'accent', rank: 2 },
  'not-started': { label: 'À commencer', tone: 'neutral', rank: 3 },
  done: { label: 'Terminé', tone: 'positive', rank: 4 },
};
const CATEGORY_LABEL: Record<string, string> = {
  'debt-maintenance': 'Dette & maintenance',
  performance: 'Performance',
  documentation: 'Documentation',
  incident: 'Incident & post-mortem',
};
// Ce que la catégorie DÉSIGNE — la nature du travail attendu, pas un slogan.
const CAT_HINT: Record<string, string> = {
  'debt-maintenance': 'Modifier un code existant sous contrainte, sans le réécrire.',
  performance: 'Mesurer d\'abord, arbitrer ensuite, prouver le gain.',
  documentation: 'Rendre lisible pour quelqu\'un d\'autre que soi.',
  incident: 'Diagnostiquer à chaud, puis écrire ce qui a réellement eu lieu.',
};

export default function MissionsPage() {
  const flat = readProgress();
  const activeTrack = getActiveTrackId();
  const missions = listMissions().filter((m) => m.status === 'published');

  // Regroupement par statut (données réelles), ordonné par rang.
  const rows = missions.map((m) => ({ m, prog: missionProgressFor(flat, m) }));
  const byStatus = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = r.prog.status;
    if (!byStatus.has(key)) byStatus.set(key, []);
    byStatus.get(key)!.push(r);
  }
  const groups = [...byStatus.entries()]
    .sort((a, b) => (STATUS[a[0]]?.rank ?? 9) - (STATUS[b[0]]?.rank ?? 9));

  // V61 · CP11 — La page était structurée par STATUT au premier niveau. Mesuré
  // à 1440 : un seul `section.ui-listgroup` de 5 156 px sur 5 594 px de page,
  // soit une dominance de 0,867 pour un plafond gelé à 0,80. La cause n'est pas
  // cosmétique : à progression nulle, 42 missions sur 42 portent le MÊME
  // statut. L'axe de tête ne distinguait donc rien — il produisait un mur.
  //
  // La CATÉGORIE — dette, performance, documentation, incident — est la
  // taxonomie réelle du corpus et la seule qui sépare ces missions quel que
  // soit l'état d'avancement. Elle passe au premier niveau ; le statut reste
  // dit deux fois, là où il informe vraiment : dans l'index de tête (combien
  // dans chaque état) et sur chaque ligne. À l'intérieur d'une catégorie,
  // l'ordre reste celui du rang de statut — l'actionnable d'abord, comme en
  // V58. Aucune donnée ajoutée, aucune donnée retirée.
  const byCategory = new Map<string, typeof rows>();
  for (const r of rows) {
    const key = r.m.category || 'autres';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(r);
  }
  const categories = [...byCategory.entries()]
    .sort((a, b) => (CATEGORY_LABEL[a[0]] ?? a[0]).localeCompare(CATEGORY_LABEL[b[0]] ?? b[0]))
    .map(([cat, list]) => [
      cat,
      [...list].sort((a, b) =>
        (STATUS[a.prog.status]?.rank ?? 9) - (STATUS[b.prog.status]?.rank ?? 9)
        || a.m.title.localeCompare(b.m.title)),
    ] as const);

  const doneCount = byStatus.get('done')?.length ?? 0;
  const activeCount = (byStatus.get('in-progress')?.length ?? 0)
    + (byStatus.get('deliverables-incomplete')?.length ?? 0)
    + (byStatus.get('ready-for-review')?.length ?? 0);
  const nextMission = rows.find((r) => r.prog.status === 'in-progress')
    ?? rows.find((r) => r.prog.status === 'not-started');

  // V58 · CP6 — Le CP0 classait /missions « intermédiaire » : 4 fonds,
  // 3 ombres. Le vrai défaut n'était pas la profondeur mais la REDONDANCE —
  // la page portait un hero, PUIS un en-tête de page répétant le même titre,
  // PUIS une rangée de pastilles répétant la répartition par statut que les
  // groupes affichent déjà juste en dessous. Trois blocs pour une information.
  // Un seul en-tête désormais, et le statut n'est dit qu'une fois : par le
  // groupe qui porte les missions.
  return (
    <>
      <ContextLine
        label="État des missions"
        facts={[
          { k: 'Missions', v: `${missions.length}` },
          { k: 'Terminées', v: `${doneCount}`, here: true },
          { k: 'En cours', v: `${activeCount}` },
        ]}
      />
    <div className="cat-view">
      <SurfaceHead
        kind="catalog"
        eyebrow={<>Pratiquer <span className="sep">/</span> missions d’ingénierie <span className="sep">/</span> parcours {activeTrack}</>}
        title={activeCount > 0
          ? `${activeCount} mission${activeCount > 1 ? 's' : ''} en cours`
          : `${missions.length} missions disponibles`}
        lead="Des situations d’ingénierie réelles — dette, performance, documentation, incident. On y analyse, diagnostique, arbitre, modifie sous contrôle : chaque mission attend des livrables, pas une réponse."
        facts={[
          { k: 'Publiées', v: missions.length },
          doneCount > 0 && { k: 'Terminées', v: doneCount },
          activeCount > 0 && { k: 'En cours', v: activeCount },
        ]}
        actions={nextMission
          ? <Link className="btn cta" href={`/missions/${nextMission.m.id}`}>
              {nextMission.prog.status === 'in-progress' ? 'Reprendre' : 'Commencer'} — {nextMission.m.title}
            </Link>
          : undefined}
      />

      {/* Le statut n'a plus de section à lui : il est dit ICI, une fois, avec
          son décompte réel, et sur chaque ligne. Un état qui ne concerne aucune
          mission n'apparaît pas — on n'affiche pas de zéro décoratif. */}
      <nav className="cat-index" aria-label="Répartition par état">
        <span className="cat-index-k">États</span>
        <ul className="cat-index-list">
          {groups.map(([status, list]) => (
            <li key={status}>
              <span className="ms-state">
                <Status tone={STATUS[status]?.tone ?? 'neutral'} label={STATUS[status]?.label ?? status} />
                <span className="cat-index-n">{list.length}</span>
              </span>
            </li>
          ))}
        </ul>
      </nav>

      {/* V59 · CP9 — le titre de section reste un `h2` réel : le plan du
          document d'un catalogue de 42 missions doit exister. Seul l'AXE
          change en V61 — catégorie plutôt que statut (voir le modèle). */}
      {categories.map(([cat, list]) => (
        <section key={cat} className="ui-listgroup" aria-labelledby={`grp-${cat}`}>
          <div className="ui-listgroup-head">
            <h2 id={`grp-${cat}`} className="ui-listgroup-h">{CATEGORY_LABEL[cat] ?? cat}</h2>
            <span className="ui-listgroup-count">{list.length} mission{list.length > 1 ? 's' : ''}</span>
            <span className="ui-listgroup-hint">{CAT_HINT[cat] ?? ''}</span>
          </div>
          <div className="ui-list">
            {list.map(({ m, prog }) => (
              <ListRow
                key={m.id}
                href={`/missions/${m.id}`}
                tone={STATUS[prog.status]?.tone}
                title={m.title}
                desc={m.description}
                meta={
                  <>
                    <span>Difficulté {m.difficulty}/5</span>
                    <span>≈ {m.estimatedHours} h</span>
                    <span>{prog.requiredDone}/{prog.requiredTotal} livrables</span>
                    <span>Jours {m.dayRefs.join(', ')}</span>
                  </>
                }
                status={<Status tone={STATUS[prog.status]?.tone ?? 'neutral'} label={STATUS[prog.status]?.label ?? prog.status} />}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
    </>
  );
}
