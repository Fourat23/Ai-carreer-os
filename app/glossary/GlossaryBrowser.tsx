'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  filterEntries, sortEntries, firstLetter, isAmbiguous, normalizeText, LEVELS,
} from '@/lib/glossary-core';
import type { GlossaryEntry, GlossaryCategory } from '@/lib/glossary-core';
import type { GlossaryIndexEntry } from '@/lib/glossary';

const ALPHABET = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
type View = 'compact' | 'detailed';

// V58 · CP2 — Le glossaire devient un EXPLORATEUR À DEUX VOLETS.
//
// Cause établie au CP0 : la capacité de filtrage existait déjà (recherche,
// catégorie, niveau, index A-Z) et fonctionnait. Ce qui manquait n'était pas
// « chercher » mais « SCANNER » : 711 entrées rendues en cartes pleine largeur
// de ~157 px, soit 111 686 px de page. On ne parcourt pas un index de
// connaissances en faisant défiler 78 écrans.
//
// Modèle retenu : INDEX → TROUVER → COMPRENDRE → RELIER.
//   · INDEX     — rail alphabétique + filtres, inchangés dans leur logique.
//   · TROUVER   — une LISTE DENSE de lignes de ~36 px, groupées par lettre
//                 avec en-têtes collants, dans une région défilante bornée.
//   · COMPRENDRE— un volet de détail qui montre l'entrée sélectionnée en
//                 entier, sans faire défiler la liste.
//   · RELIER    — les termes liés et les journées associées restent des
//                 actions du volet, et sélectionnent la cible dans la liste.
//
// Aucune donnée supprimée, aucune pagination artificielle : les 711 entrées
// restent toutes atteignables, et le mode « Détaillé » reste disponible pour
// qui veut la lecture longue.

// ── V62 · CP6 — INDEX LÉGER + DÉTAIL À LA DEMANDE ─────────────────────────
//
// Mesuré au CP0 : 1 073 Ko d'HTML, la route la plus lourde du produit — plus
// lourde que /lab. Cause exacte : les 711 entrées étaient sérialisées avec
// leurs 17 champs vers ce composant client (778 Ko), alors que la liste n'en
// affiche que cinq et que le volet n'en montre qu'UNE à la fois.
//
// Le composant reçoit désormais l'INDEX (108 Ko) et charge l'entrée complète
// quand on la sélectionne. Le filtrage est rigoureusement identique : la
// recherche du glossaire ne porte que sur term, fullForm, aliases,
// frenchMeaning et tags, tous présents dans l'index.
//
// Le mode « Détaillé » — qui affiche réellement toutes les entrées en entier —
// charge le corpus complet une seule fois, à la demande. Il paie son poids
// quand l'utilisateur le réclame, pas à chaque visite.
//
// Aucune entrée n'est retirée : les 711 restent listées, filtrables,
// atteignables. `display:none` n'aurait rien réglé — le poids était dans le
// payload, pas dans l'affichage.
export default function GlossaryBrowser({
  entries, categories,
}: {
  entries: GlossaryIndexEntry[];
  categories: GlossaryCategory[];
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [letter, setLetter] = useState('');
  const [view, setView] = useState<View>('compact');
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [detail, setDetail] = useState<GlossaryEntry | null>(null);
  const [fullEntries, setFullEntries] = useState<GlossaryEntry[] | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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

  // Groupement par lettre initiale — dérivé des données, pas d'un tri inventé.
  const groups = useMemo(() => {
    const m = new Map<string, GlossaryIndexEntry[]>();
    for (const e of results) {
      const L = firstLetter(e);
      if (!m.has(L)) m.set(L, []);
      m.get(L)!.push(e);
    }
    return [...m.entries()].map(([letter, items]) => ({ letter, items }));
  }, [results]);

  // Entrée affichée dans le volet. Par défaut la première du résultat : le
  // volet n'est jamais un vide décoratif dès qu'il y a quelque chose à montrer.
  const selected = useMemo(() => {
    if (selectedId) return results.find((e) => e.id === selectedId) ?? entries.find((e) => e.id === selectedId) ?? null;
    return results[0] ?? null;
  }, [selectedId, results, entries]);

  // Charge l'entrée complète du terme sélectionné. Lecture locale seule.
  useEffect(() => {
    const id = selected?.id;
    if (!id) { setDetail(null); return; }
    if (detail?.id === id) return;
    let cancelled = false;
    setLoadingDetail(true);
    fetch(`/api/glossary/${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch(() => { if (!cancelled) setDetail(null); })
      .finally(() => { if (!cancelled) setLoadingDetail(false); });
    return () => { cancelled = true; };
  }, [selected?.id, detail?.id]);

  // Le mode « Détaillé » a besoin de TOUTES les entrées complètes : il les
  // demande une fois, quand on l'active, et jamais avant.
  useEffect(() => {
    if (view !== 'detailed' || fullEntries) return;
    let cancelled = false;
    fetch('/api/glossary/all')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled && Array.isArray(d)) setFullEntries(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [view, fullEntries]);

  // Défilement vers une entrée ciblée via un terme lié.
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`gloss-${focusId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusId, results]);

  function jumpTo(id: string) {
    // On efface les filtres pour garantir que l'entrée ciblée est atteignable,
    // puis on l'ouvre dans le volet de détail : « RELIER » ne doit pas coûter
    // un défilement de plusieurs écrans.
    setQuery('');
    setCategory('');
    setLevel('');
    setLetter('');
    setFocusId(id);
    setSelectedId(id);
  }

  function reset() {
    setQuery('');
    setCategory('');
    setLevel('');
    setLetter('');
    setFocusId(null);
    setSelectedId(null);
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

      {/* ── TROUVER + COMPRENDRE : liste dense et volet de détail ────────── */}
      <div className="gl-explorer">
        <div className="gl-list-col">
          <div className="gl-count" aria-live="polite">
            <span><strong>{results.length}</strong> terme{results.length > 1 ? 's' : ''}
              {hasFilters ? ' (filtré)' : ` sur ${entries.length}`}</span>
            {hasFilters && <button type="button" className="btn small ghost" onClick={reset}>Effacer</button>}
          </div>

          {results.length === 0 ? (
            <p className="gl-empty">
              Aucun terme ne correspond. Essaie un autre mot-clé, ou{' '}
              <button type="button" className="lk" onClick={reset}>réinitialise les filtres</button>.
            </p>
          ) : view === 'detailed' ? (
            /* Mode « Détaillé » conservé : lecture longue, une entrée après
               l'autre. C'est un choix de l'utilisateur, pas le défaut. */
            <div className="gl-longform" ref={listRef}>
              {fullEntries === null ? (
                <p className="gl-empty">Chargement des {results.length} fiches complètes…</p>
              ) : (
                results.map((r) => {
                  const e = fullEntries.find((f) => f.id === r.id);
                  return e ? (
                    <GlossaryCard key={e.id} entry={e} view="detailed" focused={focusId === e.id}
                      catLabel={catLabel} termById={termById} onRelated={jumpTo} />
                  ) : null;
                })
              )}
            </div>
          ) : (
            <div className="gl-scroll" ref={listRef}
              role="region" aria-label={`Liste des termes — ${results.length} résultats`}>
              <ol className="gl-rows">
                {groups.map((g) => (
                  <li key={g.letter} className="gl-group">
                    <p className="gl-group-h" aria-hidden="true">{g.letter}</p>
                    <ol className="gl-group-rows">
                      {g.items.map((e) => (
                        <li key={e.id} id={`gloss-${e.id}`}
                          className={`gl-row${selectedId === e.id ? ' is-sel' : ''}${focusId === e.id ? ' is-focus' : ''}`}>
                          <button type="button" className="gl-row-btn"
                            aria-current={selectedId === e.id ? 'true' : undefined}
                            onClick={() => { setSelectedId(e.id); setFocusId(null); }}>
                            <span className="gl-row-term">
                              {e.term}
                              {e.fullForm && <span className="gl-row-full">{e.fullForm}</span>}
                            </span>
                            <span className="gl-row-fr">{e.frenchMeaning}</span>
                            <span className={`gl-row-lvl l-${levelClass(e.level)}`}>{e.level}</span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {view === 'compact' && (
          <aside className="gl-detail-col" aria-label="Détail du terme sélectionné">
            {selected && detail ? (
              <GlossaryDetail entry={detail} catLabel={catLabel} termById={termById} onRelated={jumpTo} />
            ) : selected && loadingDetail ? (
              <div className="gl-detail-void"><p className="gl-detail-void-t">{selected.term}</p>
                <p className="gl-detail-void-d">Chargement de la fiche…</p></div>
            ) : (
              <div className="gl-detail-void">
                <p className="gl-detail-void-t">Sélectionne un terme</p>
                <p className="gl-detail-void-d">
                  Chaque entrée dit ce que le terme veut dire, dans quel contexte on l’emploie,
                  ce qu’on entend en réunion, et à quoi ne pas le confondre.
                </p>
              </div>
            )}
          </aside>
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

// V58 · CP2 — Le corps de détail est extrait pour être partagé par le VOLET
// (mode compact) et par la lecture longue (mode détaillé). Une seule source de
// rendu : le volet ne peut pas diverger de la fiche.
function GlossaryDetailBody({
  entry, catLabel, termById, onRelated,
}: {
  entry: GlossaryEntry;
  catLabel: (id: string) => string;
  termById: (id: string) => string;
  onRelated: (id: string) => void;
}) {
  const ambiguous = isAmbiguous(entry);
  return (
    <div className="gloss-detail">
      <Field k="Explication détaillée" v={entry.detailedDefinition} />
      <Field k="Contexte d'utilisation" v={entry.usageContext} />
      <Field k="Entendu en réunion" v={entry.meetingExample} example />
      <Field k="Traduction concrète" v={entry.plainTranslation} />

      {ambiguous && (entry.senses?.length ?? 0) > 0 && (
        <div className="gloss-field">
          <span className="k">Sens multiples (attention à l&apos;ambiguïté)</span>
          {entry.senses!.map((sn, i) => (
            <div key={i} className="gloss-sense">
              <div className="s-meaning">{sn.meaning}</div>
              <div className="s-dom">Domaine : {sn.domain} — indice : {sn.hint}</div>
              <div className="v example">« {sn.example} »</div>
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

      {(entry.days?.length ?? 0) > 0 && (
        <div className="gloss-field">
          <span className="k">Journées associées</span>
          <div className="gloss-related">
            {entry.days!.map((n) => (
              <a key={n} className="gloss-day-link" href={`/day/${n}`}>Jour {n}</a>
            ))}
          </div>
        </div>
      )}
      <p className="gloss-cat-note">
        {catLabel(entry.category)} · niveau {entry.level}
      </p>
    </div>
  );
}

/** Volet de détail collant : l'entrée sélectionnée, en entier, sans défiler la liste. */
function GlossaryDetail({
  entry, catLabel, termById, onRelated,
}: {
  entry: GlossaryEntry;
  catLabel: (id: string) => string;
  termById: (id: string) => string;
  onRelated: (id: string) => void;
}) {
  const ambiguous = isAmbiguous(entry);
  return (
    <div className="gl-detail">
      <header className="gl-detail-head">
        <h2 className="gl-detail-term">{entry.term}</h2>
        {entry.fullForm && <p className="gl-detail-full">{entry.fullForm}</p>}
        <p className="gl-detail-fr">{entry.frenchMeaning}</p>
        <div className="gl-detail-marks">
          <span className="cat-tag">{catLabel(entry.category)}</span>
          <span className={`cat-tag l-${levelClass(entry.level)}`}>{entry.level}</span>
          {ambiguous && <span className="cat-tag l-review" title="Ce terme a plusieurs sens">ambigu</span>}
        </div>
      </header>
      <p className="gl-detail-short">{entry.shortDefinition}</p>
      <GlossaryDetailBody entry={entry} catLabel={catLabel} termById={termById} onRelated={onRelated} />
    </div>
  );
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
  const detail = <GlossaryDetailBody entry={entry} catLabel={catLabel} termById={termById} onRelated={onRelated} />;

  return (
    <div id={`gloss-${entry.id}`} className={`gloss-entry ${focused ? 'focused' : ''}`}>
      <div className="gloss-head">
        <h3 className="gloss-term">
          {entry.term}
          {entry.fullForm && <span className="full">{entry.fullForm}</span>}
        </h3>
        <div className="gloss-badges">
          <span className="cat-tag">{catLabel(entry.category)}</span>
          <span className={`cat-tag l-${levelClass(entry.level)}`}>{entry.level}</span>
          {ambiguous && <span className="cat-tag l-review" title="Ce terme a plusieurs sens">ambigu</span>}
        </div>
      </div>
      <div className="gloss-fr">{entry.frenchMeaning}</div>
      <p className="gloss-short">{entry.shortDefinition}</p>
      {view === 'detailed' || focused ? detail : (
        <details className="gloss-more">
          <summary>Détails, exemple, ambiguïtés et termes liés</summary>
          {detail}
        </details>
      )}
    </div>
  );
}

function Field({ k, v, example }: { k: string; v: string; example?: boolean }) {
  // V58 · CP2 — Certaines entrées du corpus portent DÉJÀ leurs guillemets ;
  // le gabarit en ajoutait une seconde paire (« « … » »). Vu en ouvrant la
  // capture, pas dans la mesure. Le contenu n'est pas modifié : on n'ajoute
  // les guillemets que s'ils sont absents.
  const t = String(v ?? '').trim();
  const quoted = /^[«"'']/.test(t);
  return (
    <div className="gloss-field">
      <span className="k">{k}</span>
      <span className={`v${example ? ' example' : ''}`}>{example && !quoted ? `« ${t} »` : t}</span>
    </div>
  );
}
