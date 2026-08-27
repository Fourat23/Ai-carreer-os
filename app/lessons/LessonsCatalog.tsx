'use client';

// V62 · CP3 — CATALOGUE DE LEÇONS NAVIGABLE.
//
// Mesuré au CP0 : 18 762 px à 375 px, 9 627 px à 1440, dominance 0,90 — un
// seul bloc portait 90 % de la page. Les 128 leçons se déroulaient à plat,
// et une fois descendu dans la liste, plus rien ne ramenait vers l'index des
// 17 catégories. Défaut vu à l'œil sur la capture, pas signalé par une sonde :
// ni débordement, ni rognage, ni violation.
//
// Le contenu N'EST PAS réduit : les 128 leçons restent rendues, comptées et
// atteignables. Ce qui change est la NAVIGATION DEDANS :
//
//   · une recherche réelle (titre, compétence, catégorie) ;
//   · les catégories deviennent des sections dépliables, la première ouverte —
//     même règle que les groupes de `/lab`, pour que le produit n'ait pas deux
//     façons de dire « replié » ;
//   · dès qu'une recherche est posée, TOUT s'ouvre : on cherche quelque chose
//     de précis, on ne veut pas cliquer 17 fois ;
//   · l'index des catégories reste collant en tête de la zone de catalogue :
//     c'est lui le retour en arrière qui manquait.
//
// Aucune pagination inventée, aucun accordéon sur le cours lui-même (le cours
// est dans /doc/lessons/[slug] et n'est pas touché).
import { useMemo, useState } from 'react';
import Link from 'next/link';

export type LessonRow = {
  slug: string; title: string; cat: string; level: number; min: number; skillNames: string[];
};

const LEVEL_LABEL: Record<number, { label: string; cls: string }> = {
  1: { label: 'débutant', cls: 'ok' },
  2: { label: 'intermédiaire', cls: 'accent' },
  3: { label: 'avancé', cls: 'review' },
};

const slug = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function LessonsCatalog({ lessons, cats }: { lessons: LessonRow[]; cats: string[] }) {
  const [q, setQ] = useState('');
  const [level, setLevel] = useState('');

  const active = q.trim().length > 0 || level !== '';

  const filtered = useMemo(() => {
    const needle = norm(q.trim());
    return lessons.filter((l) => {
      if (level && String(l.level) !== level) return false;
      if (!needle) return true;
      return norm(`${l.title} ${l.cat} ${l.skillNames.join(' ')}`).includes(needle);
    });
  }, [lessons, q, level]);

  const byCat = useMemo(() => {
    const m = new Map<string, LessonRow[]>();
    for (const l of filtered) {
      if (!m.has(l.cat)) m.set(l.cat, []);
      m.get(l.cat)!.push(l);
    }
    return m;
  }, [filtered]);

  const shown = cats.filter((c) => byCat.has(c));

  return (
    <>
      <section className="les-controls" role="search" aria-label="Filtrer les leçons">
        <div className="les-filters">
          <input
            className="les-search" type="search" placeholder="Rechercher une leçon…"
            aria-label="Rechercher une leçon" value={q} onChange={(e) => setQ(e.target.value)}
          />
          <select aria-label="Niveau" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Tous niveaux</option>
            <option value="1">Débutant</option>
            <option value="2">Intermédiaire</option>
            <option value="3">Avancé</option>
          </select>
          {active && (
            <button type="button" className="btn small ghost"
                    onClick={() => { setQ(''); setLevel(''); }}>
              Réinitialiser
            </button>
          )}
        </div>

        {/* L'index reste collant : c'est le retour vers la structure qui
            manquait une fois descendu dans les 128 leçons. */}
        <nav className="cat-index les-index" aria-label="Catégories">
          <span className="cat-index-k">Catégories</span>
          <ul className="cat-index-list">
            {shown.map((c) => (
              <li key={c}>
                <a href={`#cat-${slug(c)}`}>{c} <span className="cat-index-n">{byCat.get(c)!.length}</span></a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="les-count" aria-live="polite">
          {filtered.length} leçon{filtered.length > 1 ? 's' : ''}{active ? ' (filtrées)' : ''}
          {active ? ` sur ${lessons.length}` : ''}
        </p>
      </section>

      {filtered.length === 0 ? (
        <div className="empty">Aucune leçon ne correspond à cette recherche.</div>
      ) : (
        <section className="cat les-cat" aria-label="Catalogue des leçons">
          {shown.map((cat, ci) => (
            <details key={cat} className="cat-group les-group" id={`cat-${slug(cat)}`}
                     open={active || ci === 0}>
              <summary className="cat-group-head les-group-head">
                <h2 className="cat-group-name">{cat}</h2>
                <span className="cat-group-n">
                  {byCat.get(cat)!.length} leçon{byCat.get(cat)!.length > 1 ? 's' : ''}
                </span>
              </summary>
              <ul className="cat-rows">
                {byCat.get(cat)!.map((l, i) => {
                  const lvl = LEVEL_LABEL[l.level] ?? LEVEL_LABEL[2];
                  return (
                    <li key={l.slug} className="cat-row">
                      <Link href={`/doc/lessons/${l.slug}`} className="cat-row-link">
                        <span className="cat-row-ord" aria-hidden="true">{i + 1}</span>
                        <span className="cat-row-body">
                          <span className="cat-row-title">{l.title}</span>
                          <span className="cat-row-sub">{l.skillNames.join(' · ')}</span>
                        </span>
                        <span className="cat-row-tags">
                          <span className={`cat-tag l-${lvl.cls}`}>{lvl.label}</span>
                          <span className="cat-tag">~{l.min} min</span>
                        </span>
                        <span className="cat-row-n">Lire →</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
        </section>
      )}
    </>
  );
}
