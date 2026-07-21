'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  filterEntries, sortEntries, firstLetter, isAmbiguous, normalizeText, LEVELS,
} from '@/lib/glossary-core';
import type { GlossaryEntry, GlossaryCategory } from '@/lib/glossary-core';

const ALPHABET = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
type View = 'compact' | 'detailed';

export default function GlossaryBrowser({
  entries, categories,
}: {
  entries: GlossaryEntry[];
  categories: GlossaryCategory[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [letter, setLetter] = useState('');
  const [view, setView] = useState<View>('compact');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const catLabel = useMemo(() => {
    const m = new Map(categories.map((c) => [c.id, c.label]));
    return (id: string) => m.get(id) ?? id;
  }, [categories]);
  const termById = useMemo(() => {
    const m = new Map(entries.map((e) => [e.id, e.term]));
    return (id: string) => m.get(id) ?? id;
  }, [entries]);

  // Lettres réellement présentes dans le jeu de données (pour désactiver les autres).
  const presentLetters = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) s.add(firstLetter(e));
    return s;
  }, [entries]);

  // Initialisation depuis l'URL (client uniquement — évite d'imposer un Suspense).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQuery(p.get('q') ?? '');
    setCategory(p.get('cat') ?? '');
    setLevel(p.get('lvl') ?? '');
    setLetter(p.get('letter') ?? '');
    setView(p.get('view') === 'detailed' ? 'detailed' : 'compact');
    setReady(true);
  }, []);

  // Reflet des filtres dans l'URL (remplacement, pas de navigation).
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (category) p.set('cat', category);
    if (level) p.set('lvl', level);
    if (letter) p.set('letter', letter);
    if (view !== 'compact') p.set('view', view);
    const qs = p.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [ready, query, category, level, letter, view]);

  const results = useMemo(() => {
    let r = filterEntries(entries, { query, category, level });
    if (letter) r = r.filter((e) => firstLetter(e) === letter);
    return sortEntries(r);
  }, [entries, query, category, level, letter]);

  // Défilement vers une entrée ciblée via un terme lié.
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`gloss-${focusId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusId, results]);

  function jumpTo(id: string) {
    // On efface les filtres pour garantir que l'entrée ciblée est visible, puis on la focalise.
    setQuery('');
    setCategory('');
    setLevel('');
    setLetter('');
    setFocusId(id);
  }

  function reset() {
    setQuery('');
    setCategory('');
    setLevel('');
    setLetter('');
    setFocusId(null);
  }

  const hasFilters = Boolean(query || category || level || letter);

  return (
    <>
      <div className="gloss-controls">
        <div className="field-group grow">
          <label htmlFor="gloss-q">Recherche (terme, sigle, français, alias, tag)</label>
          <input
            id="gloss-q"
            type="search"
            placeholder="Ex. PR, mise en production, authentification…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setFocusId(null); }}
            autoComplete="off"
          />
        </div>
        <div className="field-group">
          <label htmlFor="gloss-cat">Catégorie</label>
          <select id="gloss-cat" value={category} onChange={(e) => { setCategory(e.target.value); setFocusId(null); }}>
            <option value="">Toutes</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="gloss-lvl">Niveau</label>
          <select id="gloss-lvl" value={level} onChange={(e) => { setLevel(e.target.value); setFocusId(null); }}>
            <option value="">Tous</option>
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label htmlFor="gloss-view">Affichage</label>
          <select id="gloss-view" value={view} onChange={(e) => setView(e.target.value as View)}>
            <option value="compact">Compact</option>
            <option value="detailed">Détaillé</option>
          </select>
        </div>
        <button type="button" className="btn small" onClick={reset} disabled={!hasFilters}>
          Réinitialiser
        </button>
      </div>

      <div className="gloss-azbar" role="group" aria-label="Navigation alphabétique">
        {ALPHABET.map((L) => (
          <button
            key={L}
            type="button"
            className={`gloss-letter ${letter === L ? 'active' : ''}`}
            disabled={!presentLetters.has(L)}
            aria-pressed={letter === L}
            onClick={() => { setLetter(letter === L ? '' : L); setFocusId(null); }}
            title={presentLetters.has(L) ? `Termes en ${L}` : `Aucun terme en ${L}`}
          >
            {L}
          </button>
        ))}
      </div>

      <div className="gloss-meta">
        <span aria-live="polite">
          <strong>{results.length}</strong> terme{results.length > 1 ? 's' : ''}
          {hasFilters ? ' (filtré)' : ` sur ${entries.length}`}
        </span>
        {hasFilters && <button type="button" className="btn small" onClick={reset}>Effacer les filtres</button>}
      </div>

      <div ref={listRef}>
        {results.length === 0 ? (
          <div className="card gloss-empty">
            <p><strong>Aucun terme ne correspond.</strong></p>
            <p>Essaie un autre mot-clé, ou <button type="button" className="btn small" onClick={reset}>réinitialise les filtres</button>.</p>
          </div>
        ) : (
          results.map((e) => (
            <GlossaryCard
              key={e.id}
              entry={e}
              view={view}
              focused={focusId === e.id}
              catLabel={catLabel}
              termById={termById}
              onRelated={jumpTo}
            />
          ))
        )}
      </div>
    </>
  );
}

function levelClass(level: string): string {
  if (level === 'débutant') return 'ok';
  if (level === 'avancé') return 'review';
  return 'accent';
}

function GlossaryCard({
  entry, view, focused, catLabel, termById, onRelated,
}: {
  entry: GlossaryEntry;
  view: View;
  focused: boolean;
  catLabel: (id: string) => string;
  termById: (id: string) => string;
  onRelated: (id: string) => void;
}) {
  const ambiguous = isAmbiguous(entry);
  const detail = (
    <div className="gloss-detail">
      <Field k="Explication détaillée" v={entry.detailedDefinition} />
      <Field k="Contexte d'utilisation" v={entry.usageContext} />
      <Field k="Entendu en réunion" v={entry.meetingExample} example />
      <Field k="Traduction concrète" v={entry.plainTranslation} />

      {ambiguous && (entry.senses?.length ?? 0) > 0 && (
        <div className="gloss-field">
          <span className="k">Sens multiples (attention à l'ambiguïté)</span>
          {entry.senses!.map((s, i) => (
            <div key={i} className="gloss-sense">
              <div className="s-meaning">{s.meaning}</div>
              <div className="s-dom">Domaine : {s.domain} — indice : {s.hint}</div>
              <div className="v example">« {s.example} »</div>
            </div>
          ))}
        </div>
      )}
      {entry.ambiguityNote && <Field k="Note d'ambiguïté" v={entry.ambiguityNote} />}

      {(entry.possibleConfusions?.length ?? 0) > 0 && (
        <div className="gloss-field">
          <span className="k">À ne pas confondre avec</span>
          <ul className="gloss-confusions">
            {entry.possibleConfusions!.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {(entry.relatedTerms?.length ?? 0) > 0 && (
        <div className="gloss-field">
          <span className="k">Termes liés</span>
          <div className="gloss-related">
            {entry.relatedTerms!.map((id) => (
              <button key={id} type="button" onClick={() => onRelated(id)}>{termById(id)}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div id={`gloss-${entry.id}`} className={`card gloss-entry ${focused ? 'focused' : ''}`}>
      <div className="gloss-head">
        <h3 className="gloss-term">
          {entry.term}
          {entry.fullForm && <span className="full">{entry.fullForm}</span>}
        </h3>
        <div className="gloss-badges">
          <span className="badge accent">{catLabel(entry.category)}</span>
          <span className={`badge ${levelClass(entry.level)}`}>{entry.level}</span>
          {ambiguous && <span className="badge warn" title="Cet acronyme/terme a plusieurs sens">ambigu</span>}
        </div>
      </div>
      <div className="gloss-fr">{entry.frenchMeaning}</div>
      <p className="gloss-short">{entry.shortDefinition}</p>

      {view === 'detailed' || focused ? (
        detail
      ) : (
        <details className="gloss-more">
          <summary>Détails, exemple, ambiguïtés et termes liés</summary>
          {detail}
        </details>
      )}
    </div>
  );
}

function Field({ k, v, example }: { k: string; v: string; example?: boolean }) {
  return (
    <div className="gloss-field">
      <span className="k">{k}</span>
      <span className={`v${example ? ' example' : ''}`}>{example ? `« ${v} »` : v}</span>
    </div>
  );
}
