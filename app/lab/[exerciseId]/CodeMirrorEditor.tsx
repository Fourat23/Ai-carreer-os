'use client';

// Éditeur de code réel (CodeMirror 6). Chargé DYNAMIQUEMENT par LabWorkspace
// (next/dynamic, ssr:false) : son bundle n'apparaît que sur /lab/[exerciseId],
// jamais dans les chunks des routes ordinaires. Non contrôlé en interne
// (remonté par clé lors d'un changement de fichier / reset) ; remonte ses
// modifications via onChange.
import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { indentWithTab } from '@codemirror/commands';

const theme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: 'var(--text)', fontSize: '13px', height: '100%' },
  '.cm-content': { fontFamily: 'var(--font-mono)', caretColor: 'var(--accent)' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--faint)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--panel-2) 55%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--muted)' },
  '.cm-selectionBackground, ::selection': { backgroundColor: 'color-mix(in srgb, var(--accent) 28%, transparent)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { overflow: 'auto' },
}, { dark: true });

export default function CodeMirrorEditor({
  value, onChange, readOnly = false,
}: { value: string; onChange: (v: string) => void; readOnly?: boolean }) {
  const host = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          javascript(),
          keymap.of([indentWithTab]),
          theme,
          EditorView.editable.of(!readOnly),
          EditorState.readOnly.of(readOnly),
          EditorView.updateListener.of((u) => { if (u.docChanged) onChangeRef.current(u.state.doc.toString()); }),
        ],
      }),
    });
    return () => view.destroy();
    // Volontairement monté une fois : le parent force un remontage (clé) au
    // changement de fichier ou au reset. Pas de synchronisation de valeur → pas
    // de saut de curseur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={host} className="cm-host" aria-label={readOnly ? 'Fichier en lecture seule' : 'Éditeur de code'} />;
}
