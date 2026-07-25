'use client';

// Sécurité des données locales : export versionné, import avec aperçu et
// validation stricte (snapshot automatique côté serveur), réinitialisation
// explicite. Aucune donnée inventée : l'aperçu vient du fichier réel.
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, RotateCcw, AlertTriangle, Check } from 'lucide-react';
import { parseBackup, type BackupStats } from '@/lib/backup';

type Preview = { stats: BackupStats; version: number; raw: unknown };

export default function SettingsPanel() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(''); setMsg('');
    const file = e.target.files?.[0];
    if (!file) return;
    let raw: unknown;
    try { raw = JSON.parse(await file.text()); }
    catch { setError('Fichier JSON illisible ou corrompu.'); setPreview(null); if (fileRef.current) fileRef.current.value = ''; return; }
    const parsed = parseBackup(raw);
    if (!parsed.ok) { setError(parsed.error); setPreview(null); }
    else setPreview({ stats: parsed.stats, version: parsed.version, raw });
    if (fileRef.current) fileRef.current.value = '';
  }

  async function confirmImport() {
    if (!preview) return;
    setBusy(true); setError('');
    const res = await fetch('/api/progress/import', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(preview.raw),
    });
    setBusy(false);
    if (res.ok) { setPreview(null); setMsg('Progression restaurée. L\'état précédent a été sauvegardé automatiquement.'); router.refresh(); }
    else { const j = await res.json().catch(() => ({})); setError(j.error ?? 'Échec de l\'import.'); }
  }

  async function doReset() {
    setBusy(true); setError('');
    const res = await fetch('/api/progress/reset', { method: 'POST' });
    setBusy(false);
    setConfirmReset(false);
    if (res.ok) { setMsg('Progression réinitialisée. L\'état précédent a été sauvegardé automatiquement.'); router.refresh(); }
    else setError('Échec de la réinitialisation.');
  }

  return (
    <div className="settings">
      {msg && <p className="settings-ok"><Check size={14} /> {msg}</p>}
      {error && <p className="settings-err"><AlertTriangle size={14} /> {error}</p>}

      <div className="settings-block">
        <h3>Exporter</h3>
        <p className="muted">Télécharge toutes tes données locales (progression, statuts, auto-évaluations, réponses et notes) dans un fichier JSON daté et versionné.</p>
        <a className="btn primary" href="/api/progress/export"><Download size={15} strokeWidth={2} /> Exporter ma progression</a>
      </div>

      <div className="settings-block">
        <h3>Importer / restaurer</h3>
        <p className="muted">Sélectionne une sauvegarde. Elle est validée et prévisualisée avant tout remplacement ; l'état actuel est sauvegardé automatiquement.</p>
        {!preview ? (
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload size={15} strokeWidth={2} /> Choisir un fichier de sauvegarde
          </button>
        ) : (
          <div className="settings-preview">
            <div className="dpx-eyebrow">Aperçu — remplacera ta progression actuelle</div>
            <dl className="settings-stats">
              <div><dt>Jours suivis</dt><dd>{preview.stats.daysTracked}</dd></div>
              <div><dt>Terminés</dt><dd>{preview.stats.done}</dd></div>
              <div><dt>En cours</dt><dd>{preview.stats.inProgress}</dd></div>
              <div><dt>À revoir</dt><dd>{preview.stats.toReview}</dd></div>
              <div><dt>Notes</dt><dd>{preview.stats.notes}</dd></div>
              <div><dt>Format</dt><dd>{preview.version ? `v${preview.version}` : 'legacy'}</dd></div>
            </dl>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn primary" onClick={confirmImport} disabled={busy}><Check size={15} strokeWidth={2} /> Remplacer par cette sauvegarde</button>
              <button className="btn ghost" onClick={() => setPreview(null)} disabled={busy}>Annuler</button>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} style={{ display: 'none' }} />
      </div>

      <div className="settings-block danger">
        <h3>Réinitialiser</h3>
        <p className="muted">Efface toute ta progression : statuts, auto-évaluations, réponses, notes, scores de compétences et revues. Cette action est irréversible.</p>
        {!confirmReset ? (
          <button className="btn" onClick={() => { setConfirmReset(true); setMsg(''); }}>
            <RotateCcw size={14} strokeWidth={2} /> Réinitialiser la progression
          </button>
        ) : (
          <div className="settings-confirm">
            <p><strong>Confirmer ?</strong> Tout sera effacé (l'état actuel sera tout de même sauvegardé automatiquement côté serveur). Pense à exporter d'abord.</p>
            <div className="row" style={{ gap: 8 }}>
              <a className="btn small" href="/api/progress/export"><Download size={14} /> Exporter d'abord</a>
              <button className="btn small danger-btn" onClick={doReset} disabled={busy}>Oui, tout réinitialiser</button>
              <button className="btn small ghost" onClick={() => setConfirmReset(false)} disabled={busy}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
