// V75 · CP9 — LES 25 DÉFIS DE TRANSFERT, ENFIN ATTEIGNABLES (dette **D10**).
//
// ── CE QUI MANQUAIT, MESURÉ AU CP0 ───────────────────────────────────────
//
//   route `app/transfer` **absente** · navigation **absente** · **0/365**
//   journées citant un défi · **0** référence dans `program.json` · type de
//   preuve **présent** (V74 · CP11).
//
// Tout existait sauf le chemin : 25 défis validés dans `data/`, un correcteur
// pur, un type de preuve. `lib/learner-memory.mjs` écrivait d'ailleurs la
// conséquence sans détour — le compteur `transfers` *« vaut 0 tant que les 25
// défis ne sont pas atteignables »*.
//
// ── CE QU'UN DÉFI EST, ET N'EST PAS ─────────────────────────────────────
//
// Un défi n'est pas un exercice plus dur. Il applique une notion **dans un
// contexte que l'apprenant n'a jamais vu**, avec un PONT conceptuel explicite
// (`bridge`). C'est la différence entre savoir refaire et savoir reconnaître.
//
// Et la réserve tient toute la page : *réussir un défi est un **indice** de
// transfert, pas une maîtrise prouvée*.
import Link from 'next/link';
import { listTransferChallenges } from '@/lib/transfer-challenges-server';
import { getProgram } from '@/lib/program';
import { getHistoryBySource } from '@/lib/learner-read-models';
import { getVueRecuperation } from '@/lib/recovery-server';
import { PageHeader, ContextLine, Panel, InlineNotice, ListRow } from '@/app/ui';

export const dynamic = 'force-dynamic';

export default function TransferPage() {
  const defis = listTransferChallenges();
  const program = getProgram();
  const nomDe = new Map((program.skills ?? []).map((s: { id: string; name: string }) => [s.id, s.name]));
  const history = getHistoryBySource('transfer-challenge');

  const tentes = Object.keys(history).length;
  const reussis = Object.values(history).filter((h) => h.passed).length;
  const t5 = defis.filter((d) => d.transferLevel === 'T5').length;

  // ── V75 · CP6 — LE MODE DÉCIDE SI LE TRANSFERT EST OPPORTUN ──
  //
  // En `RECOVERY` et `CRITICAL`, l'arbitrage suspend le transfert : le proposer
  // pendant que des prérequis sont en retard organiserait un échec de plus.
  // **La page existe quand même** — suspendre n'est pas cacher, et le brief
  // interdit d'imposer. On le DIT, et on laisse la porte ouverte.
  const recuperation = getVueRecuperation();
  const suspendu = recuperation.arbitrage.transfert === 'suspendu';

  const parNiveau = [
    ['T5', defis.filter((d) => d.transferLevel === 'T5')] as const,
    ['T4', defis.filter((d) => d.transferLevel === 'T4')] as const,
  ];

  return (
    <>
      <ContextLine
        label="Défis de transfert"
        facts={[
          { k: 'Défis', v: `${defis.length}`, here: true },
          { k: 'Changement de domaine', v: `${t5}` },
          { k: 'Tentés', v: tentes === 0 ? 'aucun' : `${tentes} / ${defis.length}` },
          { k: 'Réussis', v: tentes === 0 ? '—' : `${reussis}` },
        ]}
      />

      <PageHeader
        eyebrow={<>Évaluer <span className="sep">/</span> transfert</>}
        title="Défis de transfert"
        sub={<>
          Un défi reprend une notion que tu connais et te la présente <strong>dans un contexte
          que le cours n’a jamais montré</strong> — l’idempotence HTTP devenue un consommateur
          de file, les permissions Unix devenues des rôles IAM. C’est la différence entre
          savoir refaire et savoir <em>reconnaître</em>.
          {' '}Réussir un défi est un <strong>indice</strong> de transfert, pas une maîtrise
          prouvée : le produit n’en conclura jamais que tu sais.
        </>}
      />

      {suspendu ? (
        <InlineNotice tone="info">
          Le produit ne te propose pas de défi en ce moment : plusieurs notions dont dépend la
          suite de ton parcours sont en retard, et transposer une notion fragile organise un
          échec de plus. <strong>Rien ne t’empêche d’en ouvrir un</strong> — c’est une
          suggestion, pas une porte fermée. <Link href="/retention">Voir ce qui est en retard</Link>.
        </InlineNotice>
      ) : null}

      {tentes === 0 ? (
        <InlineNotice tone="info">
          Tu n’as tenté aucun défi. Le produit ne sait donc <strong>rien</strong> de ta capacité
          à transposer — et il ne va pas la deviner à partir de tes exercices réussis : appliquer
          une notion là où on l’a apprise et la reconnaître ailleurs sont deux faits différents.
        </InlineNotice>
      ) : null}

      {parNiveau.map(([niveau, liste]) => (
        <Panel
          key={niveau}
          label={niveau === 'T5'
            ? `Changement de domaine — ${liste.length}`
            : `Contexte voisin — ${liste.length}`}
        >
          <p className="ret-note">
            {niveau === 'T5'
              ? 'La notion est transposée dans un domaine différent de celui où elle a été apprise. Le pont conceptuel est écrit : tu peux le contester.'
              : 'Même domaine, situation nouvelle. La notion est reconnaissable, son emballage ne l’est pas.'}
          </p>
          <div className="tr-list">
            {liste.map((d) => {
              const h = history[d.id] ?? null;
              return (
                <ListRow
                  key={d.id}
                  href={`/transfer/${d.id}`}
                  title={d.title}
                  desc={d.targetContext}
                  meta={<>
                    {(d.skills ?? []).map((s) => nomDe.get(s) ?? s).join(' · ')}
                    {' · '}{d.questions.length} question{d.questions.length > 1 ? 's' : ''}
                    {/* Un défi jamais tenté n'affiche RIEN — ni « 0 », ni tiret.
                        L'absence reste l'absence (règle héritée de V65.1). */}
                    {h?.last ? <> · {h.passed ? 'réussi' : 'tenté, seuil non atteint'}</> : null}
                  </>}
                  tone={h?.passed ? 'positive' : h?.last ? 'attention' : 'neutral'}
                />
              );
            })}
          </div>
        </Panel>
      ))}
    </>
  );
}
