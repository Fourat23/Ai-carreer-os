// V60.1 · CAREER WORKSTATION — coquille des prototypes.
// Volontairement nue : ni rail produit, ni marque. Ces routes ne sont pas des
// routes métier ; aucun lien du produit n'y mène.
import type { ReactNode } from 'react';
import './cw.css';

export const metadata = { title: 'V60.1 — Career Workstation' };

export default function CwLayout({ children }: { children: ReactNode }) {
  return <div className="cw">{children}</div>;
}
