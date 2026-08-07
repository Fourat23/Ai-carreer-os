'use client';
// Analyseur d'architecture cloud (V25 CP3). Trois zones : Architecture / Analyse /
// Contexte. Comparaison problématique↔corrigé (remédiation), « Que faire dans ce
// cas ? » et mapping AWS↔Azure. Tout est calculé côté serveur (route déterministe) ;
// ce composant n'exécute rien, ne contacte aucun cloud. Coût affiché comme FACTICE.
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { AlertOctagon, AlertTriangle, Info, Eye, Cloud, ShieldCheck, RotateCcw, LifeBuoy, Network, KeyRound, Coins } from 'lucide-react';
import { PlaybookView } from '../../security/PlaybookView';

const SEV = {
  blocking: { label: 'Bloquant', icon: AlertOctagon, cls: 'sec-sev-blocking' },
  risk: { label: 'Risque', icon: AlertTriangle, cls: 'sec-sev-risk' },
  warning: { label: 'Avertissement', icon: Info, cls: 'sec-sev-warning' },
  observation: { label: 'Observation', icon: Eye, cls: 'sec-sev-observation' },
} as const;
const DOMAIN_LABEL: Record<string, string> = {
  iam: 'IAM', network: 'Réseau', compute: 'Compute', storage: 'Stockage', database: 'Données',
  observability: 'Observabilité', resilience: 'Résilience', finops: 'FinOps',
};

interface Diagnostic {
  id: string; severity: keyof typeof SEV; domain: string; title: string; explanation: string;
  evidence: string[]; remediation: string; provider: string; confidence: string; real: boolean; simulated: boolean; glossary: string[];
}
interface Cost { total: number; currency: string; byResource: { resourceId: string; kind: string; units: number; unitCost: number; cost: number }[]; simulated: boolean; disclaimer: string }
interface Analysis { diagnostics: Diagnostic[]; summary: { bySeverity: Record<string, number>; byDomain: Record<string, number>; cost: Cost | null; dimensions: string[]; total: number; limits: string[] } }
interface Arch {
  provider: string; region: string; zones: string[];
  resources: { id: string; kind: string; label: string; zone: string | null; public: boolean }[];
  edges: { id: string; from: string; to: string; kind: string }[];
  identities: { id: string; type: string; policyCount: number; hasWildcard: boolean }[];
  network: { cidr: string | null; subnets: { id: string; cidr: string; public: boolean }[] } | null;
}
type Playbook = Record<string, unknown> | null;
type Mapping = { concept: string; aws: string; azure: string };

export default function CloudAnalyzer({
  id, initialArchitecture, initialAnalysis, hasFixed, need, constraints, playbook, dayRefs, providerMap,
}: {
  id: string; initialArchitecture: Arch; initialAnalysis: Analysis; hasFixed: boolean;
  need: string | null; constraints: string[]; playbook: Playbook; dayRefs: number[]; providerMap: Mapping[];
}) {
  const [arch, setArch] = useState<Arch>(initialArchitecture);
  const [analysis, setAnalysis] = useState<Analysis>(initialAnalysis);
  const [mode, setMode] = useState<'problem' | 'fixed'>('problem');
  const [sevFilter, setSevFilter] = useState('');
  const [showPlaybook, setShowPlaybook] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [busy, setBusy] = useState(false);

  const post = useCallback(async (action: string) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/cloud-foundations/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      if (!res.ok) return null;
      return await res.json();
    } finally { setBusy(false); }
  }, [id]);

  const remediate = useCallback(async () => {
    const data = await post('remediate');
    if (data) { setArch(data.architecture); setAnalysis(data.analysis); setMode('fixed'); }
  }, [post]);
  const reset = useCallback(async () => {
    const data = await post('reset');
    if (data) { setArch(data.architecture); setAnalysis(data.analysis); setMode('problem'); }
  }, [post]);

  const diags = sevFilter ? analysis.diagnostics.filter((d) => d.severity === sevFilter) : analysis.diagnostics;
  const cost = analysis.summary.cost;

  return (
    <div>
      <div className={`sec-mode sec-mode-${mode === 'fixed' ? 'fixed' : 'vuln'}`} role="status">
        <Cloud size={15} /> {arch.provider.toUpperCase()} · {arch.region} — État <strong>{mode === 'fixed' ? 'corrigé' : 'problématique'}</strong> — {analysis.summary.total} diagnostic(s). Analyse déterministe locale (pas un scanner cloud).
      </div>

      <div className="pl-filters" style={{ marginBottom: 'var(--sp-3)' }}>
        {hasFixed && mode === 'problem' && <button type="button" className="btn primary" onClick={remediate} disabled={busy}><ShieldCheck size={13} /> Voir l’état corrigé</button>}
        {mode === 'fixed' && <button type="button" className="btn ghost" onClick={reset} disabled={busy}><RotateCcw size={13} /> Revenir au problème</button>}
        {playbook && <button type="button" className="btn ghost" onClick={() => setShowPlaybook((v) => !v)} aria-expanded={showPlaybook}><LifeBuoy size={13} /> Que faire dans ce cas ?</button>}
        {providerMap.length > 0 && <button type="button" className="btn ghost" onClick={() => setShowMap((v) => !v)} aria-expanded={showMap}>AWS ↔ Azure</button>}
      </div>

      <div className="cl-grid cl-grid-3">
        {/* Zone 1 : Architecture. */}
        <section className="cl-col" aria-label="Architecture">
          <h2 className="section-label"><Cloud size={14} /> Architecture ({arch.resources.length})</h2>
          <ul className="cl-res">
            {arch.resources.map((r) => (
              <li key={r.id} className="cl-res-item">
                <strong>{r.label}</strong> <span className="muted">· {r.kind}{r.zone ? ` · ${r.zone}` : ''}</span>
                {r.public && <span className="wb-badge sec-sev-risk">public</span>}
              </li>
            ))}
          </ul>
          {arch.identities.length > 0 && (
            <>
              <h3 className="section-label"><KeyRound size={13} /> Identités (IAM)</h3>
              <ul className="cl-res">
                {arch.identities.map((i) => (
                  <li key={i.id} className="cl-res-item"><strong>{i.id}</strong> <span className="muted">· {i.type} · {i.policyCount} policy</span>{i.hasWildcard && <span className="wb-badge sec-sev-risk">wildcard</span>}</li>
                ))}
              </ul>
            </>
          )}
          {arch.network && (
            <>
              <h3 className="section-label"><Network size={13} /> Réseau {arch.network.cidr ? `· ${arch.network.cidr}` : ''}</h3>
              <ul className="cl-res">
                {(arch.network.subnets ?? []).map((s) => (
                  <li key={s.id} className="cl-res-item"><strong>{s.id}</strong> <span className="muted">· {s.cidr}</span> <span className="wb-badge">{s.public ? 'public' : 'privé'}</span></li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Zone 2 : Analyse. */}
        <section className="cl-col" aria-label="Analyse">
          <h2 className="section-label"><AlertTriangle size={14} /> Analyse</h2>
          <div className="cl-summary">
            <button type="button" className={`cl-sevchip ${!sevFilter ? 'is-on' : ''}`} onClick={() => setSevFilter('')}>tous ({analysis.summary.total})</button>
            {(['blocking', 'risk', 'warning', 'observation'] as const).map((s) => (
              <button key={s} type="button" className={`cl-sevchip ${SEV[s].cls} ${sevFilter === s ? 'is-on' : ''}`} onClick={() => setSevFilter(sevFilter === s ? '' : s)}>
                {SEV[s].label} ({analysis.summary.bySeverity[s] ?? 0})
              </button>
            ))}
          </div>
          <ul className="cl-diags">
            {diags.map((d) => {
              const Icon = SEV[d.severity].icon;
              return (
                <li key={d.id} className={`cl-diag ${SEV[d.severity].cls}`}>
                  <div className="cl-diag-head"><Icon size={14} /> <strong>{d.title}</strong>
                    <span className="wb-badge">{DOMAIN_LABEL[d.domain] ?? d.domain}</span>
                    <span className="wb-badge">confiance {d.confidence}</span>
                    <span className="wb-badge">{d.simulated ? 'simulé' : 'réel'}</span>
                  </div>
                  <p className="cl-diag-exp">{d.explanation}</p>
                  <p className="cl-diag-meta"><strong>Preuve :</strong> {d.evidence.join(', ')}</p>
                  <p className="cl-diag-meta"><strong>Remédiation :</strong> {d.remediation}</p>
                </li>
              );
            })}
            {diags.length === 0 && <li className="muted">Aucun diagnostic{mode === 'fixed' ? ' : l’architecture corrigée est saine.' : '.'}</li>}
          </ul>
          {cost && (
            <div className="cl-cost">
              <h3 className="section-label"><Coins size={13} /> Coût estimé (FACTICE) : {cost.total} {cost.currency}</h3>
              <p className="muted cl-cost-disc">{cost.disclaimer}</p>
            </div>
          )}
          <details className="sec-limits"><summary>Limites de l’analyse (honnêtes)</summary>
            <ul>{analysis.summary.limits.map((l, i) => <li key={i}>{l}</li>)}</ul>
          </details>
        </section>

        {/* Zone 3 : Contexte. */}
        <section className="cl-col" aria-label="Contexte">
          <h2 className="section-label"><Info size={14} /> Contexte</h2>
          {need && <p><strong>Besoin :</strong> {need}</p>}
          {constraints.length > 0 && (
            <div className="sec-pb-block"><strong>Contraintes</strong><ul>{constraints.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
          )}
          {dayRefs.length > 0 && (
            <p className="muted">Théorie liée : {dayRefs.map((d, i) => <span key={d}>{i > 0 ? ' · ' : ''}<Link href={`/day/${d}`}>jour {d}</Link></span>)}</p>
          )}
          {showMap && providerMap.length > 0 && (
            <div className="cl-map">
              <h3 className="section-label">Mapping AWS ↔ Azure (raisonné)</h3>
              <ul className="cl-map-list">
                {providerMap.slice(0, 14).map((m) => (
                  <li key={m.concept}><strong>{m.concept}</strong><br /><span className="muted">AWS :</span> {m.aws}<br /><span className="muted">Azure :</span> {m.azure}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {playbook && showPlaybook && (
        <div style={{ marginTop: 'var(--sp-3)' }}>
          <h2 className="section-label"><LifeBuoy size={14} /> Que faire dans ce cas ? — {String(playbook.situation ?? playbook.title ?? '')}</h2>
          <PlaybookView playbook={playbook} />
        </div>
      )}
    </div>
  );
}
