'use client';

// Sauvegarde / restauration de la progression (data/progress.json).
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BackupControls() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const res = await fetch('/api/progress/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      });
      if (res.ok) { setMsg('✓ Progression restaurée.'); router.refresh(); }
      else { const j = await res.json(); setMsg('✗ ' + (j.error ?? 'échec')); }
    } catch {
      setMsg('✗ Fichier illisible.');
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="row" style={{ gap: 8, alignItems: 'center' }}>
      <a className="btn small" href="/api/progress/export">⬇️ Exporter ma progression</a>
      <button className="btn small" onClick={() => fileRef.current?.click()}>⬆️ Restaurer</button>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onImport} style={{ display: 'none' }} />
      {msg && <span className="muted" style={{ fontSize: 12 }}>{msg}</span>}
    </div>
  );
}
