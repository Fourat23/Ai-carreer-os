// V77.1 · CP5 — CE QUE LE PARTICIPANT VOIT VRAIMENT.
//
// Le CP4 a traversé la boucle en HTTP. Un humain, lui, ne poste pas de commande :
// il regarde une page et cherche le bouton. Ce script ouvre les quatre surfaces
// du protocole dans un vrai navigateur et relève ce qui est RÉELLEMENT visible —
// titres, boutons, champs — pour que la procédure du CP5 décrive le produit et
// non l'idée qu'on s'en fait.
//
// Il ne clique presque rien : il constate. Les décisions restent au document.

import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://127.0.0.1:3215';
const SORTIE = process.argv[3] ?? 'docs/v77-1/cp5-ux.json';

const SURFACES = [
  { id: 'LESSON', url: '/doc/lessons/api-production-contracts', etape: 2 },
  { id: 'LAB', url: '/lab/http-rate-limit-decide', etape: '3-6' },
  { id: 'RETENTION', url: '/retention', etape: '1, 7, 8' },
  { id: 'TRANSFER', url: '/transfer/throttling-everywhere', etape: 9 },
  { id: 'SETTINGS', url: '/settings', etape: 11 },
];

const rapport = { base: BASE, surfaces: [] };

// Le navigateur pré-installé de l'environnement. La version de `@playwright/test`
// du dépôt n'est pas celle de l'image : on pointe le binaire, on ne télécharge rien.
const CHROME = process.env.AICOS_CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const nav = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await nav.newPage({ viewport: { width: 1280, height: 900 } });

for (const s of SURFACES) {
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(String(e)));
  const rep = await page.goto(`${BASE}${s.url}`, { waitUntil: 'networkidle' }).catch((e) => ({ status: () => 0, err: String(e) }));
  await page.waitForTimeout(600);

  const releve = await page.evaluate(() => {
    const txt = (el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    return {
      titre: document.title,
      h1: [...document.querySelectorAll('h1')].map(txt),
      h2: [...document.querySelectorAll('h2')].map(txt).slice(0, 14),
      boutons: [...document.querySelectorAll('button, a.btn, [role="button"]')]
        .map((b) => ({ texte: txt(b), desactive: b.hasAttribute('disabled') }))
        .filter((b) => b.texte).slice(0, 30),
      champs: [...document.querySelectorAll('input, textarea, select')]
        .map((i) => ({ type: i.getAttribute('type') ?? i.tagName.toLowerCase(), label: i.getAttribute('aria-label') ?? i.getAttribute('placeholder') ?? '' }))
        .slice(0, 20),
      vide: txt(document.body).length < 200,
      mots: txt(document.body).split(' ').length,
    };
  }).catch((e) => ({ erreur: String(e) }));

  rapport.surfaces.push({ ...s, status: typeof rep?.status === 'function' ? rep.status() : null, erreursJs: erreurs, ...releve });
  console.log(`${s.id.padEnd(10)} ${String(rapport.surfaces.at(-1).status).padEnd(4)} ${releve.mots ?? '?'} mots · ${(releve.boutons ?? []).length} boutons · ${(releve.champs ?? []).length} champs · ${erreurs.length} erreur(s) JS`);
  for (const b of (releve.boutons ?? []).slice(0, 8)) console.log(`             « ${b.texte} »${b.desactive ? ' (désactivé)' : ''}`);
}

await nav.close();
writeFileSync(SORTIE, `${JSON.stringify(rapport, null, 2)}\n`);
console.log(`\n→ ${SORTIE}`);
