/**
 * V70 — vérification exécutée des affirmations publiées dans
 * curriculum/lessons/react-fundamentals.md (correction du mini-Kanban).
 *
 * Trois scénarios, exécutés réellement dans Chromium avec React 18 :
 *   A. mutation du tableau puis setState(memeReference)  → nombre de rendus ?
 *   B. mutation puis setState([...copie])                → nombre de rendus ?
 *   C. nouvelle référence sans mutation                  → nombre de rendus ?
 *
 * Voir l'en-tête de react-usefetch-course.mjs pour l'installation de React 18
 * hors projet et la limite déclarée (mesure sur 18, projet en 19).
 */
import { existsSync } from 'node:fs';
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;

const DIR =
  process.env.REACT18_DIR ||
  '/tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad/r18/node_modules';
const REACT = `${DIR}/react/umd/react.development.js`;
const REACT_DOM = `${DIR}/react-dom/umd/react-dom.development.js`;
if (!existsSync(REACT)) {
  console.error('React 18 UMD introuvable — voir react-usefetch-course.mjs');
  process.exit(1);
}

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});
const p = await nav.newPage();
await p.setContent('<div id="racine"></div>');
await p.addScriptTag({ path: REACT });
await p.addScriptTag({ path: REACT_DOM });

const r = await p.evaluate(async () => {
  const { useState, createElement: h } = React;
  let rendus = 0;
  let actions = {};

  function Tableau() {
    rendus++;
    const [cartes, setCartes] = useState([
      { id: 'c1', titre: 'Écrire la spec', colonne: 'afaire' },
      { id: 'c2', titre: 'Relire le devis', colonne: 'afaire' },
    ]);

    actions.muterMemeRef = () => {
      cartes[0].colonne = 'encours';       // mutation en place
      setCartes(cartes);                   // même référence
    };
    actions.muterPuisCopier = () => {
      cartes[1].colonne = 'encours';       // mutation en place
      setCartes([...cartes]);              // nouvelle référence du tableau
    };
    actions.immuable = () => {
      setCartes((cs) =>
        cs.map((c) => (c.id === 'c1' ? { ...c, colonne: 'fait' } : c)),
      );
    };
    actions.lire = () => cartes.map((c) => `${c.id}:${c.colonne}`).join(',');

    return h(
      'ul',
      { id: 'liste' },
      cartes.map((c) => h('li', { key: c.id }, `${c.titre} → ${c.colonne}`)),
    );
  }

  const racine = ReactDOM.createRoot(document.getElementById('racine'));
  const attendre = () => new Promise((r) => setTimeout(r, 40));

  racine.render(h(Tableau));
  await attendre();
  const base = rendus;
  const lu = () => document.getElementById('liste').textContent;

  const out = { rendusApresMontage: base };

  actions.muterMemeRef();
  await attendre();
  out.A_muterMemeRef = { rendusAjoutes: rendus - base, DOM: lu(), etatReel: actions.lire() };

  const r1 = rendus;
  actions.muterPuisCopier();
  await attendre();
  out.B_muterPuisCopier = { rendusAjoutes: rendus - r1, DOM: lu() };

  const r2 = rendus;
  actions.immuable();
  await attendre();
  out.C_immuable = { rendusAjoutes: rendus - r2, DOM: lu() };

  return out;
});

console.log(JSON.stringify(r, null, 2));
await nav.close();
