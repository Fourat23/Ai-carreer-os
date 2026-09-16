'use client';

// Sécurité des données locales : sauvegarde restaurable, archive complète,
// import avec APERÇU serveur (validation stricte, snapshot automatique, import
// atomique), réinitialisation de la progression, suppression totale.
//
// ── V77.1 · CP2 — LE WORDING EST UNE PROMESSE, PAS UNE DÉCORATION ───────────
//
// Le CP0 a mesuré deux mensonges dans ce fichier :
//   · « Télécharge toutes tes données locales » — faux : les journaux de
//     tentatives, qui contiennent le code de l'apprenant, n'y étaient pas ;
//   · « Efface toute ta progression […] irréversible » suivi, deux lignes plus
//     bas, de « l'état actuel sera tout de même sauvegardé automatiquement ».
//
// Aucune des deux phrases n'est reformulée « mieux » : chaque bloc énonce
// désormais ce qui part ET ce qui reste, et la seule opération qui a le droit
// de dire « toutes » est celle qui les emporte réellement toutes.
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Upload, RotateCcw, AlertTriangle, Check, Trash2 } from 'lucide-react';
// Le mot de confirmation vient de la carte des données, pas d'une chaîne
// recopiée ici : le bouton et la route doivent exiger EXACTEMENT le même.
import { CONFIRMATION_DE_SUPPRESSION } from '@/lib/learner-data';

type PreviewStats = { trackCount: number; activeTrackId: string; tracks: string[]; workspaceCount: number; version: number; warnings: string[] };

export default function SettingsPanel() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewStats | null>(null);
  const [raw, setRaw] = useState<unknown>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteWord, setDeleteWord] = useState('');
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(''); setMsg('');
    const file = e.target.files?.[0];
    if (!file) return;
    let parsed: unknown;
    try { parsed = JSON.parse(await file.text()); }
    catch { setError('Fichier JSON illisible ou corrompu.'); setPreview(null); if (fileRef.current) fileRef.current.value = ''; return; }
    setBusy(true);
    const res = await fetch('/api/progress/import', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ preview: true, backup: parsed }),
    });
    setBusy(false);
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.stats) { setPreview(j.stats); setRaw(parsed); }
    else { setError(j.error ?? 'Sauvegarde invalide.'); setPreview(null); }
    if (fileRef.current) fileRef.current.value = '';
  }

  async function confirmImport() {
    if (raw == null) return;
    setBusy(true); setError('');
    const res = await fetch('/api/progress/import', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ backup: raw }),
    });
    setBusy(false);
    if (res.ok) { setPreview(null); setRaw(null); setMsg('Progression et workspaces restaurés. L\'état précédent a été sauvegardé automatiquement.'); window.dispatchEvent(new CustomEvent('progress-changed')); router.refresh(); }
    else { const j = await res.json().catch(() => ({})); setError(j.error ?? 'Échec de l\'import.'); }
  }

  async function doReset() {
    setBusy(true); setError('');
    const res = await fetch('/api/progress/reset', { method: 'POST' });
    setBusy(false);
    setConfirmReset(false);
    if (res.ok) { setMsg('Progression réinitialisée. L\'instantané de secours, tes workspaces et tes journaux de tentatives sont intacts.'); window.dispatchEvent(new CustomEvent('progress-changed')); router.refresh(); }
    else setError('Échec de la réinitialisation.');
  }

  async function doDeleteAll() {
    setBusy(true); setError('');
    const res = await fetch('/api/progress/delete-all', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmation: deleteWord.trim() }),
    });
    setBusy(false);
    const j = await res.json().catch(() => ({}));
    if (res.ok && j.ok) {
      const n = (j.supprime ?? []).reduce((a: number, l: { fichiersSupprimes?: number }) => a + (l.fichiersSupprimes ?? 0), 0);
      setConfirmDelete(false); setDeleteWord('');
      setMsg(`Supprimé : ${n} fichier(s). Progression, instantané de secours, workspaces et journaux de tentatives. Rien n'a été sauvegardé.`);
      window.dispatchEvent(new CustomEvent('progress-changed')); router.refresh();
    } else setError(j.error ?? 'Échec de la suppression. Aucune donnée n\'a été supprimée.');
  }

  return (
    <div className="settings">
      {msg && <p className="settings-ok"><Check size={14} /> {msg}</p>}
      {error && <p className="settings-err"><AlertTriangle size={14} /> {error}</p>}

      <div className="settings-block">
        <h3>Exporter une sauvegarde restaurable</h3>
        <p className="muted">
          Fichier JSON daté et versionné, relisible par « Importer / restaurer ».
          Il contient la progression de chaque parcours (statuts, auto-évaluations,
          réponses, notes, révisions, preuves) et les workspaces du Laboratoire.
          <strong> Il ne contient pas tes journaux de tentatives</strong> — pour
          les emporter, utilise l'archive complète ci-dessous.
        </p>
        <a className="btn primary" href="/api/progress/export"><Download size={15} strokeWidth={2} /> Exporter une sauvegarde</a>
      </div>

      <div className="settings-block">
        <h3>Exporter toutes mes données</h3>
        <p className="muted">
          Archive complète : la sauvegarde ci-dessus, <strong>plus</strong> tes
          journaux de tentatives (le code de chaque essai, réussi ou raté) et
          l'instantané de secours. C'est tout ce que cette machine détient de toi.
          Cette archive <strong>n'est pas restaurable</strong> : elle sert à
          emporter, pas à revenir en arrière.
        </p>
        <a className="btn" href="/api/progress/export-all"><Download size={15} strokeWidth={2} /> Télécharger l'archive complète</a>
      </div>

      <div className="settings-block">
        <h3>Importer / restaurer</h3>
        <p className="muted">Sélectionne une sauvegarde. Elle est validée et prévisualisée avant tout remplacement ; l'état actuel est sauvegardé automatiquement et l'import est atomique.</p>
        {!preview ? (
          <button className="btn" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload size={15} strokeWidth={2} /> Choisir un fichier de sauvegarde
          </button>
        ) : (
          <div className="settings-preview">
            <div className="dpx-eyebrow">Aperçu — remplacera tes données actuelles</div>
            <dl className="settings-stats">
              <div><dt>Parcours</dt><dd>{preview.trackCount}</dd></div>
              <div><dt>Parcours actif</dt><dd>{preview.activeTrackId}</dd></div>
              <div><dt>Workspaces</dt><dd>{preview.workspaceCount}</dd></div>
              <div><dt>Format</dt><dd>{preview.version ? `v${preview.version}` : 'legacy'}</dd></div>
            </dl>
            {preview.warnings.length > 0 && (
              <ul className="settings-warnings">
                {preview.warnings.slice(0, 6).map((w) => <li key={w}><AlertTriangle size={12} /> {w}</li>)}
              </ul>
            )}
            <div className="row" style={{ gap: 8 }}>
              <button className="btn primary" onClick={confirmImport} disabled={busy}><Check size={15} strokeWidth={2} /> Remplacer par cette sauvegarde</button>
              <button className="btn ghost" onClick={() => { setPreview(null); setRaw(null); }} disabled={busy}>Annuler</button>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} style={{ display: 'none' }} />
      </div>

      <div className="settings-block danger">
        <h3>Réinitialiser ma progression</h3>
        <p className="muted">
          Remet à zéro la progression : statuts, auto-évaluations, réponses,
          notes, compétences et revues.
          <strong> Ce n'est pas une suppression.</strong> Un instantané de
          l'état actuel est conservé côté serveur, et tes workspaces ainsi que
          tes journaux de tentatives — donc ton code — restent intacts. Pour tout
          effacer pour de bon, utilise « Supprimer toutes mes données ».
        </p>
        {!confirmReset ? (
          <button className="btn" onClick={() => { setConfirmReset(true); setMsg(''); }}>
            <RotateCcw size={14} strokeWidth={2} /> Réinitialiser la progression
          </button>
        ) : (
          <div className="settings-confirm">
            <p><strong>Confirmer ?</strong> La progression repart de zéro. L'état actuel est conservé dans un instantané de secours ; ton code n'est pas touché.</p>
            <div className="row" style={{ gap: 8 }}>
              <a className="btn small" href="/api/progress/export"><Download size={14} /> Exporter d'abord</a>
              <button className="btn small danger-btn" onClick={doReset} disabled={busy}>Oui, réinitialiser la progression</button>
              <button className="btn small ghost" onClick={() => setConfirmReset(false)} disabled={busy}>Annuler</button>
            </div>
          </div>
        )}
      </div>

      <div className="settings-block danger">
        <h3>Supprimer toutes mes données</h3>
        <p className="muted">
          Efface <strong>définitivement</strong> tout ce que cette machine détient
          de toi : progression, instantané de secours, workspaces du Laboratoire
          et journaux de tentatives — <strong>y compris le code que tu as
          écrit</strong>. Aucune sauvegarde n'est créée : rien ne sera
          récupérable. Les leçons, les exercices et leurs corrigés ne sont pas
          touchés : ils ne t'appartiennent pas, ils appartiennent au programme.
        </p>
        {!confirmDelete ? (
          <button className="btn" onClick={() => { setConfirmDelete(true); setMsg(''); setDeleteWord(''); }}>
            <Trash2 size={14} strokeWidth={2} /> Supprimer toutes mes données
          </button>
        ) : (
          <div className="settings-confirm">
            <p><strong>Dernière étape.</strong> Saisis <code>{CONFIRMATION_DE_SUPPRESSION}</code> pour confirmer. Exporte l'archive complète d'abord si tu veux garder une trace.</p>
            <input
              className="settings-danger-input"
              type="text"
              value={deleteWord}
              onChange={(e) => setDeleteWord(e.target.value)}
              placeholder={CONFIRMATION_DE_SUPPRESSION}
              aria-label={`Saisis ${CONFIRMATION_DE_SUPPRESSION} pour confirmer la suppression totale`}
            />
            <div className="row" style={{ gap: 8 }}>
              <a className="btn small" href="/api/progress/export-all"><Download size={14} /> Archive complète d'abord</a>
              <button className="btn small danger-btn" onClick={doDeleteAll} disabled={busy || deleteWord.trim() !== CONFIRMATION_DE_SUPPRESSION}>Supprimer définitivement</button>
              <button className="btn small ghost" onClick={() => { setConfirmDelete(false); setDeleteWord(''); }} disabled={busy}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
