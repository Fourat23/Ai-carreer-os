import type { Metadata } from 'next';
import './globals.css';
import Sidebar from './Sidebar';

export const metadata: Metadata = {
  title: 'AI Career OS',
  description: "Plateforme locale d'apprentissage IA sur 12 mois",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="layout">
          <Sidebar />
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
