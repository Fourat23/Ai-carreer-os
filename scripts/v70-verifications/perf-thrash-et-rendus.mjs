/**
 * V70 — vérification exécutée des chiffres publiés dans
 * curriculum/lessons/frontend-performance.md (exemple guidé).
 *
 *   1. Lecture/écriture entrelacées contre lecture groupée puis écriture
 *      groupée, sur 2 000 éléments. Durée mesurée.
 *   2. Nombre de composants re-rendus à chaque frappe, avant et après avoir
 *      déplacé l'état au bon niveau, puis avec memo.
 *
 * Les durées dépendent de la machine : ce qui est publié dans la leçon est
 * le RAPPORT entre les deux, pas la valeur absolue. Le script imprime les
 * deux pour que le lecteur puisse constater l'écart chez lui.
 *
 * Exécution : node scripts/v70-verifications/perf-thrash-et-rendus.mjs
 */
import { existsSync } from 'node:fs';
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;

const DIR =
  process.env.REACT18_DIR ||
  '/tmp/claude-0/-home-user-Ai-carreer-os/79d55860-21ac-5b1a-91c6-5b6622f4a502/scratchpad/r18/node_modules';

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

// ---------- 1. lecture/écriture entrelacées ----------
{
  const p = await nav.newPage({ viewport: { width: 1200, height: 800 } });
  await p.setContent(
    '<style>.b{height:20px;background:#eee;margin:1px}</style>' +
      '<div id="c">' + '<div class="b"></div>'.repeat(2000) + '</div>',
  );
  const r = await p.evaluate(() => {
    const els = [...document.querySelectorAll('.b')];
    const chrono = (f) => { const t = performance.now(); f(); return Math.round((performance.now() - t) * 10) / 10; };

    // entrelacé : je lis, j'écris, je lis, j'écris…
    const entrelace = chrono(() => {
      for (const el of els) el.style.height = el.offsetHeight + 1 + 'px';
    });
    for (const el of els) el.style.height = '';

    // groupé : je lis TOUT, puis j'écris TOUT
    const groupe = chrono(() => {
      const hauteurs = els.map((el) => el.offsetHeight);
      els.forEach((el, i) => (el.style.height = hauteurs[i] + 1 + 'px'));
    });

    return { elements: els.length, entrelaceMs: entrelace, groupeMs: groupe,
             rapport: Math.round((entrelace / groupe) * 10) / 10 };
  });
  console.log('=== 1. lecture/écriture sur le DOM ===');
  console.log(JSON.stringify(r));
  await p.close();
}

// ---------- 2. rendus React ----------
if (existsSync(`${DIR}/react/umd/react.development.js`)) {
  const p = await nav.newPage();
  await p.setContent('<div id="racine"></div>');
  await p.addScriptTag({ path: `${DIR}/react/umd/react.development.js` });
  await p.addScriptTag({ path: `${DIR}/react-dom/umd/react-dom.development.js` });

  const r = await p.evaluate(async () => {
    const { useState, memo, createElement: h } = React;
    const N = 500;
    const donnees = Array.from({ length: N }, (_, i) => ({ id: i, nom: `Personne ${i}` }));
    const compteurs = { sansMemo: 0, avecMemo: 0 };

    const LigneSansMemo = ({ nom }) => { compteurs.sansMemo++; return h('li', null, nom); };
    const LigneAvecMemo = memo(({ nom }) => { compteurs.avecMemo++; return h('li', null, nom); });

    let taper;
    function Ecran({ Ligne, cle }) {
      const [terme, setTerme] = useState('');
      taper = setTerme;
      // la liste ne dépend PAS de terme : c'est le cas « le parent re-rend tout »
      return h('div', null, [
        h('input', { key: 'i', value: terme, onChange: (e) => setTerme(e.target.value) }),
        h('ul', { key: 'u' }, donnees.map((d) => h(Ligne, { key: d.id, nom: d.nom }))),
      ]);
    }

    const attendre = () => new Promise((r) => setTimeout(r, 60));
    const mesurer = async (Ligne, champ) => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      ReactDOM.createRoot(div).render(h(Ecran, { Ligne }));
      await attendre();
      const apresMontage = compteurs[champ];
      taper('a');            // une frappe
      await attendre();
      return { montage: apresMontage, parFrappe: compteurs[champ] - apresMontage };
    };

    const sans = await mesurer(LigneSansMemo, 'sansMemo');
    const avec = await mesurer(LigneAvecMemo, 'avecMemo');
    return { lignes: N, sansMemo: sans, avecMemo: avec };
  });
  console.log('\n=== 2. rendus React pour UNE frappe ===');
  console.log(JSON.stringify(r));
  await p.close();
} else {
  console.log('\n=== 2. ignoré — React 18 UMD introuvable ===');
}

await nav.close();
