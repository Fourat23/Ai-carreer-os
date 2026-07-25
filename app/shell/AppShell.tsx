'use client';

// Shell applicatif « Engineering Workbench » : rail de navigation desktop repliable
// + barre supérieure et drawer sur mobile (contenu prioritaire). Aucune icône emoji.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, CalendarDays, BookOpen, Target, FolderGit2, ClipboardCheck,
  NotebookPen, Library, BookMarked, Briefcase, LifeBuoy, GraduationCap, Bot, Bug,
  Brain, Network, Menu, X, PanelLeftClose, PanelLeftOpen, Terminal, Search, Database, History, Route, FlaskConical,
} from 'lucide-react';
import { NAV_GROUPS, type NavItem } from './nav';
import CommandPalette from './CommandPalette';

function openPalette() {
  window.dispatchEvent(new CustomEvent('open-command-palette'));
}

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  LayoutDashboard, CalendarDays, BookOpen, Target, FolderGit2, ClipboardCheck,
  NotebookPen, Library, BookMarked, Briefcase, LifeBuoy, GraduationCap, Bot, Bug, Brain, Network, Database, History, Route, FlaskConical,
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
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          <div className="nav-sect">{g.label}</div>
          <nav className="nav-group" aria-label={g.label}>{render(g.items)}</nav>
        </div>
      ))}
    </>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="AI Career OS — accueil">
      <span className="brand-mark" aria-hidden="true"><Terminal size={18} strokeWidth={2} /></span>
      {!compact && <span className="brand-text">AI Career <b>OS</b></span>}
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

  return (
    <div className="app" data-collapsed={collapsed ? 'true' : 'false'}>
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
      <aside
        id="app-drawer"
        className={`app-drawer${drawer ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        aria-hidden={drawer ? undefined : true}
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
