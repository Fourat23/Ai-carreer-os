// Vue partagée d'un playbook « Que faire dans ce cas ? » (V24 CP8). Rendu PUR d'un
// objet playbook (data/playbooks/*.json) : 15 rubriques métier, dans l'ordre
// opérationnel. Réutilisée par le navigateur de playbooks (/security) et par
// l'analyseur de scénario. Aucune donnée privée : les playbooks sont publics.
import Link from 'next/link';

export const PLAYBOOK_FIELDS: [string, string][] = [
  ['symptoms', 'Symptômes'],
  ['firstChecks', 'Premières vérifications'],
  ['containment', 'Actions immédiates (confinement)'],
  ['recommendedOrder', 'Ordre recommandé'],
  ['communication', 'Communication (qui prévenir)'],
  ['evidence', 'Preuves à conserver'],
  ['doNot', 'Pièges (à ne pas faire)'],
  ['mitigation', 'Mitigation'],
  ['correction', 'Correction'],
  ['validation', 'Validation'],
  ['delivery', 'Livraison'],
  ['monitoring', 'Surveillance'],
  ['documentation', 'Documentation'],
  ['prevention', 'Prévention'],
  ['exitCriteria', 'Critères de sortie'],
];

export type PlaybookLike = Record<string, unknown>;

export function PlaybookView({ playbook }: { playbook: PlaybookLike }) {
  const arr = (k: string): string[] => (Array.isArray(playbook[k]) ? (playbook[k] as unknown[]).map(String) : []);
  const dayRefs = Array.isArray(playbook.dayRefs) ? (playbook.dayRefs as number[]) : [];
  return (
    <div className="sec-playbook">
      {PLAYBOOK_FIELDS.map(([k, label]) => {
        const items = arr(k);
        if (!items.length) return null;
        // « Ordre recommandé » se lit comme une séquence.
        if (k === 'recommendedOrder') {
          return (
            <div key={k} className="sec-pb-block">
              <strong>{label}</strong>
              <p className="sec-pb-order">{items.join(' → ')}</p>
            </div>
          );
        }
        return (
          <div key={k} className="sec-pb-block">
            <strong>{label}</strong>
            <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        );
      })}
      {dayRefs.length > 0 && (
        <p className="muted sec-pb-days">
          Théorie liée : {dayRefs.map((d, i) => (
            <span key={d}>{i > 0 ? ' · ' : ''}<Link href={`/day/${d}`}>jour {d}</Link></span>
          ))}
        </p>
      )}
    </div>
  );
}
