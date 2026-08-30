/**
 * V70 — vérification exécutée des affirmations publiées dans
 * curriculum/lessons/javascript-basics.md (exemple guidé).
 *
 * Cinq comportements de JavaScript qu'aucune intuition ne donne, tous
 * exécutés dans Node. Aucune dépendance.
 *
 * Exécution : node scripts/v70-verifications/js-pieges.mjs
 */
const l = (expr, valeur) => console.log('  ' + String(expr).padEnd(46) + '-> ' + JSON.stringify(valeur));

console.log('=== 1. les nombres à virgule ===');
l('0.1 + 0.2', 0.1 + 0.2);
l('0.1 + 0.2 === 0.3', 0.1 + 0.2 === 0.3);
l('(0.1 + 0.2).toFixed(20)', (0.1 + 0.2).toFixed(20));
l('19.99 * 100', 19.99 * 100);
l('Math.round(19.99 * 100)', Math.round(19.99 * 100));
l('Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER);
l('9007199254740993 === 9007199254740992', 9007199254740993 === 9007199254740992);

console.log('\n=== 2. le tri par défaut ===');
l('[10, 9, 100, 1].sort()', [10, 9, 100, 1].sort());
l('[10, 9, 100, 1].sort((a,b) => a - b)', [10, 9, 100, 1].sort((a, b) => a - b));
const noms = ['Émile', 'Alice', 'Zoé', 'Édouard'];
l("['Émile','Alice','Zoé','Édouard'].sort()", [...noms].sort());
l('… .sort((a,b) => a.localeCompare(b,\'fr\'))', [...noms].sort((a, b) => a.localeCompare(b, 'fr')));

console.log('\n=== 3. la comparaison lâche ===');
for (const [e, v] of [
  ["'' == 0", '' == 0], ["'0' == 0", '0' == 0], ["'' == '0'", '' == '0'],
  ['[] == false', [] == false], ['null == undefined', null == undefined],
  ['null == 0', null == 0], ['NaN === NaN', NaN === NaN],
]) l(e, v);
l("'' === 0", '' === 0);

console.log('\n=== 4. typeof, et ce qu\'il ne dit pas ===');
for (const [e, v] of [
  ['typeof null', typeof null], ['typeof []', typeof []],
  ['typeof NaN', typeof NaN], ['typeof function(){}', typeof function () {}],
  ['Array.isArray([])', Array.isArray([])],
  ["Object.prototype.toString.call(null)", Object.prototype.toString.call(null)],
]) l(e, v);

console.log('\n=== 5. la copie superficielle, en JS aussi ===');
const original = { nom: 'Lyon', tags: ['ville', 'rhone'] };
const copie = { ...original };
copie.tags.push('MODIFIÉ');
l('original après modification de la copie', original);
l('original.tags === copie.tags', original.tags === copie.tags);
const profonde = structuredClone({ nom: 'Lyon', tags: ['ville', 'rhone'] });
l('structuredClone → tableau partagé ?', profonde.tags === original.tags);
