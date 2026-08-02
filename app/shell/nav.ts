// Données de navigation du shell, groupées par intention (labels + route + icône
// lucide). Aucune icône emoji : iconographie SVG monochrome cohérente.
export type NavItem = { href: string; label: string; icon: string };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Pilotage',
    items: [
      { href: '/', label: 'Tableau de bord', icon: 'LayoutDashboard' },
      { href: '/parcours', label: 'Parcours', icon: 'Route' },
      { href: '/synthese', label: 'Synthèse', icon: 'LayoutGrid' },
      { href: '/calendar', label: 'Calendrier', icon: 'CalendarDays' },
      { href: '/revisions', label: 'Révisions', icon: 'History' },
    ],
  },
  {
    label: 'Apprendre',
    items: [
      { href: '/lessons', label: 'Leçons de fond', icon: 'BookOpen' },
      { href: '/lab', label: 'Laboratoire', icon: 'FlaskConical' },
      { href: '/missions', label: 'Missions', icon: 'Target' },
      { href: '/skills', label: 'Compétences', icon: 'Target' },
      { href: '/projects', label: 'Projets', icon: 'FolderGit2' },
      { href: '/reviews', label: 'Évaluations', icon: 'ClipboardCheck' },
    ],
  },
  {
    label: 'Outils',
    items: [
      { href: '/notes', label: 'Notes', icon: 'NotebookPen' },
      { href: '/resources', label: 'Ressources', icon: 'Library' },
      { href: '/glossary', label: 'Glossaire IT', icon: 'BookMarked' },
      { href: '/settings', label: 'Sauvegarde', icon: 'Database' },
    ],
  },
  {
    label: 'Carrière',
    items: [
      { href: '/career', label: 'Carrière', icon: 'Briefcase' },
      { href: '/guide', label: "Mode d'emploi", icon: 'LifeBuoy' },
    ],
  },
  {
    label: 'Méthode',
    items: [
      { href: '/doc/methodology/how-to-learn', label: 'Comment apprendre', icon: 'GraduationCap' },
      { href: '/doc/methodology/how-to-use-ai-without-dependency', label: 'IA sans dépendance', icon: 'Bot' },
      { href: '/doc/methodology/how-to-debug', label: 'Débugger', icon: 'Bug' },
      { href: '/doc/methodology/how-to-think-like-an-engineer', label: 'Penser en ingénieur', icon: 'Brain' },
      { href: '/doc/methodology/how-to-design-architecture', label: "Concevoir l'archi", icon: 'Network' },
    ],
  },
];
