// Tests de la navigation clavier de grille (lib/grid-nav.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indexCells, nextDay, NAV_KEYS } from '../lib/grid-nav.mjs';

// Grille pleine 3 semaines × 7 jours (jours 1..21), col = (day-1)/7, row = (day-1)%7.
const full = Array.from({ length: 21 }, (_, i) => ({ day: i + 1, col: Math.floor(i / 7), row: i % 7 }));

test('indexCells : dimensions et bornes', () => {
  const idx = indexCells(full);
  assert.equal(idx.cols, 3);
  assert.equal(idx.rows, 7);
  assert.equal(idx.minDay, 1);
  assert.equal(idx.maxDay, 21);
});

test('bas / haut se déplacent dans la semaine (±1 jour)', () => {
  assert.equal(nextDay(full, 1, 'ArrowDown'), 2);
  assert.equal(nextDay(full, 2, 'ArrowUp'), 1);
});

test('droite / gauche se déplacent d\'une semaine (±7 jours)', () => {
  assert.equal(nextDay(full, 1, 'ArrowRight'), 8);
  assert.equal(nextDay(full, 8, 'ArrowLeft'), 1);
});

test('Home / End', () => {
  assert.equal(nextDay(full, 10, 'Home'), 1);
  assert.equal(nextDay(full, 10, 'End'), 21);
});

test('bornes : reste sur place hors grille', () => {
  assert.equal(nextDay(full, 1, 'ArrowUp'), 1);     // rangée 0, pas de haut
  assert.equal(nextDay(full, 1, 'ArrowLeft'), 1);   // colonne 0, pas de gauche
  assert.equal(nextDay(full, 7, 'ArrowDown'), 7);   // dernière rangée
  assert.equal(nextDay(full, 21, 'ArrowRight'), 21);// dernière colonne
});

test('jour 1 et jour 365 (grille réaliste)', () => {
  // 365 jours répartis en semaines de 7 (52 pleines + 1 jour).
  const cells = Array.from({ length: 365 }, (_, i) => ({ day: i + 1, col: Math.floor(i / 7), row: i % 7 }));
  assert.equal(nextDay(cells, 1, 'ArrowUp'), 1);
  assert.equal(nextDay(cells, 1, 'ArrowRight'), 8);
  assert.equal(nextDay(cells, 365, 'End'), 365);
  assert.equal(nextDay(cells, 365, 'ArrowRight'), 365); // seul dans sa colonne
});

test('grille partielle : traverse les emplacements vides', () => {
  // col 0 : rows 0,1,2 ; col 1 : rows 0 et 2 (row 1 manquant).
  const cells = [
    { day: 1, col: 0, row: 0 }, { day: 2, col: 0, row: 1 }, { day: 3, col: 0, row: 2 },
    { day: 4, col: 1, row: 0 }, { day: 6, col: 1, row: 2 },
  ];
  // depuis jour 2 (col0,row1) → droite : col1,row1 vide → continue ? non, seek va en col2 (hors) → reste.
  assert.equal(nextDay(cells, 2, 'ArrowRight'), 2);
  // depuis jour 4 (col1,row0) → bas : row1 vide en col1 → continue vers row2 = jour 6.
  assert.equal(nextDay(cells, 4, 'ArrowDown'), 6);
});

test('touche non gérée / jour inconnu', () => {
  assert.equal(nextDay(full, 5, 'Enter'), 5);
  assert.equal(nextDay(full, 999, 'ArrowDown'), 1); // inconnu → premier jour
  assert.ok(NAV_KEYS.has('ArrowLeft') && NAV_KEYS.has('End'));
});
