'use client';

// Repérage dans la journée, dérivé du contenu RENDU (les H2), sans modifier les
// fichiers pédagogiques. Deux variantes : « rail » sticky sur grand écran (colonne
// de droite) et « compact » repliable sous l'en-tête sur écran étroit.
import { useEffect, useState } from 'react';
import { slugify } from '@/lib/day-view';

type Item = { id: string; label: string };

export default function DayOutline({ variant }: { variant: 'rail' | 'compact' }) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const heads = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('.day-view article.prose h2'),
    );
    if (!heads.length) return;
    const used = new Set<string>();
    const next: Item[] = heads.map((h) => {
      const label = (h.textContent || '').replace(/^[^\p{L}\p{N}]+/u, '').trim();
      let id = slugify(label);
      while (used.has(id)) id += '-x';
      used.add(id);
      if (!h.id) h.id = id;
      h.style.scrollMarginTop = '72px';
      return { id: h.id, label };
    });
    setItems(next);

    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive((vis[0].target as HTMLElement).id);
      },
      { rootMargin: '-64px 0px -70% 0px', threshold: 0 },
    );
    heads.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, []);

  if (items.length < 2) return null;

  const list = (
    <ul>
      {items.map((it) => (
        <li key={it.id}>
          <a href={`#${it.id}`} className={active === it.id ? 'active' : ''}>{it.label}</a>
        </li>
      ))}
    </ul>
  );

  if (variant === 'compact') {
    return (
      <details className="outline-compact">
        <summary>Sections du jour</summary>
        {list}
      </details>
    );
  }

  return (
    <nav className="outline-rail" aria-label="Sections du jour">
      <div className="outline-title">Sections</div>
      {list}
    </nav>
  );
}
