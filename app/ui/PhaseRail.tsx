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
    // V57 · CP10 — La phase courante est RECALCULÉE à partir des positions
    // réelles, l'observateur ne servant que de déclencheur bon marché.
    //
    // Défaut constaté en capture : après un saut de défilement (ancre, clavier,
    // restauration de position), l'ancien code restait bloqué sur « 1 / 12 » au
    // milieu d'un document de 14 000 px. Il ne lisait que les entrées
    // `isIntersecting` de l'événement ; un saut fait franchir la bande étroite
    // (-12 % / -70 %) à plusieurs titres d'un coup, sans qu'aucun ne soit
    // rapporté intersectant. Un rail bloqué sur la première phase est
    // décoratif, ce que ce motif n'a pas le droit d'être.
    //
    // Mesurer donne le même résultat quand tout va bien, et le bon résultat
    // quand on saute : la phase courante est la DERNIÈRE dont le titre est
    // passé au-dessus du repère de lecture.
    const MARK = 0.22;             // repère de lecture, en fraction de hauteur
    const recompute = () => {
      const mark = window.innerHeight * MARK;
      let current = nodes[0];
      for (const n of nodes) {
        if (n.getBoundingClientRect().top <= mark) current = n;
        else break;
      }
      if (current?.id) setActiveId(current.id);
    };
    const obs = new IntersectionObserver(recompute, { rootMargin: '-12% 0px -70% 0px', threshold: 0 });
    for (const n of nodes) obs.observe(n);
    window.addEventListener('scroll', recompute, { passive: true });
    window.addEventListener('resize', recompute, { passive: true });
    recompute();
    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', recompute);
      window.removeEventListener('resize', recompute);
    };
  }, [phases]);

  if (phases.length < 2) return null;
  const activeIdx = Math.max(0, phases.findIndex((p) => p.id === activeId));

  return (
    <nav className={`phase-rail phase-rail-${variant}`} aria-label={title}>
      {/* V57 · CP10 — L'en-tête porte le NOM de la phase courante.
          Entre 768 et 1199 px la bande compacte n'affiche que des
          pictogrammes : on ne se situe pas dans un déroulé de douze phases
          avec douze icônes. Deux tentatives d'afficher les étiquettes DANS la
          bande ont été vérifiées en capture et rejetées — douze libellés ne
          tiennent pas dans 630 px, ils se tronquaient à « CAD », « COM »,
          « OBS », et l'étiquette de la phase courante chevauchait le texte.
          L'en-tête, lui, dispose d'une ligne entière : la position y est
          lisible en toutes lettres, sans rien casser. */}
      <p className="phase-rail-head">
        <span className="phase-rail-title">{title}</span>
        <span className="phase-rail-now">
          {FAM_LABEL[phases[activeIdx]?.family] ?? ''}
          {phases[activeIdx]?.label ? <> — {phases[activeIdx].label}</> : null}
        </span>
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
