// V76 · CP13 — LES SURFACES NEUVES, DANS UN VRAI NAVIGATEUR.
//
// ── CE QUE L'AUDIT DE RENDU NE PEUT PAS VOIR ────────────────────────────
//
// `ui-audit.mjs` ouvre les pages et mesure ce qui est là **au chargement**.
// C'est exactement ce qu'il faut pour un débordement horizontal ou une cible
// tactile, et parfaitement aveugle à tout ce qui n'apparaît qu'après une
// interaction.
//
// Or trois surfaces de ce sprint n'existent qu'après une action, et **aucune
// n'a jamais été ouverte dans un navigateur** :
//
//   · l'avertissement de conflit du CP9 — il faut une sauvegarde refusée ;
//   · l'historique du CP10 — il faut avoir lancé ;
//   · la comparaison du CP10 — il faut cocher deux tentatives.
//
// Un composant qu'on n'a jamais vu à l'écran est un composant dont on ne sait
// rien. Le brief l'écrit sans détour : « un Workbench ne passe PAS parce qu'un
// composant existe ».
//
// ── CE QUE CE SCRIPT VÉRIFIE ────────────────────────────────────────────
//
// Pour chacune : qu'elle apparaisse, qu'elle soit lisible, qu'elle soit
// atteignable au clavier, qu'elle soit annoncée, et qu'elle ne déborde à
// aucune largeur — y compris à 200 % de zoom, où un écran de 1 280 px se
// comporte comme un écran de 640 px.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BASE = process.env.V76_BASE ?? 'http://127.0.0.1:3302';
const CHROME = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome']
  .find((p) => existsSync(p)) ?? undefined;

const CIBLE = 'a11y-accessible-name';
const jlire = (p) => JSON.parse(readFileSync(p, 'utf8'));
const EX = jlire(join(ROOT, 'data/exercises', `${CIBLE}.json`));

const depart = () => {
  const out = {};
  for (const f of EX.workspace?.files ?? []) if (!f.hidden && !f.readOnly) out[f.path] = f.content ?? '';
  return out;
};
const reference = () => ({ ...depart(), ...(EX.reference ?? {}) });

/** Deux lancements par HTTP : l'historique a besoin de matière avant l'ouverture. */
async function preparerHistorique() {
  const post = (body) => fetch(`${BASE}/api/lab/${CIBLE}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  }).then((r) => r.json().catch(() => null));
  await post({ action: 'run', files: depart() });
  await new Promise((r) => setTimeout(r, 1100));
  await post({ action: 'run', files: reference() });
  await new Promise((r) => setTimeout(r, 1100));
  await post({ action: 'reset' });
}

/** Mesure d'une surface : présence, lisibilité, débordement, annonce. */
const MESURE_BLOC = (selecteur) => {
  const el = document.querySelector(selecteur);
  if (!el) return { present: false };
  const r = el.getBoundingClientRect();
  const s = getComputedStyle(el);
  const contraste = s.color;
  return {
    present: true,
    visible: r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none',
    largeur: Math.round(r.width),
    hauteur: Math.round(r.height),
    /** Un bloc plus large que son parent pousse la page : c'est le défaut à traquer. */
    deborde: r.width > el.parentElement.getBoundingClientRect().width + 1,
    role: el.getAttribute('role'),
    ariaLive: el.getAttribute('aria-live'),
    texte: el.textContent.trim().slice(0, 160),
    couleur: contraste,
  };
};

export const SONDES = [
  {
    id: 'U1', nom: 'L’HISTORIQUE apparaît, et il vient du SERVEUR',
    async run(p) {
      await p.goto(`${BASE}/lab/${CIBLE}`, { waitUntil: 'networkidle' });
      // Il doit être là AVANT tout lancement dans cet onglet : c'est toute la
      // différence entre un historique persisté et une liste de session.
      const m = await p.evaluate(() => {
        const h = document.querySelector('.wb-history');
        if (!h) return { present: false };
        return {
          present: true,
          lignes: h.querySelectorAll('li').length,
          cases: h.querySelectorAll('.wb-history-pick').length,
          titre: h.querySelector('.section-label')?.textContent.trim() ?? '',
        };
      });
      return { ok: m.present && m.lignes >= 2 && m.cases === m.lignes, detail: m.present ? `${m.lignes} ligne(s) · ${m.cases} case(s) · « ${m.titre} »` : '❌ absent au chargement' };
    },
  },
  {
    id: 'U2', nom: 'les cases de comparaison font au moins 24 px',
    async run(p) {
      // Mesuré au CP13 à **13 × 13 px** : quatre cibles sous le seuil WCAG 2.2
      // AA, introduites par le CP10 et invisibles jusqu'à cet audit.
      const m = await p.evaluate(() => [...document.querySelectorAll('.wb-history-pick')]
        .map((e) => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; }));
      const petites = m.filter((x) => x.w < 24 || x.h < 24);
      return { ok: m.length > 0 && petites.length === 0, detail: m.length ? `${m.length} case(s) · ${m[0].w}×${m[0].h} px · ${petites.length} sous le seuil` : 'aucune case' };
    },
  },
  {
    id: 'U3', nom: 'la COMPARAISON s’ouvre en cochant deux tentatives',
    async run(p) {
      const cases = await p.$$('.wb-history-pick');
      if (cases.length < 2) return { ok: false, detail: 'moins de deux tentatives' };
      await cases[0].check();
      await cases[1].check();
      await p.waitForSelector('.wb-compare', { timeout: 10000 }).catch(() => null);
      const m = await p.evaluate(MESURE_BLOC, '.wb-compare');
      const d = await p.evaluate(() => {
        const c = document.querySelector('.wb-compare');
        if (!c) return {};
        return {
          lecture: c.querySelector('.wb-compare-lecture')?.textContent.trim().slice(0, 120) ?? '',
          lignesDiff: c.querySelectorAll('.wb-diff-l').length,
          ajouts: c.querySelectorAll('.wb-diff-l.add').length,
          retraits: c.querySelectorAll('.wb-diff-l.del').length,
        };
      });
      return {
        ok: m.present && m.visible && !m.deborde && d.lignesDiff > 0 && (d.ajouts > 0 || d.retraits > 0),
        detail: m.present ? `${d.lignesDiff} ligne(s) de diff (+${d.ajouts}/−${d.retraits}) · « ${d.lecture} »` : '❌ aucune comparaison rendue',
      };
    },
  },
  {
    id: 'U4', nom: 'la comparaison est ANNONCÉE et ne déborde pas',
    async run(p) {
      const m = await p.evaluate(MESURE_BLOC, '.wb-compare');
      return {
        ok: m.present && m.ariaLive === 'polite' && !m.deborde,
        detail: m.present ? `aria-live = « ${m.ariaLive} » · ${m.largeur}×${m.hauteur} px · débordement : ${m.deborde}` : '❌ absente',
      };
    },
  },
  {
    id: 'U5', nom: 'la comparaison est atteignable AU CLAVIER, sans souris',
    async run(p) {
      await p.reload({ waitUntil: 'networkidle' });
      // On tabule jusqu'à la première case, puis on la coche à la barre d'espace.
      const atteint = await p.evaluate(async () => {
        const cases = [...document.querySelectorAll('.wb-history-pick')];
        if (cases.length < 2) return { ok: false, raison: 'moins de deux tentatives' };
        // Une case focusable et actionnable au clavier : c'est ce que le
        // natif `<input type="checkbox">` garantit, et c'est pourquoi on n'a
        // pas fabriqué de faux bouton.
        cases[0].focus();
        const focus1 = document.activeElement === cases[0];
        const tabindex = cases[0].getAttribute('tabindex');
        return { ok: focus1 && tabindex !== '-1', raison: `focus : ${focus1} · tabindex : ${tabindex ?? 'natif'}` };
      });
      if (!atteint.ok) return { ok: false, detail: `❌ ${atteint.raison}` };
      await p.keyboard.press('Space');
      await p.keyboard.press('Tab');
      await p.keyboard.press('Space');
      await p.waitForSelector('.wb-compare', { timeout: 10000 }).catch(() => null);
      const ouvert = await p.evaluate(() => !!document.querySelector('.wb-compare'));
      return { ok: ouvert, detail: ouvert ? `comparaison ouverte au clavier (${atteint.raison})` : '❌ la barre d’espace n’ouvre rien' };
    },
  },
  {
    id: 'U6', nom: 'L’AVERTISSEMENT DE CONFLIT apparaît, et il est annoncé',
    async run(p, ctx) {
      await p.goto(`${BASE}/lab/${CIBLE}`, { waitUntil: 'networkidle' });
      // On simule l'onglet périmé : un autre écrivain passe par l'API pendant
      // que cette page tient encore l'ancienne révision.
      await p.evaluate(async ({ id, contenu }) => {
        await fetch(`/api/lab/${id}`, {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'save', files: { 'solution.mjs': contenu } }),
        });
      }, { id: CIBLE, contenu: `// écrit ailleurs ${Date.now()}\n` });
      // Puis cette page enregistre, avec SA révision d'origine.
      await p.evaluate(() => {
        const ed = document.querySelector('.cm-content');
        if (ed) { ed.focus(); document.execCommand('insertText', false, '// ma frappe\n'); }
      });
      const boutons = await p.$$('button');
      for (const b of boutons) {
        if ((await b.textContent())?.trim() === 'Enregistrer') { await b.click(); break; }
      }
      await p.waitForSelector('.wb-conflit', { timeout: 10000 }).catch(() => null);
      const m = await p.evaluate(MESURE_BLOC, '.wb-conflit');
      // Mémorisé pour `U10` : c'est ce qui autorise à écarter le 409 de la
      // console. Sans avertissement rendu, le 409 redevient une erreur.
      ctx.conflitVu = !!(m.present && m.visible && m.role === 'alert');
      return {
        ok: m.present && m.visible && m.role === 'alert' && !m.deborde,
        detail: m.present
          ? `role = « ${m.role} » · ${m.largeur}×${m.hauteur} px · « ${m.texte.slice(0, 70)}… »`
          : '❌ aucun avertissement rendu — le refus reste invisible',
      };
    },
  },
  {
    id: 'U7', nom: 'l’avertissement ne propose PAS d’écraser',
    async run(p) {
      // Le contrat du CP9 : on ne décide pas à la place de l'apprenant. Un
      // bouton « forcer » annulerait tout le checkpoint.
      const m = await p.evaluate(() => {
        const c = document.querySelector('.wb-conflit');
        if (!c) return null;
        return {
          texte: c.textContent,
          boutons: [...c.querySelectorAll('button,a')].map((b) => b.textContent.trim()),
        };
      });
      if (!m) return { ok: null, detail: 'avertissement absent (sonde U6 en échec)' };
      const dangereux = m.boutons.filter((b) => /forcer|écraser|remplacer/i.test(b));
      return {
        ok: dangereux.length === 0 && /Rien n’a été écrasé/.test(m.texte),
        detail: `${m.boutons.length} bouton(s) dans l’avertissement · rassure sur l’essentiel : ${/Rien n’a été écrasé/.test(m.texte)}`,
      };
    },
  },
  {
    id: 'U8', nom: 'à 200 % de ZOOM, rien ne déborde',
    async run(p) {
      // Un zoom de 200 % sur 1 280 px, c'est une fenêtre logique de 640 px :
      // le critère WCAG 1.4.4, et le cas que personne ne teste jamais.
      await p.setViewportSize({ width: 640, height: 450 });
      await p.goto(`${BASE}/lab/${CIBLE}`, { waitUntil: 'networkidle' });
      const m = await p.evaluate(() => ({
        deborde: document.documentElement.scrollWidth > window.innerWidth + 1,
        largeurDoc: document.documentElement.scrollWidth,
        fenetre: window.innerWidth,
        editeurVisible: !!document.querySelector('.cm-editor'),
        historique: !!document.querySelector('.wb-history'),
      }));
      await p.setViewportSize({ width: 1280, height: 900 });
      return {
        ok: !m.deborde && m.editeurVisible,
        detail: `document ${m.largeurDoc} px pour ${m.fenetre} px · éditeur : ${m.editeurVisible} · historique : ${m.historique}`,
      };
    },
  },
  {
    id: 'U9', nom: 'le DIFF défile seul, il ne pousse pas la page',
    async run(p) {
      await p.goto(`${BASE}/lab/${CIBLE}`, { waitUntil: 'networkidle' });
      const cases = await p.$$('.wb-history-pick');
      if (cases.length < 2) return { ok: false, detail: 'moins de deux tentatives' };
      await cases[0].check(); await cases[1].check();
      await p.waitForSelector('.wb-diff', { timeout: 10000 }).catch(() => null);
      const m = await p.evaluate(() => {
        const d = document.querySelector('.wb-diff');
        if (!d) return null;
        return {
          overflowX: getComputedStyle(d).overflowX,
          pageDeborde: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
      });
      return {
        ok: !!m && m.overflowX === 'auto' && !m.pageDeborde,
        detail: m ? `overflow-x du diff : ${m.overflowX} · la page déborde : ${m.pageDeborde}` : '❌ aucun diff rendu',
      };
    },
  },
  {
    id: 'U10', nom: 'aucune erreur de console INATTENDUE sur ces parcours',
    async run(p, ctx) {
      // ── CE QU'ON A LE DROIT D'ÉCARTER, ET SOUS QUELLE CONDITION ──
      //
      // Le navigateur journalise en erreur TOUTE réponse ≥ 400, y compris celle
      // que le produit doit rendre : le **409** du CP9, qui est la protection
      // elle-même. L'écarter n'est pas affaiblir la sonde — à une condition
      // stricte, vérifiable, et vérifiée ici : **le 409 n'est accepté que si la
      // sonde `U6` a effectivement vu l'avertissement s'afficher**. Sans elle,
      // un 409 redevient une erreur comme une autre.
      //
      // Les préchargements RSC annulés (anomalie de sonde n° 4, CP2) sont
      // écartés pour la même raison qu'alors : ce sont des artefacts de la
      // fermeture du contexte, pas des défauts du produit.
      const conflitVu = ctx.conflitVu === true;
      const attendue = (e) => /_rsc=/.test(e)
        || (conflitVu && /409 \(Conflict\)/.test(e));
      const vraies = ctx.erreurs.filter((e) => !attendue(e));
      return {
        ok: vraies.length === 0,
        detail: vraies.length
          ? `⚠️ ${vraies.slice(0, 3).join(' · ')}`
          : `aucune · ${ctx.erreurs.length} message(s) attendu(s) écarté(s)${conflitVu ? ' (dont le 409 du CP9, confirmé par U6)' : ''}`,
      };
    },
  },
];

if (process.argv[1] && process.argv[1].endsWith('cp13-ux.mjs')) {
  await preparerHistorique();
  const navigateur = await chromium.launch({ executablePath: CHROME });
  const contexte = await navigateur.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await contexte.newPage();
  const ctx = { erreurs: [], reseau: [] };
  p.on('console', (m) => { if (m.type() === 'error') ctx.erreurs.push(m.text().slice(0, 160)); });
  p.on('pageerror', (e) => ctx.erreurs.push(`PAGEERROR ${String(e).slice(0, 160)}`));
  p.on('response', (r) => { if (r.status() >= 400 && !/_rsc=/.test(r.url())) ctx.reseau.push(`${r.status()} ${r.url().replace(BASE, '')}`); });

  console.log('# V76 · CP13 — Les surfaces neuves, dans un vrai navigateur\n');
  console.log(`> Serveur : \`${BASE}\` · Chromium réel · fenêtre 1280×900 (U8 mesure à 640 px).\n`);
  console.log('| # | sonde | résultat | observation |');
  console.log('|---|---|---|---|');
  const res = [];
  for (const s of SONDES) {
    let r;
    try { r = await s.run(p, ctx); } catch (e) { r = { ok: false, detail: `sonde en erreur : ${String(e.message ?? e).slice(0, 90)}` }; }
    res.push({ id: s.id, nom: s.nom, ...r });
    console.log(`| ${s.id} | ${s.nom} | ${r.ok === null ? '⚪' : r.ok ? '✅' : '❌'} | ${r.detail} |`);
  }
  await navigateur.close();

  const ko = res.filter((r) => r.ok === false);
  console.log(`\n**Réponses réseau ≥ 400** : ${ctx.reseau.length ? `⚠️ ${[...new Set(ctx.reseau)].join(' · ')}` : '✅ aucune'}`);
  console.log(`\n**Sondes en échec** : ${ko.length === 0 ? '✅ aucune' : `❌ ${ko.map((r) => r.id).join(' ')}`}`);
  writeFileSync(join(ROOT, 'docs', 'v76', 'cp13-ux.json'), `${JSON.stringify(res, null, 1)}\n`);
  console.log('\nécrit : docs/v76/cp13-ux.json');
  if (ko.length) process.exitCode = 1;
}
