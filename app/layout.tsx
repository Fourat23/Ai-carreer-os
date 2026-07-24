import type { Metadata } from 'next';
import './globals.css';
import AppShell from './shell/AppShell';

export const metadata: Metadata = {
  title: 'AI Career OS',
  description: "Plateforme locale d'apprentissage IA sur 12 mois",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
