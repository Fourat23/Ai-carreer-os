#!/usr/bin/env node
// V45.1 — CONTRATS D'APPRENTISSAGE DÉRIVÉS, LECTURE SEULE. N'écrit que docs/audits/*.json.
// BEFORE/LEARN/AFTER/DO/VERIFY/NEXT dérivés du ledger d'audit + ordre curriculaire +
// prérequis déclarés. Aucune nouvelle source de vérité ; aucune modification de leçon.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from './data/lessons-map.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const ledger = JSON.parse(readFileSync(R('docs/audits/V45-1-LESSON-LEDGER.json'), 'utf8')).lessons;
const byslug = new Map(ledger.map((e) => [e.slug, e]));

const contracts = LESSONS.map((l, i) => {
  const slug = l.file.replace(/\.md$/, '');
  const fiche = byslug.get(slug) || {};
  const prev = i > 0 ? LESSONS[i - 1].file.replace(/\.md$/, '') : null;
  const next = i < LESSONS.length - 1 ? LESSONS[i + 1].file.replace(/\.md$/, '') : null;
  const refs = (l.practiceRefs || []).map((r) => `${r.kind}:${r.id}`);
  const hasExec = refs.some((r) => r.startsWith('exercise:'));
  return {
    order: i + 1, slug, title: l.title, domain: l.cat, level: l.level,
    before: `Prérequis : ${prev ? `avoir suivi « ${prev} »` : 'aucun (point d\'entrée)'} + les compétences déclarées dans la leçon.`,
    learn: fiche.justification ? fiche.justification.split('.')[0] + '.' : `Concept central de ${l.title}.`,
    after: `Savoir EXPLIQUER ${l.title.toLowerCase()} avec ses propres mots et son modèle mental.`,
    do: hasExec ? `Résoudre : ${refs.filter((r) => r.startsWith('exercise:')).join(', ')}.`
      : (l.cat || '').includes('carrière') ? 'Produire l\'artefact narratif décrit (README, pitch, plan d\'entretien).'
        : 'PRATIQUE DE CODE EXÉCUTABLE MANQUANTE (dette V46) — pratique inline/simulée uniquement.',
    verify: hasExec ? 'Tests verts sur les exercices reliés + preuve `exercise`.'
      : 'Auto-vérification (checklist de leçon / questions de compréhension) — pas de preuve exécutable.',
    next: next ? `Enchaîner « ${next} » (progression curriculaire).` : 'Fin de séquence.',
    verdict: fiche.verdict || 'CERTIFIED',
    practicable: hasExec,
  };
});

writeFileSync(R('docs/audits/V45-1-LEARNING-CONTRACTS.json'), JSON.stringify({ generatedAt: 'V45.1', count: contracts.length, contracts }, null, 1) + '\n');
const practicable = contracts.filter((c) => c.practicable).length;
console.log(`Contrats dérivés : ${contracts.length} → docs/audits/V45-1-LEARNING-CONTRACTS.json`);
console.log(`Praticables (pratique code reliée) : ${practicable}/${contracts.length} | théorie-seule : ${contracts.length - practicable}`);
