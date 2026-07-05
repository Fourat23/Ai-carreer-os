'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: '📊 Dashboard' },
  { href: '/calendar', label: '🗓️ Calendrier' },
  { href: '/lessons', label: '📖 Leçons de fond' },
  { href: '/skills', label: '🎯 Compétences' },
  { href: '/projects', label: '🚀 Projets' },
  { href: '/reviews', label: '📝 Évaluations' },
  { href: '/notes', label: '🗒️ Notes' },
  { href: '/resources', label: '🔗 Ressources' },
  { href: '/career', label: '💼 Carrière' },
  { href: '/guide', label: '📘 Mode d\'emploi' },
];

export default function Sidebar() {
  const path = usePathname();
  const isActive = (href: string) => (href === '/' ? path === '/' : path.startsWith(href));
  return (
    <aside className="sidebar">
      <div className="brand">AI Career <span>OS</span></div>
      <nav>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="sect">Méthode</div>
      <nav>
        <Link href="/doc/methodology/how-to-learn">Comment apprendre</Link>
        <Link href="/doc/methodology/how-to-use-ai-without-dependency">IA sans dépendance</Link>
        <Link href="/doc/methodology/how-to-debug">Débugger</Link>
        <Link href="/doc/methodology/how-to-think-like-an-engineer">Penser en ingénieur</Link>
        <Link href="/doc/methodology/how-to-design-architecture">Concevoir l'archi</Link>
      </nav>
    </aside>
  );
}
