/**
 * V70 — vérification exécutée des affirmations publiées dans
 * curriculum/lessons/frontend-testing.md (exemple guidé).
 *
 * On écrit DEUX tests du même comportement : l'un couplé à l'implémentation
 * (sélecteurs CSS, structure du DOM), l'autre au comportement observable
 * (rôle et nom accessible, texte visible). Puis on remanie le composant SANS
 * changer ce que l'utilisateur voit, et on rejoue les deux tests.
 *
 * Les assertions sont écrites à la main (pas de testing-library : le projet
 * n'en a pas et ce script ne doit rien installer). C'est une limite déclarée :
 * on démontre le principe du couplage, pas l'API d'une bibliothèque.
 *
 * Exécution : node scripts/v70-verifications/frontend-testing-refactor.mjs
 */
import { existsSync } from 'node:fs';
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;

const DIR =
  process.env.REACT18_DIR ||
  '/tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad/r18/node_modules';
if (!existsSync(`${DIR}/react/umd/react.development.js`)) {
  console.error('React 18 UMD introuvable — voir react-usefetch-course.mjs');
  process.exit(1);
}

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

// --- deux versions du MÊME composant, indiscernables pour l'utilisateur ---
const VERSION_1 = `
  function Recherche({ personnes }) {
    const [terme, setTerme] = useState('');
    const resultats = personnes.filter((p) =>
      p.nom.toLowerCase().includes(terme.toLowerCase()));
    return h('div', { className: 'recherche-bloc' }, [
      h('label', { key: 'l', htmlFor: 'q' }, 'Rechercher une personne'),
      h('input', { key: 'i', id: 'q', className: 'input-recherche',
                   value: terme, onChange: (e) => setTerme(e.target.value) }),
      h('ul', { key: 'u', className: 'liste-resultats' },
        resultats.map((p) => h('li', { key: p.id, className: 'ligne' }, p.nom))),
    ]);
  }`;

// remaniement : classes renommées, <ul><li> remplacés par une table,
// wrapper supprimé. Le texte visible et le libellé du champ sont identiques.
const VERSION_2 = `
  function Recherche({ personnes }) {
    const [terme, setTerme] = useState('');
    const resultats = personnes.filter((p) =>
      p.nom.toLowerCase().includes(terme.toLowerCase()));
    return h(React.Fragment, null, [
      h('label', { key: 'l', htmlFor: 'q' }, 'Rechercher une personne'),
      h('input', { key: 'i', id: 'q', className: 'champ',
                   value: terme, onChange: (e) => setTerme(e.target.value) }),
      h('table', { key: 't' },
        h('tbody', null,
          resultats.map((p) => h('tr', { key: p.id }, h('td', null, p.nom))))),
    ]);
  }`;

async function jouer(version) {
  const p = await nav.newPage();
  await p.setContent('<div id="racine"></div>');
  await p.addScriptTag({ path: `${DIR}/react/umd/react.development.js` });
  await p.addScriptTag({ path: `${DIR}/react-dom/umd/react-dom.development.js` });

  return p
    .evaluate(async (src) => {
      const { useState, createElement: h } = React;
      // eslint-disable-next-line no-eval
      const fabrique = new Function('React', 'useState', 'h', src + '; return Recherche;');
      const Recherche = fabrique(React, useState, h);
      const racine = ReactDOM.createRoot(document.getElementById('racine'));
      racine.render(
        h(Recherche, { personnes: [{ id: 1, nom: 'Ada' }, { id: 2, nom: 'Alan' }] }),
      );
      await new Promise((r) => setTimeout(r, 40));

      const taper = async (el, txt) => {
        const setter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, txt);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 40));
      };

      const res = {};

      // ---- TEST A : couplé à l'implémentation ----
      try {
        const champ = document.querySelector('.input-recherche');
        if (!champ) throw new Error('sélecteur .input-recherche introuvable');
        await taper(champ, 'ad');
        const lignes = document.querySelectorAll('.liste-resultats .ligne');
        if (lignes.length !== 1) throw new Error(`attendu 1 ligne, obtenu ${lignes.length}`);
        if (lignes[0].textContent !== 'Ada') throw new Error('texte inattendu');
        res.testA = 'PASSE';
      } catch (e) {
        res.testA = `ÉCHOUE — ${e.message}`;
      }

      // ---- TEST B : couplé au comportement observable ----
      try {
        const label = [...document.querySelectorAll('label')]
          .find((l) => /rechercher une personne/i.test(l.textContent));
        const champ = document.getElementById(label.htmlFor);
        if (!champ) throw new Error('aucun champ nommé « Rechercher une personne »');
        await taper(champ, 'ad');
        const visible = document.body.innerText;
        if (!visible.includes('Ada')) throw new Error('Ada absent du texte visible');
        if (visible.includes('Alan')) throw new Error('Alan encore present dans le texte visible');
        res.testB = 'PASSE';
      } catch (e) {
        res.testB = `ÉCHOUE — ${e.message}`;
      }

      res.texteVisible = document.body.innerText.replace(/\\s+/g, ' ').trim();
      return res;
    }, version)
    .finally(() => p.close());
}

console.log('=== VERSION 1 — le composant d\'origine ===');
console.log(JSON.stringify(await jouer(VERSION_1), null, 1));
console.log('\n=== VERSION 2 — après remaniement, rendu identique pour l\'utilisateur ===');
console.log(JSON.stringify(await jouer(VERSION_2), null, 1));

await nav.close();
