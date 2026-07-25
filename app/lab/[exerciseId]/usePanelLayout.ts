'use client';

// Gestion de la disposition des panneaux du Workbench : largeurs gauche/droite
// persistées (localStorage), bornées, repli, et réinitialisation. Séparateurs
// ajustables à la souris ET au clavier (flèches). Aucune dépendance externe.
import { useCallback, useEffect, useRef, useState } from 'react';

const KEY = 'lab:layout:v1';
const DEFAULT = { left: 280, right: 360, leftOpen: true, rightOpen: true };
const MIN = 200;
const MAX = 560;
const STEP = 24;

export interface PanelLayout {
  left: number; right: number; leftOpen: boolean; rightOpen: boolean;
}

function clamp(n: number) { return Math.max(MIN, Math.min(MAX, Math.round(n))); }

export function usePanelLayout() {
  const [layout, setLayout] = useState<PanelLayout>(DEFAULT);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setLayout({
          left: clamp(Number(p.left) || DEFAULT.left),
          right: clamp(Number(p.right) || DEFAULT.right),
          leftOpen: p.leftOpen !== false,
          rightOpen: p.rightOpen !== false,
        });
      }
    } catch { /* défauts */ }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(KEY, JSON.stringify(layout)); } catch { /* best-effort */ }
  }, [layout]);

  const setSide = useCallback((side: 'left' | 'right', px: number) => {
    setLayout((l) => ({ ...l, [side]: clamp(px) }));
  }, []);
  const toggle = useCallback((side: 'left' | 'right') => {
    setLayout((l) => ({ ...l, [side === 'left' ? 'leftOpen' : 'rightOpen']: !(side === 'left' ? l.leftOpen : l.rightOpen) }));
  }, []);
  const reset = useCallback(() => setLayout(DEFAULT), []);

  // Poignée souris : renvoie un handler onPointerDown pour un séparateur.
  const dragHandle = useCallback((side: 'left' | 'right') => (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const start = side === 'left' ? layout.left : layout.right;
    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientX - startX;
      setSide(side, side === 'left' ? start + delta : start - delta);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [layout.left, layout.right, setSide]);

  // Clavier : flèches gauche/droite sur le séparateur.
  const keyHandle = useCallback((side: 'left' | 'right') => (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const cur = side === 'left' ? layout.left : layout.right;
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    setSide(side, side === 'left' ? cur + dir * STEP : cur - dir * STEP);
  }, [layout.left, layout.right, setSide]);

  return { layout, setSide, toggle, reset, dragHandle, keyHandle, MIN, MAX };
}
