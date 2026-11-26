// Note in fondo al Copy: l'elenco numerato delle note a piè di pagina, nell'ordine dei richiami.
// Si vede anche nella stampa (PDF). Un clic su una nota la modifica.
import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { PMNode } from 'logos/doc/types';
import { footnotesOf, noteParts } from '../footnotes';
import { promptDialog } from '../../components/confirm';
import { platform } from '../../platform';
import { t } from '../../i18n';

/** Posizione della n-esima nota nel documento dell'editor. */
function footnotePos(editor: Editor, index: number): number | null {
  let i = 0;
  let at: number | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (at !== null) return false;
    if (node.type.name === 'footnote' && i++ === index) at = pos;
    return true;
  });
  return at;
}

export function FootnoteList({ editor }: { editor: Editor }) {
  const [notes, setNotes] = useState<string[]>(() => footnotesOf(editor.getJSON() as PMNode));
  useEffect(() => {
    const update = () => {
      const next = footnotesOf(editor.getJSON() as PMNode);
      setNotes((prev) => (prev.length === next.length && prev.every((n, i) => n === next[i]) ? prev : next));
    };
    update();
    editor.on('update', update);
    return () => {
      editor.off('update', update);
    };
  }, [editor]);

  if (!notes.length) return null;

  const edit = async (index: number) => {
    const next = await promptDialog(t('footnote.edit'), notes[index]);
    const pos = footnotePos(editor, index);
    if (next === null || pos === null) return;
    editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { text: next }));
  };

  return (
    <section className="fx-footnotes" aria-label={t('footnote.list')}>
      <ol>
        {notes.map((n, i) => (
          <li key={i}>
            <button type="button" className="fx-footnotes__note" title={t('footnote.edit')} onClick={() => void edit(i)}>
              {noteParts(n).map((p, j) =>
                p.href ? (
                  <a
                    key={j}
                    href={p.href}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void platform.openExternal(p.href!);
                    }}
                  >
                    {p.text}
                  </a>
                ) : (
                  <span key={j}>{p.text}</span>
                ),
              )}
              {!n.trim() && <span className="fx-footnotes__empty">{t('footnote.empty')}</span>}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
