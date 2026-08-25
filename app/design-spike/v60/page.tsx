// V60 · SPIKE — index des neuf prototypes. Pas une route métier.
import Link from 'next/link';
import { spikeData } from './data';

export const dynamic = 'force-dynamic';

const DIRS = [
  { id: 'a', name: 'Mission Control', line: 'Bandes bord à bord, bloc opératoire dominant, horizon en arc.' },
  { id: 'b', name: 'Learning Workstation', line: 'Volets d’éditeur, lecture et action côte à côte, barre d’état.' },
  { id: 'c', name: 'Career Intelligence', line: 'Éditorial : contenu sur le canvas, ruptures par renversement de fond.' },
];
const SCREENS = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'day', name: 'Day — journée 80' },
  { id: 'calendar', name: 'Calendar' },
];

export default function SpikeIndex() {
  const d = spikeData();
  return (
    <main className="v60-index">
      <p className="mono u" style={{ fontSize: 11, color: 'var(--txt-4)' }}>V60 · design spike</p>
      <h1>Trois directions,<br />neuf écrans,<br />aucune migration.</h1>
      <p>
        Prototypes de comparaison. Ils ne font pas partie du produit : aucune page de
        production n’y mène, aucune action n’écrit sur disque, et supprimer
        <code className="mono"> app/design-spike/ </code> rend l’état d’avant à l’identique.
      </p>

      {DIRS.map((dir) => (
        <section key={dir.id}>
          <h2><em>{dir.id.toUpperCase()}</em> — {dir.name}</h2>
          <p className="note">{dir.line}</p>
          <div className="lk">
            {SCREENS.map((s) => (
              <Link key={s.id} href={`/design-spike/v60/${dir.id}/${s.id}`}>{s.name}</Link>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2>Données</h2>
        <p className="note">
          Tout provient des read-models existants, en lecture seule : {d.totalDays} journées,
          12 mois, {d.weeks.length} semaines, {d.skills.length} compétences, {d.hours.toLocaleString('fr-FR')} heures.
          <br /><br />
          <strong style={{ color: 'var(--txt-2)' }}>Aucune progression n’existe dans ce produit</strong> —
          <code className="mono"> data/progress.json </code> comme
          <code className="mono"> data/progress.example.json </code> comptent zéro journée enregistrée.
          Le brief interdit d’en inventer : les prototypes ne dessinent donc aucun
          remplissage de progression. Ils composent l’année à partir de ce qui est
          réellement là — difficulté, charge horaire, compétence, semaine de révision,
          jalon de projet — et déclarent l’absence là où elle compte. C’est une
          contrainte, et c’est un meilleur test : une direction lisible seulement une
          fois coloriée par la progression n’a pas de composition propre.
        </p>
      </section>
    </main>
  );
}
