'use client';

// Palette de commandes / recherche globale (Ctrl+K, Cmd+K, ou événement
// « open-command-palette »). Index local chargé à la première ouverture.
// Navigation clavier, focus piégé, résultats groupés, état sans résultat.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CornerDownLeft } from 'lucide-react';
import { search, type SearchItem } from '@/lib/search';

const TYPE_LABEL: Record<string, string> = {
  command: 'Commandes', day: 'Journées', week: 'Semaines', month: 'Mois',
  skill: 'Compétences', project: 'Projets', lesson: 'Leçons', page: 'Pages',
};

function groupKey(it: SearchItem) {
  return it.id.startsWith('jump:') ? 'Accès direct' : (TYPE_LABEL[it.type] ?? 'Autres');
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>
  );
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchItem[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Chargement paresseux de l'index (une fois).
  const loadIndex = useCallback(async () => {
    if (items.length) return;
    try {
      const res = await fetch('/api/search-index');
      const data = await res.json();
      setItems(data.items ?? []);
    } catch { /* recherche indisponible : la palette reste ouvrable, vide */ }
  }, [items.length]);

  const close = useCallback(() => { setOpen(false); setQuery(''); setActive(0); }, []);
  const show = useCallback(() => { setOpen(true); loadIndex(); }, [loadIndex]);

  // Raccourci global + événement depuis le shell.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((o) => !o); loadIndex(); }
    }
    function onOpen() { show(); }
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-command-palette', onOpen); };
  }, [loadIndex, show]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 20); }, [open]);

  const results = useMemo(() => search(items, query, 30), [items, query]);
  useEffect(() => { setActive(0); }, [query]);

  const go = useCallback((it?: SearchItem) => {
    const target = it ?? results[active];
    if (!target) return;
    close();
    router.push(target.href);
  }, [results, active, router, close]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(); }
    else if (e.key === 'Tab') { e.preventDefault(); /* focus piégé sur l'input */ }
  }

  // Fait défiler l'élément actif dans la vue.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  let lastGroup = '';
  return (
    <div className="cmdk-overlay" onClick={close}>
      <div
        className="cmdk" role="dialog" aria-modal="true" aria-label="Recherche et commandes"
        onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown}
      >
        <div className="cmdk-input">
          <Search size={17} strokeWidth={2} aria-hidden="true" />
          <input
            ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une journée, une compétence… ou « jour 241 »"
            aria-label="Rechercher" aria-controls="cmdk-list" role="combobox" aria-expanded="true"
            autoComplete="off" spellCheck={false}
          />
          <kbd className="cmdk-esc">Échap</kbd>
        </div>

        <div className="cmdk-list" id="cmdk-list" role="listbox" ref={listRef}>
          {results.length === 0 ? (
            <div className="cmdk-empty">Aucun résultat pour « {query} ».</div>
          ) : results.map((it, i) => {
            const g = groupKey(it);
            const header = g !== lastGroup ? (lastGroup = g) : null;
            return (
              <div key={it.id}>
                {header && <div className="cmdk-group">{header}</div>}
                <button
                  className="cmdk-item" role="option" aria-selected={i === active}
                  data-active={i === active} onMouseMove={() => setActive(i)} onClick={() => go(it)}
                >
                  <span className="cmdk-title"><Highlight text={it.title} q={query} /></span>
                  {it.subtitle && <span className="cmdk-sub">{it.subtitle}</span>}
                  {i === active && <CornerDownLeft className="cmdk-enter" size={13} aria-hidden="true" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
