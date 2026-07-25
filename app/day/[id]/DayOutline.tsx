'use client';

// Repérage dans la journée, dérivé du contenu RENDU et déjà annoté côté serveur
// (annotateDayHtml pose id/data-family/data-sec sur chaque H2). Deux variantes :
// « rail » sticky numéroté avec icône de famille et progression de lecture sur
// grand écran ; « compact » repliable sous l'en-tête sur écran étroit.
import { useEffect, useState } from 'react';
import {
  Target, BookOpen, Eye, PenLine, Boxes, MessageSquare, CheckCheck, Lightbulb,
} from 'lucide-react';

const FAM_ICON: Record<string, typeof Target> = {
  objective: Target, learn: BookOpen, observe: Eye, practice: PenLine,
  apply: Boxes, prepare: MessageSquare, verify: CheckCheck, retain: Lightbulb,
};

type Item = { id: string; label: string; family: string | null; sec: string };

export default function DayOutline({ variant }: { variant: 'rail' | 'compact' }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const heads = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('.day-view article.prose h2'),
    );
    if (!heads.length) return;
    const next: Item[] = heads.map((h) => {
      const textEl = h.querySelector('.h2-text');
      const label = (textEl?.textContent || h.textContent || '').trim();
      h.style.scrollMarginTop = '76px';
      return { id: h.id, label, family: h.dataset.family ?? null, sec: h.dataset.sec ?? '' };
    });
    setItems(next);

    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive((vis[0].target as HTMLElement).id);
      },
      { rootMargin: '-70px 0px -70% 0px', threshold: 0 },
    );
    heads.forEach((h) => obs.observe(h));

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((doc.scrollTop / max) * 100)) : 100);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { obs.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, []);

  if (items.length < 2) return null;

  const list = (
    <ul>
      {items.map((it) => {
        const Icon = it.family ? FAM_ICON[it.family] : null;
        return (
          <li key={it.id}>
            <a
              href={`#${it.id}`}
              className={active === it.id ? 'active' : ''}
              data-family={it.family ?? undefined}
            >
              <span className="ol-no">{it.sec.padStart(2, '0')}</span>
              {Icon ? <Icon className="ol-ico" size={14} strokeWidth={2} /> : <span className="ol-ico" />}
              <span className="ol-label">{it.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (variant === 'compact') {
    return (
      <details className="outline-compact">
        <summary>Sections du jour <span className="oc-count">{items.length}</span></summary>
        {list}
      </details>
    );
  }

  return (
    <nav className="outline-rail" aria-label="Sections du jour">
      <div className="outline-title">Sections</div>
      {list}
      <div className="outline-progress" aria-hidden="true">
        <div className="op-track"><span style={{ width: `${progress}%` }} /></div>
        <span className="op-label">Progression de lecture · {progress}%</span>
      </div>
    </nav>
  );
}
