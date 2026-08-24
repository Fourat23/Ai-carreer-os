'use client';

// V56 — MOTIF PROPRIÉTAIRE : rail de phases pédagogiques.
//
// Raison informationnelle : le contenu d'une journée suit un déroulé réel
// (cadrer → comprendre → observer → pratiquer → produire → préparer → vérifier
// → réviser). Ce déroulé EXISTE déjà dans le corpus — il est dérivé de l'HTML
// annoté, jamais inventé. Avant V56 il était réduit à une ligne de puces en
// haut de page : illisible sur un document de 8 000 px, et sans notion de
// position.
//
// Le rail répond en permanence à deux questions que l'apprenant se pose au
// milieu d'une journée de 4-5 heures : « où j'en suis » et « qu'est-ce qui
// reste ». La position courante est observée dans le document réel
// (IntersectionObserver), pas déclarée.
//
// Réutilisé sur : /day/[id] et /doc/[...slug] (leçons de fond).

import { useEffect, useState } from 'react';
import {
  Target, BookOpen, Eye, PenLine, Boxes, MessageSquare, CheckCheck, Lightbulb,
} from 'lucide-react';

export type Phase = { id: string; family: string; label: string };

const FAM_ICON: Record<string, typeof Target> = {
  objective: Target, learn: BookOpen, observe: Eye, practice: PenLine,
  apply: Boxes, prepare: MessageSquare, verify: CheckCheck, retain: Lightbulb,
};
const FAM_LABEL: Record<string, string> = {
  objective: 'Cadrer', learn: 'Comprendre', observe: 'Observer', practice: 'Pratiquer',
  apply: 'Produire', prepare: 'Préparer', verify: 'Vérifier', retain: 'Réviser',
};

export function PhaseRail({
  phases, variant = 'rail', title = 'Déroulé du jour',
}: {
  phases: Phase[];
  /** `rail` = colonne latérale collante · `strip` = bande compacte (mobile). */
  variant?: 'rail' | 'strip';
  title?: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(phases[0]?.id ?? null);

  useEffect(() => {
    if (!phases.length) return;
    const nodes = phases.map((p) => document.getElementById(p.id)).filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    // La phase courante est celle dont le titre est le plus haut encore visible
    // au-dessus du tiers supérieur : c'est ce que l'œil lit réellement.
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-12% 0px -70% 0px', threshold: 0 },
    );
    for (const n of nodes) obs.observe(n);
    return () => obs.disconnect();
  }, [phases]);

  if (phases.length < 2) return null;
  const activeIdx = Math.max(0, phases.findIndex((p) => p.id === activeId));

  return (
    <nav className={`phase-rail phase-rail-${variant}`} aria-label={title}>
      <p className="phase-rail-head">
        <span className="phase-rail-title">{title}</span>
        <span className="phase-rail-pos">{activeIdx + 1} / {phases.length}</span>
      </p>
      <ol className="phase-rail-list">
        {phases.map((p, i) => {
          const Icon = FAM_ICON[p.family] ?? BookOpen;
          const state = i < activeIdx ? 'past' : i === activeIdx ? 'current' : 'next';
          return (
            <li key={p.id} className={`phase-step is-${state}`} data-family={p.family}>
              <a href={`#${p.id}`} aria-current={state === 'current' ? 'true' : undefined}>
                <span className="phase-step-mark" aria-hidden="true">
                  <Icon size={13} strokeWidth={2} />
                </span>
                <span className="phase-step-body">
                  <span className="phase-step-fam">{FAM_LABEL[p.family] ?? p.family}</span>
                  <span className="phase-step-label">{p.label}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
