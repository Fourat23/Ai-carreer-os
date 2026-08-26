import Link from 'next/link';
import { HeroFocus, HeroFact, ContextLine, PageHeader } from '@/app/ui';
import { Eye, Layers } from 'lucide-react';
import { listCapstones } from '@/lib/capstones-server';
import { getProgram } from '@/lib/program';

export const dynamic = 'force-dynamic';

// Capstones = simulations professionnelles multi-phases. Correction locale et
// DÉTERMINISTE ; les infrastructures décrites sont SIMULÉES. Réussir un capstone
// est un INDICE de raisonnement, pas une preuve de maîtrise. Aucune écriture
// automatique dans la progression.
export default function CapstonesPage() {
  const capstones = listCapstones();
  const program = getProgram();
  const skillName = new Map((program.skills ?? []).map((s: { id: string; name: string }) => [s.id, s.name]));

  const byDomain = new Map<string, typeof capstones>();
  for (const c of capstones) {
    const d = c.domain || 'Autres';
    if (!byDomain.has(d)) byDomain.set(d, []);
    byDomain.get(d)!.push(c);
  }
  const domains = [...byDomain.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const totalPhases = capstones.reduce((n, c) => n + (c.phases?.length ?? 0), 0);
  const coveredSkills = new Set(capstones.flatMap((c) => c.skills ?? [])).size;

  return (
    <>
      <ContextLine
        label="État des capstones"
        facts={[
          { k: 'Capstones', v: `${capstones.length}`, here: true },
          { k: 'Domaines', v: `${domains.length}` },
          { k: 'Phases', v: `${totalPhases}` },
          { k: 'Compétences couvertes', v: `${coveredSkills}` },
        ]}
      />
      {/* V59 · CP11 avait résolu l'absence de h1 par un titre HORS ÉCRAN : le
          plan du document était juste, mais la page restait la seule des 36
          sans titre visible à l'échelle display — ratio typographique 2,24
          contre 3,30 partout ailleurs, mesuré au CP0 de V61.
          V61 · elle reçoit le même en-tête que les autres surfaces. Le titre
          n'est plus caché : il est simplement là, comme partout. */}
      <PageHeader
        eyebrow={<>Évaluer <span className="sep">/</span> simulation professionnelle</>}
        title="Capstones"
        sub="Des simulations multi-phases, corrigées localement."
      />
      <HeroFocus
        tone="calm"
        eyebrow="Simulation professionnelle"
        title={`${capstones.length} capstone${capstones.length > 1 ? 's' : ''} sur ${domains.length} domaine${domains.length > 1 ? 's' : ''}`}
        lead="Réussir un capstone est un indice de raisonnement, pas une preuve de maîtrise."
        actions={capstones[0]
          ? <Link className="btn cta" href={`/capstones/${capstones[0].id}`}>
              Ouvrir — {capstones[0].title}
            </Link>
          : undefined}
        meta={
          <>
            <HeroFact k="Phases au total">{totalPhases}</HeroFact>
            <HeroFact k="Compétences couvertes">{coveredSkills}</HeroFact>
            <HeroFact k="Correction">locale et déterministe</HeroFact>
          </>
        }
      />

      {capstones.length === 0 ? (
        <div className="empty"><Layers size={16} strokeWidth={2} /> Aucun capstone disponible.</div>
      ) : (
        <>
          {/* V57 · CP7 — Même correction structurelle que /diagnostics, et pour
              la même cause mesurée au CP0 : douze <section> de domaine sœurs
              plafonnaient `dominance` à 0,123. Un seul bloc structurant, les
              domaines redeviennent des groupes internes, les capstones des
              LIGNES. Une ligne de catalogue n'a ni action autonome ni cycle de
              vie propre : elle n'est pas une carte (ADR-057 §5). */}
          <nav className="cat-index" aria-label="Domaines">
            <span className="cat-index-k">Domaines</span>
            <ul className="cat-index-list">
              {domains.map(([domain, list]) => (
                <li key={domain}>
                  <a href={`#dom-${slug(domain)}`}>{domain} <span className="cat-index-n">{list.length}</span></a>
                </li>
              ))}
            </ul>
          </nav>

          <section className="cat" aria-label="Catalogue des capstones">
            {domains.map(([domain, list]) => (
              <div key={domain} className="cat-group" id={`dom-${slug(domain)}`}>
                <div className="cat-group-head">
                  <h2 className="cat-group-name">{domain}</h2>
                  <span className="cat-group-n">{list.length} capstone{list.length > 1 ? 's' : ''}</span>
                </div>
                <ul className="cat-rows">
                  {list.map((c) => (
                    <li key={c.id} className="cat-row">
                      <Link href={`/capstones/${c.id}`} className="cat-row-link">
                        <span className="cat-row-body">
                          <span className="cat-row-title">{c.title}</span>
                          <span className="cat-row-sub">{c.skills.map((s) => skillName.get(s) ?? s).join(' · ')}</span>
                        </span>
                        <span className="cat-row-tags">
                          <span className="cat-tag">Difficulté {c.difficulty ?? 1}/5</span>
                          <span className="cat-tag">{c.phases.length} phases</span>
                          {c.estimatedMinutes ? <span className="cat-tag">~{c.estimatedMinutes} min</span> : null}
                        </span>
                        <span className="cat-row-n">Ouvrir →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </>
      )}
    </>
  );
}

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
