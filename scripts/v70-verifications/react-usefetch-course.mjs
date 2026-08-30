/**
 * V70 — vérification exécutée des affirmations publiées dans
 * curriculum/lessons/react-hooks-effects.md (correction de useFetch).
 *
 * Trois exécutions réelles de React 18 dans Chromium :
 *   1. useFetch SANS garde : la réponse périmée écrase la récente (le bug).
 *   2. useFetch AVEC drapeau de nettoyage : la réponse périmée est ignorée.
 *   3. StrictMode : nombre d'exécutions de l'effet et du nettoyage.
 *
 * Prérequis : react@18 et react-dom@18 installés HORS du projet.
 *   REACT18_DIR=/chemin/vers/node_modules node scripts/v70-verifications/react-usefetch-course.mjs
 *
 * Le projet est en React 19 ; on mesure ici sur React 18 parce que c'est la
 * version dont les builds UMD sont chargeables dans une page vierge sans
 * outil de construction. Le comportement mesuré (ordre nettoyage → effet)
 * est identique sur les deux versions ; c'est une limite déclarée, pas une
 * approximation cachée.
 */
import { existsSync } from 'node:fs';
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;

const DIR =
  process.env.REACT18_DIR ||
  '/tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad/r18/node_modules';
const REACT = `${DIR}/react/umd/react.development.js`;
const REACT_DOM = `${DIR}/react-dom/umd/react-dom.development.js`;

if (!existsSync(REACT) || !existsSync(REACT_DOM)) {
  console.error(
    'React 18 UMD introuvable. Installer hors projet :\n' +
      '  mkdir -p /tmp/r18 && cd /tmp/r18 && npm i react@18.3.1 react-dom@18.3.1\n' +
      '  REACT18_DIR=/tmp/r18/node_modules node scripts/v70-verifications/react-usefetch-course.mjs',
  );
  process.exit(1);
}

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

async function executer({ avecGarde, strict }) {
  const p = await nav.newPage();
  await p.setContent('<div id="racine"></div>');
  await p.addScriptTag({ path: REACT });
  await p.addScriptTag({ path: REACT_DOM });

  const r = await p.evaluate(
    async ({ avecGarde, strict }) => {
      const { useState, useEffect, createElement: h, StrictMode } = React;
      const journal = [];

      // Faux réseau : /lent répond en 300 ms, /rapide en 50 ms.
      const charger = (url) =>
        new Promise((res) =>
          setTimeout(() => res(`données de ${url}`), url === '/lent' ? 300 : 50),
        );

      function useFetch(url) {
        const [etat, setEtat] = useState({ statut: 'chargement', donnees: null });
        useEffect(() => {
          let vivant = true;
          journal.push(`effet ${url}`);
          setEtat({ statut: 'chargement', donnees: null });
          charger(url).then((d) => {
            if (avecGarde && !vivant) {
              journal.push(`ignoré ${url}`);
              return;
            }
            journal.push(`écrit ${url}`);
            setEtat({ statut: 'succès', donnees: d });
          });
          return () => {
            vivant = false;
            journal.push(`nettoyage ${url}`);
          };
        }, [url]);
        return etat;
      }

      let changerUrl;
      function App() {
        const [url, setUrl] = useState('/lent');
        changerUrl = setUrl;
        const { statut, donnees } = useFetch(url);
        return h('p', { id: 'sortie' }, statut === 'succès' ? donnees : '…');
      }

      const racine = ReactDOM.createRoot(document.getElementById('racine'));
      racine.render(strict ? h(StrictMode, null, h(App)) : h(App));

      // laisse le premier effet partir, puis change d'URL avant sa réponse
      await new Promise((r) => setTimeout(r, 30));
      changerUrl('/rapide');
      await new Promise((r) => setTimeout(r, 500));

      return { affiché: document.getElementById('sortie').textContent, journal };
    },
    { avecGarde, strict },
  );
  await p.close();
  return r;
}

console.log('=== 1. SANS garde de nettoyage ===');
const a = await executer({ avecGarde: false, strict: false });
console.log('affiché :', a.affiché);
console.log('journal :', a.journal.join(' | '));

console.log('\n=== 2. AVEC drapeau de nettoyage ===');
const b = await executer({ avecGarde: true, strict: false });
console.log('affiché :', b.affiché);
console.log('journal :', b.journal.join(' | '));

console.log('\n=== 3. AVEC garde, sous StrictMode (mode développement) ===');
const c = await executer({ avecGarde: true, strict: true });
console.log('affiché :', c.affiché);
console.log('journal :', c.journal.join(' | '));

await nav.close();
