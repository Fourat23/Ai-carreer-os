'use client';

// Shell applicatif « Engineering Workbench » : rail de navigation desktop repliable
// + barre supérieure et drawer sur mobile (contenu prioritaire). Aucune icône emoji.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, CalendarDays, BookOpen, Target, FolderGit2, ClipboardCheck,
  NotebookPen, Library, BookMarked, Briefcase, LifeBuoy, GraduationCap, Bot, Bug,
  Brain, Network, Menu, X, PanelLeftClose, PanelLeftOpen, Terminal, Search, Database, History, Route, FlaskConical, LayoutGrid, Workflow, Boxes, ShieldAlert, ShieldQuestion, Layers, Cloud, Gauge, ChevronRight, ScrollText,
} from 'lucide-react';
import { NAV_GROUPS, type NavItem } from './nav';
import CommandPalette from './CommandPalette';

function openPalette() {
  window.dispatchEvent(new CustomEvent('open-command-palette'));
}

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  LayoutDashboard, CalendarDays, BookOpen, Target, FolderGit2, ClipboardCheck,
  NotebookPen, Library, BookMarked, Briefcase, LifeBuoy, GraduationCap, Bot, Bug, Brain, Network, Database, History, Route, FlaskConical, LayoutGrid, Workflow, Boxes, ShieldAlert, ShieldQuestion, Layers, Cloud, Gauge, ScrollText,
};

function isActive(path: string, href: string) {
  return href === '/' ? path === '/' : path.startsWith(href);
}

function NavLinks({ path, onNavigate }: { path: string; onNavigate?: () => void }) {
  const render = (items: NavItem[]) =>
    items.map((it) => {
      const Icon = ICONS[it.icon] ?? Terminal;
      const active = isActive(path, it.href);
      return (
        <Link
          key={it.href}
          href={it.href}
          className={`nav-link${active ? ' active' : ''}`}
          aria-current={active ? 'page' : undefined}
          title={it.label}
          onClick={onNavigate}
        >
          <span className="nav-ico" aria-hidden="true"><Icon size={17} strokeWidth={1.75} /></span>
          <span className="nav-label">{it.label}</span>
        </Link>
      );
    });
  return (
    <>
      {NAV_GROUPS.map((g) => {
        if (g.collapsible) {
          const hasActive = g.items.some((it) => isActive(path, it.href));
          return (
            <details key={g.label} className="nav-details" open={hasActive}>
              <summary className="nav-sect nav-sect-toggle">
                <ChevronRight size={12} strokeWidth={2.4} className="nav-caret" aria-hidden="true" />
                {g.label}
              </summary>
              <nav className="nav-group" aria-label={g.label}>{render(g.items)}</nav>
            </details>
          );
        }
        return (
          <div key={g.label}>
            <div className="nav-sect">{g.label}</div>
            <nav className="nav-group" aria-label={g.label}>{render(g.items)}</nav>
          </div>
        );
      })}
    </>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    // V55 — la marque devient composée : monogramme sur surface d'accent +
    // nom sur deux lignes (nom du produit / nature du produit). C'est le seul
    // endroit du shell où l'accent occupe une surface pleine.
    <Link href="/" className="brand" aria-label="AI Career OS — accueil">
      <span className="brand-mark" aria-hidden="true"><Terminal size={17} strokeWidth={2.1} /></span>
      {!compact && (
        <span className="brand-text">
          <span className="brand-name">AI Career <b>OS</b></span>
          <span className="brand-kind">Learning workstation</span>
        </span>
      )}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Préférence de repli persistée (desktop).
  useEffect(() => {
    try { setCollapsed(localStorage.getItem('nav:collapsed') === '1'); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('nav:collapsed', collapsed ? '1' : '0'); } catch {}
  }, [collapsed]);

  // Fermer le drawer au changement de route.
  useEffect(() => { setDrawer(false); }, [path]);

  // Échap ferme le drawer ; focus sur le bouton de fermeture ; verrou de scroll.
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawer(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [drawer]);

  // V60 — SPIKE DE DESIGN, ISOLÉ DU PRODUIT.
  //
  // Les prototypes de `/design-spike/v60/**` ne sont pas des routes métier :
  // ils servent à comparer trois architectures visuelles sur un canvas plein,
  // sans le rail ni la marque — ce que le test à l'aveugle exige de toute
  // façon. Aucune page de production n'emprunte cette branche, et aucun lien
  // du produit ne mène ici : la seule entrée est l'URL, tapée à la main.
  //
  // Ce spike NE MIGRE RIEN. Si aucune direction n'est retenue, supprimer
  // `app/design-spike/` et ces cinq lignes rend l'état d'avant à l'identique.
  if (path.startsWith('/design-spike')) return <>{children}</>;

  return (
    <div className="app" data-collapsed={collapsed ? 'true' : 'false'}>
      <a href="#main" className="skip-link">Aller au contenu</a>
      {/* Rail desktop */}
      <aside className="app-rail" aria-label="Navigation">
        <div className="rail-top">
          <Brand compact={collapsed} />
          <button type="button" className="rail-search" onClick={openPalette}
                  aria-label="Rechercher (Ctrl+K)" title="Rechercher (Ctrl+K)">
            <span className="nav-ico" aria-hidden="true"><Search size={16} strokeWidth={1.9} /></span>
            <span className="nav-label">Rechercher</span>
            <kbd className="rail-kbd" aria-hidden="true">⌘K</kbd>
          </button>
        </div>
        <div className="rail-scroll"><NavLinks path={path} /></div>
        <button
          type="button"
          className="rail-collapse"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Déplier la navigation' : 'Replier la navigation'}
        >
          <span className="nav-ico" aria-hidden="true">
            {collapsed ? <PanelLeftOpen size={17} strokeWidth={1.75} /> : <PanelLeftClose size={17} strokeWidth={1.75} />}
          </span>
          <span className="nav-label">Replier</span>
        </button>
      </aside>

      {/* Barre supérieure mobile */}
      <header className="app-topbar">
        <button
          type="button"
          className="topbar-btn"
          onClick={() => setDrawer(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={drawer}
          aria-controls="app-drawer"
        >
          <Menu size={20} strokeWidth={1.9} />
        </button>
        <Brand />
        <span className="topbar-spacer" />
        <button type="button" className="topbar-btn" onClick={openPalette} aria-label="Rechercher">
          <Search size={19} strokeWidth={1.9} />
        </button>
      </header>

      {/* Drawer mobile */}
      <div className={`drawer-overlay${drawer ? ' open' : ''}`} onClick={() => setDrawer(false)} aria-hidden="true" />
      {/* V61 · CP12 — axe-core relevait `aria-hidden-focus` en SERIOUS sur les
          quinze routes migrées à 375 px, et sur elles seules : le drawer était
          marqué `aria-hidden` à la fermeture tout en gardant ses liens dans
          l'ordre de tabulation. Un utilisateur au clavier tabulait donc dans
          une navigation que la synthèse vocale déclarait absente.
          `inert` retire l'élément À LA FOIS de l'arbre d'accessibilité et de
          l'ordre de tabulation — c'est exactement ce que l'état fermé veut
          dire. Un seul correctif, quinze routes. */}
      <aside
        id="app-drawer"
        className={`app-drawer${drawer ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        aria-hidden={drawer ? undefined : true}
        inert={drawer ? undefined : true}
      >
        <div className="drawer-head">
          <Brand />
          <button ref={closeRef} type="button" className="topbar-btn" onClick={() => setDrawer(false)} aria-label="Fermer le menu">
            <X size={20} strokeWidth={1.9} />
          </button>
        </div>
        <div className="rail-scroll"><NavLinks path={path} onNavigate={() => setDrawer(false)} /></div>
      </aside>

      <main className="content" id="main">{children}</main>

      <CommandPalette />
    </div>
  );
}
