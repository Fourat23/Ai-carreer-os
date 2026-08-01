'use client';

// Catalogue filtrable des exercices du Laboratoire. Filtres langage / difficulté
// / compétence / statut + recherche texte, reflétés dans l'URL (partageable).
// Aucune dépendance de table ou de recherche : filtrage local simple et stable.
import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FlaskConical, ArrowRight, Check, Circle, Dot } from 'lucide-react';
import { skillLabel } from '@/lib/skill-taxonomy.mjs';

export type CatalogItem = {
  id: string; title: string; summary: string; language: string; runtimeLabel: string;
  runtimeAvailable: boolean; difficulty: number; skills: string[]; testCount: number;
  type: string; execKind?: string; status: string; day: number | null;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  'réussi': { label: 'Réussi', cls: 'ok' },
  'en cours': { label: 'En cours', cls: 'prog' },
  'non commencé': { label: 'Non commencé', cls: 'idle' },
};

function uniqSorted(values: string[]) { return [...new Set(values)].sort((a, b) => a.localeCompare(b)); }

export default function LabCatalog({ items }: { items: CatalogItem[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get('q') ?? '');
  const [lang, setLang] = useState(params.get('lang') ?? '');
  const [kind, setKind] = useState(params.get('kind') ?? '');
  const [diff, setDiff] = useState(params.get('diff') ?? '');
  const [skill, setSkill] = useState(params.get('skill') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const hasPreview = useMemo(() => items.some((i) => i.execKind === 'preview'), [items]);

  const languages = useMemo(() => uniqSorted(items.map((i) => i.language)), [items]);
  const skills = useMemo(() => uniqSorted(items.flatMap((i) => i.skills)), [items]);

  // Reflète les filtres dans l'URL (partageable), sans recharger la page.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (lang) sp.set('lang', lang);
    if (kind) sp.set('kind', kind);
    if (diff) sp.set('diff', diff);
    if (skill) sp.set('skill', skill);
    if (status) sp.set('status', status);
    const qs = sp.toString();
    router.replace(qs ? `/lab?${qs}` : '/lab', { scroll: false });
  }, [q, lang, kind, diff, skill, status, router]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter((i) => (!lang || i.language === lang)
        && (!kind || i.execKind === kind)
        && (!diff || String(i.difficulty) === diff)
        && (!skill || i.skills.includes(skill))
        && (!status || i.status === status)
        && (!needle || `${i.title} ${i.summary} ${i.skills.join(' ')} ${i.type}`.toLowerCase().includes(needle)))
      // tri stable : difficulté puis titre
      .sort((a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title));
  }, [items, q, lang, kind, diff, skill, status]);

  const reset = useCallback(() => { setQ(''); setLang(''); setKind(''); setDiff(''); setSkill(''); setStatus(''); }, []);
  const active = q || lang || kind || diff || skill || status;

  return (
    <div className="page-wide">
      <div className="lab-filters" role="search">
        <input
          className="lab-search" type="search" placeholder="Rechercher un exercice…"
          aria-label="Rechercher un exercice" value={q} onChange={(e) => setQ(e.target.value)}
        />
        <select aria-label="Langage" value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="">Tous langages</option>
          {languages.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        {hasPreview && (
          <select aria-label="Type d’exercice" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">Tous types</option>
            <option value="exécution">Exécution</option>
            <option value="preview">Preview</option>
          </select>
        )}
        <select aria-label="Difficulté" value={diff} onChange={(e) => setDiff(e.target.value)}>
          <option value="">Toute difficulté</option>
          {[1, 2, 3, 4, 5].map((d) => <option key={d} value={String(d)}>Difficulté {d}</option>)}
        </select>
        <select aria-label="Compétence" value={skill} onChange={(e) => setSkill(e.target.value)}>
          <option value="">Toute compétence</option>
          {skills.map((s) => <option key={s} value={s}>{skillLabel(s)}</option>)}
        </select>
        <select aria-label="Statut" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tout statut</option>
          <option value="non commencé">Non commencé</option>
          <option value="en cours">En cours</option>
          <option value="réussi">Réussi</option>
          <option value="à revoir">À revoir</option>
        </select>
        {active && <button className="btn small ghost" onClick={reset}>Réinitialiser</button>}
      </div>

      <p className="lab-count" aria-live="polite">{filtered.length} exercice{filtered.length > 1 ? 's' : ''}{active ? ' (filtrés)' : ''}</p>

      {filtered.length === 0 ? (
        <div className="empty">Aucun exercice ne correspond à ces filtres.</div>
      ) : (
        <ul className="lab-grid" aria-label="Exercices">
          {filtered.map((i) => {
            const st = STATUS_META[i.status] ?? STATUS_META['non commencé'];
            return (
              <li key={i.id}>
                <Link href={`/lab/${i.id}`} className="lab-card">
                  <div className="lab-card-head">
                    <FlaskConical size={16} strokeWidth={2} />
                    <span className="lab-card-title">{i.title}</span>
                    <span className={`lab-status ${st.cls}`}>
                      {i.status === 'réussi' ? <Check size={12} /> : i.status === 'en cours' ? <Dot size={14} /> : <Circle size={9} />} {st.label}
                    </span>
                  </div>
                  <p className="lab-card-sum">{i.summary}</p>
                  <div className="lab-card-meta">
                    <span className={`badge${i.runtimeAvailable ? '' : ' warn'}`}>{i.runtimeLabel}{i.runtimeAvailable ? '' : ' · indispo.'}</span>
                    <span className="badge">{i.type}</span>
                    {i.difficulty > 0 && <span className="badge">Difficulté {i.difficulty}/5</span>}
                    <span className="badge">{i.testCount} tests</span>
                    {i.day != null && <span className="badge">Jour {i.day}</span>}
                    <span className="lab-card-go">Ouvrir <ArrowRight size={13} /></span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
