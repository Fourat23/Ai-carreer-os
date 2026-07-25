// Données de navigation du shell (labels + route + nom d'icône lucide).
// Aucune icône emoji : iconographie SVG monochrome cohérente.
export type NavItem = { href: string; label: string; icon: string };

export const PRIMARY_NAV: NavItem[] = [
  { href: '/', label: 'Tableau de bord', icon: 'LayoutDashboard' },
  { href: '/calendar', label: 'Calendrier', icon: 'CalendarDays' },
  { href: '/lessons', label: 'Leçons de fond', icon: 'BookOpen' },
  { href: '/skills', label: 'Compétences', icon: 'Target' },
  { href: '/projects', label: 'Projets', icon: 'FolderGit2' },
  { href: '/reviews', label: 'Évaluations', icon: 'ClipboardCheck' },
  { href: '/notes', label: 'Notes', icon: 'NotebookPen' },
  { href: '/resources', label: 'Ressources', icon: 'Library' },
  { href: '/glossary', label: 'Glossaire IT', icon: 'BookMarked' },
  { href: '/career', label: 'Carrière', icon: 'Briefcase' },
  { href: '/guide', label: "Mode d'emploi", icon: 'LifeBuoy' },
  { href: '/settings', label: 'Sauvegarde', icon: 'Database' },
];

export const METHOD_NAV: NavItem[] = [
  { href: '/doc/methodology/how-to-learn', label: 'Comment apprendre', icon: 'GraduationCap' },
  { href: '/doc/methodology/how-to-use-ai-without-dependency', label: 'IA sans dépendance', icon: 'Bot' },
  { href: '/doc/methodology/how-to-debug', label: 'Débugger', icon: 'Bug' },
  { href: '/doc/methodology/how-to-think-like-an-engineer', label: 'Penser en ingénieur', icon: 'Brain' },
  { href: '/doc/methodology/how-to-design-architecture', label: "Concevoir l'archi", icon: 'Network' },
];
