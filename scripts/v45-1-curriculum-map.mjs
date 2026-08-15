#!/usr/bin/env node
// V45.1 — CURRICULUM MAP, LECTURE SEULE. Read-model dérivé (aucune 2e source de vérité).
// Reconstruit day→module→track + lesson→skill→pratique. N'écrit que docs/audits/*.json.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LESSONS } from './data/lessons-map.mjs';
import { buildCatalogue } from '../lib/catalogue.mjs';
import { projectSkill } from '../lib/practice-coverage.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const program = JSON.parse(readFileSync(R('data/program.json'), 'utf8'));
const cat = buildCatalogue(program);
const exercises = readdirSync(R('data/exercises')).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(R(`data/exercises/${f}`), 'utf8')));

// exercises per program skill
const exBySkill = {};
for (const e of exercises) for (const s of new Set((e.skills || []).map(projectSkill).filter(Boolean))) (exBySkill[s] ??= []).push(e.id);

// days per skill + per month
const daysBySkill = {}; const daysByMonth = {};
for (const d of program.days || []) { daysBySkill[d.skill] = (daysBySkill[d.skill] || 0) + 1; daysByMonth[d.month] = (daysByMonth[d.month] || 0) + 1; }

const tracks = cat.tracks.map((t) => ({
  id: t.id, status: t.status, title: t.title, totalDays: t.totalDays,
  modules: (t.moduleRefs || []).length, technologies: t.technologies || [],
}));

const lessons = LESSONS.map((l, i) => ({
  order: i + 1, slug: l.file.replace(/\.md$/, ''), cat: l.cat, level: l.level, skills: l.skills || [],
  practiceRefs: (l.practiceRefs || []).map((r) => `${r.kind}:${r.id}`),
  execPractice: (l.skills || []).some((s) => (exBySkill[s] || []).length > 0),
}));

const out = {
  generatedAt: 'V45.1-MAP',
  tracks, modulesCount: Object.keys(cat.modules).length,
  days: { total: (program.days || []).length, byMonth: daysByMonth, bySkill: daysBySkill },
  skills: program.skills.map((s) => ({ id: s.id, name: s.name, exercises: (exBySkill[s.id] || []).length })),
  lessons,
};
writeFileSync(R('docs/audits/V45-1-CURRICULUM-MAP.json'), JSON.stringify(out, null, 2) + '\n');
console.log('Curriculum map →', 'docs/audits/V45-1-CURRICULUM-MAP.json');
console.log('tracks:', tracks.length, '| modules:', out.modulesCount, '| lessons:', lessons.length, '| days:', out.days.total);
console.log('skills with exercises:', out.skills.filter((s) => s.exercises > 0).length, '/', out.skills.length);
