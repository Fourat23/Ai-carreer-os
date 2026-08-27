'use client';

// Catalogue filtrable des exercices du Laboratoire. Filtres langage / difficulté
// / compétence / statut + recherche texte, reflétés dans l'URL (partageable).
// Aucune dépendance de table ou de recherche : filtrage local simple et stable.
import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Circle, Dot } from 'lucide-react';
import { skillLabel } from '@/lib/skill-taxonomy.mjs';

export type CatalogItem = {
  id: string; title: string; summary: string; language: string; runtimeLabel: string;
  runtimeAvailable: boolean; difficulty: number; skills: string[]; testCount: number;
  type: string; execKind?: string; status: string; day: number | null;
  // Contexte de parcours (V16) — métadonnées publiques dérivées côté serveur.
  scope: 'active' | 'other' | 'global'; activeDays: number[]; reachableTracks: string[];
  otherTrackTitles: string[]; badgeLabel: string; badgeKind: 'active' | 'other' | 'global';
};

type TrackRef = { id: string; title: string };

const STATUS_META: Record<string, { label: string; cls: string }> = {
  'réussi': { label: 'Réussi', cls: 'ok' },
  'en cours': { label: 'En cours', cls: 'prog' },
  'non commencé': { label: 'Non commencé', cls: 'idle' },
};

const SCOPES: [string, string][] = [
  ['active', 'Parcours actif'], ['active-day', 'Une journée du parcours'],
  ['other', 'Autre parcours'], ['multi', 'Multi-parcours'], ['global', 'Corpus global'],
];

// Portée d'un item (dérivée des champs publics ; miroir de matchesScope, sans I/O).
function inScope(i: CatalogItem, scope: string): boolean {
  switch (scope) {
    case '': case 'all': return true;
    case 'active': return i.activeDays.length > 0;
    case 'active-day': return i.activeDays.length === 1;
    case 'other': return i.scope === 'other';
    case 'multi': return i.reachableTracks.length >= 2;
    case 'global': return i.scope === 'global';
    default: return true;
  }
}

function uniqSorted(values: string[]) { return [...new Set(values)].sort((a, b) => a.localeCompare(b)); }

export default function LabCatalog({ items, activeTrack, availableTracks }: { items: CatalogItem[]; activeTrack: TrackRef; availableTracks: TrackRef[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const [q, setQ] = useState(params.get('q') ?? '');
  const [lang, setLang] = useState(params.get('lang') ?? '');
  const [kind, setKind] = useState(params.get('kind') ?? '');
  const [diff, setDiff] = useState(params.get('diff') ?? '');
  const [skill, setSkill] = useState(params.get('skill') ?? '');
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [track, setTrack] = useState(params.get('track') ?? '');
  const [scope, setScope] = useState(params.get('scope') ?? '');

  // ── V62 · CP6 — DETTE DE DOM : LA CAUSE, PAS LE SYMPTÔME ────────────────
  //
  // Mesuré au CP0 : 6 438 nœuds dans `main`, dont **5 264 (82 %)** à
  // l'intérieur de `<details>` FERMÉS. Un `<details>` replié rend quand même
  // tous ses enfants dans le DOM : 376 lignes d'exercice, 752 nœuds SVG et
  // 3 179 `<span>` existaient pour du contenu que personne ne pouvait voir.
  //
  // La solution correspond à ce problème mesuré et à rien d'autre : **on ne
  // rend les lignes que des groupes réellement ouverts**. Ce n'est pas du
  // `display:none` (qui ne retire rien du DOM), et ce n'est pas de la
  // virtualisation — le brief l'autorise mais aucune mesure ne la justifie ici.
  //
  // Ce que cela NE change pas : les 376 exercices restent tous atteignables,
  // le compte affiché reste le compte réel, les filtres portent sur le corpus
  // entier, et un groupe s'ouvre en un clic. Le `<summary>` de chaque groupe —
  // nom, progression, nombre — reste rendu, donc la structure complète du
  // catalogue est lisible et navigable sans rien déplier.
  const [openKeys, setOpenKeys] = useState<Set<string>>(() => new Set());
  const toggleGroup = (key: string, isOpen: boolean) =>
    setOpenKeys((prev) => {
      const n = new Set(prev);
      if (isOpen) n.add(key); else n.delete(key);
      return n;
    });
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
    if (track) sp.set('track', track);
    if (scope) sp.set('scope', scope);
    const qs = sp.toString();
    router.replace(qs ? `/lab?${qs}` : '/lab', { scroll: false });
  }, [q, lang, kind, diff, skill, status, track, scope, router]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter((i) => (!lang || i.language === lang)
        && (!kind || i.execKind === kind)
        && (!diff || String(i.difficulty) === diff)
        && (!skill || i.skills.includes(skill))
        && (!status || i.status === status)
        && (!track || i.reachableTracks.includes(track))
        && inScope(i, scope)
        && (!needle || `${i.title} ${i.summary} ${i.skills.join(' ')} ${i.type}`.toLowerCase().includes(needle)))
      // tri stable : difficulté puis titre
      .sort((a, b) => a.difficulty - b.difficulty || a.title.localeCompare(b.title));
  }, [items, q, lang, kind, diff, skill, status, track, scope]);

  const reset = useCallback(() => { setQ(''); setLang(''); setKind(''); setDiff(''); setSkill(''); setStatus(''); setTrack(''); setScope(''); }, []);
  const active = q || lang || kind || diff || skill || status || track || scope;

  // V57 · CP5 — Le catalogue est GROUPÉ par compétence au lieu d'être une
  // constellation de 376 cartes.
  //
  // Cause mesurée du débordement horizontal traîné depuis V56 : ce n'était pas
  // une boîte trop large — aucun élément ne dépassait le viewport. La grille
  // rendait 376 cartes sur 188 rangées et son `scrollWidth` dépassait sa propre
  // largeur de 37 px par accumulation d'arrondi sous-pixel. Mesuré : 376 items
  // → 5 px de débordement à 1440 ; 65 items → 0 ; 19 items → 0. Le `min-width:0`
  // tenté en V56 ne pouvait rien y faire. Réduire le nombre d'éléments rendus
  // simultanément supprime la cause au lieu de masquer le symptôme.
  //
  // Le groupement n'invente rien : `skills` est un champ réel de chaque
  // exercice. Un exercice sans compétence déclarée va dans « Non rattachés »,
  // ce qui est un fait, pas une catégorie fabriquée.
  const groups = useMemo(() => {
    const m = new Map<string, CatalogItem[]>();
    for (const i of filtered) {
      const k = i.skills[0] ?? '__none__';
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(i);
    }
    return [...m.entries()]
      .map(([key, list]) => ({
        key,
        label: key === '__none__' ? 'Non rattachés à une compétence' : skillLabel(key),
        items: list,
        done: list.filter((x) => x.status === 'réussi').length,
        onTrack: list.filter((x) => x.activeDays.length > 0).length,
      }))
      // Ce qui touche le parcours actif d'abord, puis les groupes les plus
      // fournis : l'ordre reflète l'utilité, pas l'alphabet.
      .sort((a, b) => b.onTrack - a.onTrack || b.items.length - a.items.length || a.label.localeCompare(b.label));
  }, [filtered]);

  return (
    // V61 · CP11 — Le catalogue n'était qu'UNE section : filtres, décompte et
    // 32 groupes dans le même bloc. Mesuré à 1440, ce bloc faisait 6 520 px sur
    // 7 002 px de page — dominance 0,882 pour un plafond gelé à 0,80. Et le
    // défaut d'usage était le même que la mesure : en descendant dans les
    // résultats, on perdait de vue les filtres qui les avaient produits.
    //
    // Deux régions, pas une : les CONTRÔLES (recherche, portée, parcours,
    // langage, difficulté, compétence, statut) et les RÉSULTATS. C'est la
    // grammaire d'atelier borné que la référence a déjà fixée pour /day et
    // pour l'exercice lui-même — la commande reste, le contenu défile.
    // Le bornage ne s'applique qu'au-delà de 1000 px : sur un téléphone, un
    // défilement dans un défilement est un piège, pas un confort.
    <>
    <section className="lab-controls" role="search" aria-label="Filtrer les exercices">
      <p className="lab-track-ctx">
        Parcours actif : <strong>{activeTrack.title}</strong>
        <span className="lab-track-hint"> · le corpus global reste visible, filtre par portée pour te concentrer.</span>
      </p>
      <div className="lab-filters">
        <input
          className="lab-search" type="search" placeholder="Rechercher un exercice…"
          aria-label="Rechercher un exercice" value={q} onChange={(e) => setQ(e.target.value)}
        />
        <select aria-label="Portée pédagogique" value={scope} onChange={(e) => setScope(e.target.value)}>
          <option value="">Toute portée</option>
          {SCOPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {availableTracks.length > 1 && (
          <select aria-label="Parcours" value={track} onChange={(e) => setTrack(e.target.value)}>
            <option value="">Tous parcours</option>
            {availableTracks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        )}
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
    </section>

    <section className="lab-results" aria-label="Catalogue des exercices">
      {filtered.length === 0 ? (
        <div className="empty">Aucun exercice ne correspond à ces filtres.</div>
      ) : (
        // `tabIndex` : une zone qui défile doit être atteignable au clavier —
        // sans lui, un utilisateur sans souris ne peut pas la faire défiler.
        <div className="lab-groups" tabIndex={0}>
          {groups.map((g, gi) => (
            <details
              key={g.key}
              className="lab-group"
              /* Un seul groupe ouvert par défaut — celui du haut, le plus
                 utile au parcours actif. Ouvrir les 32 groupes reproduirait la
                 constellation que ce CP vient de supprimer : mesuré, 32 groupes
                 ouverts = 25 213 px de haut. Quand un filtre est posé,
                 l'apprenant cherche quelque chose de précis : tout s'ouvre. */
              /* V62 · CP6 — plus d'ouverture automatique. Mesuré : le groupe
                 le plus fourni est classé en tête (tri par utilité), et à
                 375 px son dépliage à lui seul faisait 9 637 px. Le catalogue
                 s'ouvre donc sur ses 32 EN-TÊTES — nom, progression, compte —
                 qui sont exactement l'index dont on a besoin pour choisir.
                 L'action « prochain exercice », en tête de page, reste le
                 chemin direct pour qui ne veut pas choisir. */
              open={!!active || openKeys.has(g.key)}
              onToggle={(e) => toggleGroup(g.key, (e.currentTarget as HTMLDetailsElement).open)}
            >
              <summary className="lab-group-head">
                <span className="lab-group-name">{g.label}</span>
                <span className="lab-group-bar" aria-hidden="true">
                  <span className="lab-group-fill" style={{ width: `${(g.done / g.items.length) * 100}%` }} />
                </span>
                <span className="lab-group-n">
                  {g.done}/{g.items.length}
                  {g.onTrack > 0 && <span className="lab-group-track"> · {g.onTrack} sur ton parcours</span>}
                </span>
              </summary>
              {(active || openKeys.has(g.key)) && (
              <ul className="lab-rows" aria-label={`Exercices — ${g.label}`}>
                {g.items.map((i) => {
                  const st = STATUS_META[i.status] ?? STATUS_META['non commencé'];
                  return (
                    <li key={i.id} className={`lab-row st-${st.cls}`}>
                      <Link href={`/lab/${i.id}`} className="lab-row-link">
                        <span className="lab-row-mark" aria-hidden="true">
                          {i.status === 'réussi' ? <Check size={13} strokeWidth={2.5} />
                            : i.status === 'en cours' ? <Dot size={16} /> : <Circle size={9} />}
                        </span>
                        <span className="lab-row-body">
                          <span className="lab-row-title">{i.title}</span>
                          <span className="lab-row-sum">{i.summary}</span>
                        </span>
                        <span className="lab-row-diff" title={`Difficulté ${i.difficulty} sur 5`}>
                          {i.difficulty > 0 ? `D${i.difficulty}` : '—'}
                        </span>
                        <span className="lab-row-rt">
                          {i.runtimeLabel}{i.runtimeAvailable ? '' : ' · indispo.'}
                        </span>
                        <span className={`lab-row-st ${st.cls}`}>{st.label}</span>
                        <ArrowRight size={13} className="lab-row-go" aria-hidden="true" />
                      </Link>
                      {i.activeDays.length > 0 && (
                        <span className="lab-row-days">
                          {i.activeDays.slice(0, 3).map((d) => (
                            <Link key={d} href={`/day/${d}`} className="lab-day-link">J{d}</Link>
                          ))}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              )}
            </details>
          ))}
        </div>
      )}
    </section>
    </>
  );
}
