/**
 * V70 — vérification exécutée des chiffres publiés dans curriculum/lessons/css-fundamentals.md
 *
 * Deux mesures :
 *   1. Le débordement de 32 px de l'exemple guidé (content-box → border-box).
 *   2. Les valeurs calculées de la pratique « prédire avant de tester ».
 *
 * Rien n'est publié dans la leçon qui ne soit pas imprimé par ce script.
 * Exécution : node scripts/v70-verifications/css-cascade-boxmodel.mjs
 */
import pw from '/home/user/Ai-carreer-os/node_modules/playwright-core/index.js';
const { chromium } = pw;

const nav = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox'],
});

// ---------- 1. Exemple guidé : la barre de défilement horizontale ----------
{
  const p = await nav.newPage({ viewport: { width: 375, height: 700 } });
  await p.setContent(`<style>
    body { margin: 0 }
    .page { width: 100% }
    .carte { width: 100%; padding: 16px; border: 0; background: #eee }
  </style><section class="page"><div class="carte">texte</div></section>`);

  const sonde = () => p.evaluate(() => {
    const debordent = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > document.documentElement.clientWidth) {
        debordent.push(`${el.tagName} ${el.className} ${Math.round(r.right)}`);
      }
    });
    const c = document.querySelector('.carte').getBoundingClientRect();
    return {
      debordent,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      largeurCarte: c.width,
    };
  });

  console.log('=== 1. Exemple guidé — fenêtre 375 px ===');
  console.log('content-box (défaut) :', JSON.stringify(await sonde()));
  await p.addStyleTag({ content: '*,*::before,*::after{box-sizing:border-box}' });
  console.log('border-box           :', JSON.stringify(await sonde()));
  await p.close();
}

// ---------- 2. Pratique : prédire les valeurs calculées ----------
{
  const p = await nav.newPage({ viewport: { width: 1024, height: 700 } });
  await p.setContent(`<style>
    *, *::before, *::after { box-sizing: border-box; }
    html { font-size: 16px; }
    body { margin: 0; }

    main            { width: 300px; color: #333333; }
    .panneau        { color: #00aa00; padding: 1rem; }
    .sombre .carte  { background: #222222; color: #eeeeee; }
    .carte          { background: #ffffff; color: #111111;
                      width: 100%; padding: 24px; border: 2px solid #000000; }
    #app .carte     { padding: 8px; }
    .carte[data-etat="actif"] { border-width: 6px; }
    article.carte   { width: 320px; }
    h2              { font-size: 2em; }
    .titre          { font-size: 1.5rem; }
  </style>
  <main id="app">
    <section class="panneau sombre">
      <article class="carte" data-etat="actif">
        <h2 class="titre">Rapport</h2>
        <p class="texte">Contenu</p>
      </article>
    </section>
  </main>`);

  const r = await p.evaluate(() => {
    const g = (sel) => getComputedStyle(document.querySelector(sel));
    const b = (sel) => document.querySelector(sel).getBoundingClientRect();
    const carte = g('.carte');
    return {
      carte_background: carte.backgroundColor,
      carte_color: carte.color,
      carte_padding: carte.padding,
      carte_borderWidth: carte.borderTopWidth,
      carte_width_computed: carte.width,
      carte_largeur_occupee: b('.carte').width,
      carte_largeur_contenu:
        b('.carte').width -
        parseFloat(carte.paddingLeft) * 2 -
        parseFloat(carte.borderLeftWidth) * 2,
      p_color: g('.texte').color,
      h2_fontSize: g('.titre').fontSize,
      main_largeur: b('main').width,
      panneau_largeur_contenu:
        b('.panneau').width - parseFloat(g('.panneau').paddingLeft) * 2,
      depassement_carte_vs_main: b('.carte').right - b('main').right,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });

  console.log('\n=== 2. Pratique — valeurs calculées mesurées ===');
  for (const [k, v] of Object.entries(r)) console.log(String(k).padEnd(28), v);
  await p.close();
}

await nav.close();
