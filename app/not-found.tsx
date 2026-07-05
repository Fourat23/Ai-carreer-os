import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1>Introuvable</h1>
      <p className="subtitle">Cette page n'existe pas.</p>
      <Link className="btn" href="/">← Retour au dashboard</Link>
    </>
  );
}
