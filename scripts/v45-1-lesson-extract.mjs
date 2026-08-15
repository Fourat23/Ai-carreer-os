#!/usr/bin/env node
// V45.1 — AIDE À LA LECTURE, STRICTEMENT LECTURE SEULE. N'écrit que docs/audits/*.json.
// Extrait, par leçon, des SIGNAUX destinés à ACCOMPAGNER (jamais remplacer) la lecture
// humaine du Markdown : sections, mots par section, prérequis déclarés, densité d'exemples,
// blocs de code, practiceRefs. Le verdict académique reste écrit à la main dans le ledger.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from './data/lessons-map.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const meta = new Map(LESSONS.map((l, i) => [l.file, { ...l, order: i + 1 }]));

const out = LESSONS.map((lm) => {
  const f = lm.file;
  const md = readFileSync(R(`curriculum/lessons/${f}`), 'utf8');
  const lines = md.split('\n');
  const sections = [];
  let cur = null;
  for (const line of lines) {
    const m = line.match(/^(#{2,3})\s+(.*)$/);
    if (m) { if (cur) sections.push(cur); cur = { title: m[2].replace(/[#*`]/g, '').trim(), words: 0 }; }
    else if (cur) cur.words += line.split(/\s+/).filter(Boolean).length;
  }
  if (cur) sections.push(cur);
  const m = meta.get(f);
  // Prérequis déclarés : contenu de la section prérequis.
  const preIdx = sections.findIndex((s) => /prérequis|prerequis/i.test(s.title));
  return {
    order: m.order, slug: f.replace(/\.md$/, ''), title: m.title, cat: m.cat, level: m.level,
    minutes: m.min, skills: m.skills || [], practiceRefs: (m.practiceRefs || []).map((r) => `${r.kind}:${r.id}`),
    words: md.split(/\s+/).filter(Boolean).length,
    codeBlocks: (md.match(/```/g) || []).length / 2,
    sectionCount: sections.length,
    sections: sections.map((s) => `${s.title} (${s.words}w)`),
    hasPrereqSection: preIdx >= 0,
  };
});

writeFileSync(R('docs/audits/v45-1-lesson-signals.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Signaux extraits pour ${out.length} leçons → docs/audits/v45-1-lesson-signals.json`);
console.log('Rappel : ces signaux ACCOMPAGNENT la lecture, ils ne la remplacent pas.');
