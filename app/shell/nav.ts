// Données de navigation du shell, groupées par intention (labels + route + icône
// lucide). Aucune icône emoji : iconographie SVG monochrome cohérente.
// V54.1 : IA resserrée — Pilotage / Apprendre / Évaluer / Outils. Les laboratoires
// spécialisés sont regroupés dans une section repliable (moins de bruit au 1er niveau),
// sans supprimer aucune route.
export type NavItem = { href: string; label: string; icon: string };
export type NavGroup = { label: string; items: NavItem[]; collapsible?: boolean };

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
      { href: '/projects', label: 'Projets', icon: 'FolderGit2' },
    ],
  },
  {
    label: 'Évaluer',
    items: [
      { href: '/skills', label: 'Compétences', icon: 'Gauge' },
      { href: '/diagnostics', label: 'Diagnostics', icon: 'ShieldQuestion' },
      { href: '/capstones', label: 'Capstones', icon: 'Layers' },
      { href: '/reviews', label: 'Évaluations', icon: 'ClipboardCheck' },
    ],
  },
  {
    label: 'Laboratoires',
    collapsible: true,
    items: [
      { href: '/pipelines', label: 'Pipeline Lab', icon: 'Workflow' },
      { href: '/cloud-lab', label: 'Cloud Topology Lab', icon: 'Network' },
      { href: '/kubernetes', label: 'Kubernetes Lab', icon: 'Boxes' },
      { href: '/security', label: 'Security Lab', icon: 'ShieldAlert' },
      { href: '/cloud-foundations', label: 'Cloud Architecture Lab', icon: 'Cloud' },
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
    collapsible: true,
    items: [
      { href: '/career', label: 'Carrière', icon: 'Briefcase' },
      { href: '/guide', label: "Mode d'emploi", icon: 'LifeBuoy' },
    ],
  },
  {
    label: 'Méthode',
    collapsible: true,
    items: [
      { href: '/doc/methodology/how-to-learn', label: 'Comment apprendre', icon: 'GraduationCap' },
      { href: '/doc/methodology/how-to-use-ai-without-dependency', label: 'IA sans dépendance', icon: 'Bot' },
      { href: '/doc/methodology/how-to-debug', label: 'Débugger', icon: 'Bug' },
      { href: '/doc/methodology/how-to-think-like-an-engineer', label: 'Penser en ingénieur', icon: 'Brain' },
      { href: '/doc/methodology/how-to-design-architecture', label: "Concevoir l'archi", icon: 'Network' },
    ],
  },
];
