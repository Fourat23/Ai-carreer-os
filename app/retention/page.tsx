// RÉACTIVATION — la surface du Retention Engine I (V66 · CP6).
//
// /revisions répond « quelles JOURNÉES faut-il revoir, d'après ce que j'ai
// déclaré comprendre ». Cette page répond à une autre question, et c'est celle
// que le sprint V66 pose : « quelles NOTIONS suis-je capable de retrouver,
// d'après ce que j'ai réellement su restituer ».
//
// Rien n'est calculé ici. L'état, l'échéance et l'ordre viennent tous de
// `getRetentionSummary()` — le même read-model pour toutes les surfaces.

import Link from 'next/link';
import { getRetentionSummary, getRecallPrompt } from '@/lib/retention-server';
import { RETENTION_STATE_LABEL, INTERVALS, RETAINED_MIN_SPAN_DAYS } from '@/lib/retention';
import { PageHeader, ContextLine, Panel, EmptyState, Metric } from '@/app/ui';
import RecallStation from './RecallStation';

export const dynamic = 'force-dynamic';

export default function RetentionPage() {
  const now = new Date().toISOString();
  const s = getRetentionSummary(now);
  const prompts = s.queue.map(getRecallPrompt);

  // Deux grandeurs DISJOINTES, et leur somme vaut le total — sinon la page se
  // contredit (défaut trouvé au CP14 en lisant la page réelle).
  const rencontres = s.totalConcepts - s.notYetReached;
  const testes = rencontres - s.counts.nouveau;

  return (
    <>
      <ContextLine
        label="Réactivation"
        facts={[
          { k: 'Surface', v: 'Réactivation', here: true },
          { k: 'Notions du programme', v: `${s.totalConcepts}` },
          { k: 'Rencontrées', v: `${rencontres}` },
          { k: 'Mises à l’épreuve', v: `${testes}` },
          { k: 'Dues aujourd’hui', v: `${s.queue.length}` },
        ]}
      />

      <PageHeader
        eyebrow="Rétention"
        title="Réactivation"
        sub={<>
          Une notion n’est pas retenue parce qu’elle a été lue : elle l’est quand tu sais
          la retrouver <strong>sans le cours sous les yeux</strong>, à plusieurs semaines
          d’intervalle. Cette page ne mesure que ça. Elle ne peut rien conclure tant que
          tu n’as rien tenté. <Link href="/revisions">Révisions par journée</Link>.
        </>}
      />

      {s.attemptCount === 0 ? (
        <EmptyState
          title="Aucune tentative de rappel enregistrée"
          hint={
            <>
              Le produit ne sait donc <strong>rien</strong> de ce que tu retiens, et il ne
              va pas le deviner à partir des journées que tu as terminées : avoir lu une
              leçon et savoir la restituer sont deux faits différents, et seul le second
              se mesure ici.
              {' '}
              {rencontres > 0
                ? <>Tu as rencontré <strong>{rencontres}</strong> notions sur {s.totalConcepts}. Elles sont toutes à l’état « Nouveau » tant qu’aucune n’a été mise à l’épreuve.</>
                : <>Ouvre une journée pour rencontrer tes premières notions.</>}
            </>
          }
        />
      ) : null}

      <div className="ret-grid">
        <div className="ret-main">
          <Panel label={`File du jour${s.queue.length ? ` — ${s.queue.length}` : ''}`}>
            {s.queue.length === 0 ? (
              <p className="ret-note">
                {s.attemptCount === 0
                  ? 'Rien à réactiver : aucune notion n’a encore été tentée.'
                  : 'Rien n’est dû aujourd’hui. Les échéances sont calculées depuis tes tentatives réelles — revenir plus tôt n’avancerait rien.'}
              </p>
            ) : (
              <>
                <p className="ret-note">
                  Notions dues, <strong>entrelacées</strong> : deux notions de la même
                  compétence ne se suivent pas tant qu’une autre attend. Réviser six
                  notions du même domaine d’affilée donne une impression de maîtrise sans
                  jamais obliger à les distinguer.
                </p>
                <RecallStation prompts={prompts} />
              </>
            )}
          </Panel>
        </div>

        <aside className="ret-rail">
          <Panel label="État des notions">
            <dl className="ret-counts">
              {(['a_revoir', 'fragile', 'en_consolidation', 'retenu', 'nouveau'] as const).map((k) => (
                <div key={k}>
                  <dt>{RETENTION_STATE_LABEL[k]}</dt>
                  <dd>{s.counts[k]}</dd>
                </div>
              ))}
            </dl>
            {s.notYetReached > 0 && (
              <p className="ret-note">
                <strong>{s.notYetReached}</strong> notions ne sont pas encore dans le
                décompte : le programme les enseigne dans des journées que tu n’as pas
                ouvertes. Ce n’est pas un retard, c’est la suite du parcours.
              </p>
            )}
          </Panel>

          <Panel label="Comment l’état est obtenu">
            {/* La règle est ÉNONCÉE, pas cachée : un apprenant doit pouvoir
                contester un état, donc savoir ce qui le produit. Les valeurs
                viennent du modèle, elles ne sont pas recopiées à la main. */}
            <ul className="ret-rule">
              <li><strong>Nouveau</strong> — rencontré, jamais mis à l’épreuve.</li>
              <li><strong>Fragile</strong> — dernier essai raté, ou une seule journée de réussite.</li>
              <li><strong>En consolidation</strong> — plusieurs réussites, mais pas encore assez espacées.</li>
              <li><strong>Retenu</strong> — 3 réussites, à 3 dates différentes, sur au moins {RETAINED_MIN_SPAN_DAYS} jours.</li>
              <li><strong>À revoir</strong> — l’échéance est passée. Prime sur tout le reste.</li>
            </ul>
            <p className="ret-note">
              Espacement après chaque réussite consécutive :
              {' '}{INTERVALS.join(' · ')} jours. Un échec ramène à {INTERVALS[0]} jour.
              Aucun de ces états ne peut être posé à la main : il se mérite par des
              tentatives, ou il ne s’obtient pas.
            </p>
          </Panel>

          <Panel label="Ce que cette page ne mesure pas">
            <p className="ret-note">
              Elle mesure ta capacité à <strong>retrouver</strong> une notion, pas ta
              capacité à l’<strong>appliquer</strong> sous pression sur un vrai problème.
              La démonstration d’une compétence reste du ressort des exercices, des
              diagnostics et des capstones — <Link href="/skills">Compétences</Link>.
            </p>
          </Panel>
        </aside>
      </div>

      <div className="ret-metrics">
        <Metric label="Notions rencontrées" value={`${rencontres}`} sub={`sur ${s.totalConcepts} au programme`} />
        <Metric label="Mises à l’épreuve" value={`${testes}`} sub="au moins une tentative" />
        <Metric label="Tentatives enregistrées" value={`${s.attemptCount}`} sub="réussites, partielles et échecs" />
      </div>
    </>
  );
}
