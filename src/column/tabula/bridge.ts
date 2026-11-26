// Ponte fra testo e Tabula: una selezione diventa un estratto (ancorato al punto del testo), un
// blocco rilasciato nel testo diventa paragrafo, immagine o nota a piè di pagina con la fonte.
import type { Editor } from '@tiptap/core';
import { makeAnchor, reanchor, type Anchor } from 'logos/comments/model';
import { flatText } from '../comments/anchors';
import type { Block } from './model';
import { sourceNote } from '../footnotes';

export interface ExcerptData {
  text: string;
  anchor: Anchor;
}

export function excerptFromSelection(editor: Editor): ExcerptData | null {
  const { from, to, empty } = editor.state.selection;
  if (empty) return null;
  const text = editor.state.doc.textBetween(from, to, '\n', ' ').trim();
  if (!text) return null;
  return { text, anchor: makeAnchor(flatText(editor.state.doc), from, to, 'text') };
}

/** Dove sta oggi nel testo il punto da cui viene un estratto (null se il testo non c'e' piu'). */
export function excerptRange(editor: Editor, anchor: Anchor): { from: number; to: number } | null {
  return reanchor(flatText(editor.state.doc), anchor);
}

export function scrollToExcerpt(editor: Editor, anchor: Anchor): boolean {
  const r = excerptRange(editor, anchor);
  if (!r) return false;
  editor.chain().focus().setTextSelection(r).scrollIntoView().run();
  return true;
}

export function dropBlockInText(editor: Editor, json: string, pos?: number) {
  let b: Block;
  try {
    b = JSON.parse(json) as Block;
  } catch {
    return;
  }
  const content = dropBlockDoc(b);
  if (content) editor.chain().focus().insertContentAt(pos ?? editor.state.selection.to, content).run();
}

/** Cosa diventa nel testo un blocco rilasciato: una fonte (link) diventa una nota a piè di pagina. */
export function dropBlockDoc(b: Block): object | object[] | null {
  if (b.kind === 'image' && b.src) return { type: 'figure', attrs: { src: b.src, caption: b.text } };
  if (b.kind === 'link' && b.url) return { type: 'footnote', attrs: { text: sourceNote(b.text, b.url) } };
  const paras = b.text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ type: 'paragraph', content: [{ type: 'text', text: p }] }));
  return paras.length ? paras : null;
}

/** Blocchi ancorati al paragrafo dove sta il cursore (per illuminarli nella vista Entrambi). */
export function blocksAtCursor(editor: Editor, blocks: Block[]): Set<string> {
  const $pos = editor.state.selection.$from;
  const start = $pos.start($pos.depth);
  const end = $pos.end($pos.depth);
  const out = new Set<string>();
  const flat = flatText(editor.state.doc);
  for (const b of blocks) {
    if (b.kind !== 'excerpt' || !b.anchor) continue;
    const r = reanchor(flat, b.anchor);
    if (r && r.from <= end && r.to >= start) out.add(b.id);
  }
  return out;
}
