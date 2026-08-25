// V60 · SPIKE — coquille des prototypes.
//
// Volontairement NUE : pas de rail, pas de marque, pas de barre supérieure.
// Le test à l'aveugle du §13 exige de juger la composition sans eux, et une
// direction qui n'a d'identité que par sa navigation n'en a pas.
//
// Ces routes ne sont pas des routes métier. Aucun lien du produit n'y mène.
import type { ReactNode } from 'react';
import './spike.css';

export const metadata = { title: 'V60 — design spike' };

export default function SpikeLayout({ children }: { children: ReactNode }) {
  return <div className="v60">{children}</div>;
}
