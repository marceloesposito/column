// Note a piè di pagina del Copy: la nota di una fonte (un link delle Clips rilasciato nel testo),
// l'elenco delle note nell'ordine del testo e il loro testo semplice per l'elenco in fondo.
import type { PMNode } from 'logos/doc/types';
import { parseMarkdown } from 'logos/doc/parse';
import { escapeText } from 'logos/doc/serialize';

/** Testo (Markdown) della nota per una fonte: "Titolo, <indirizzo>", o il solo indirizzo. */
export function sourceNote(title: string, url: string): string {
  const u = url.trim();
  const tt = title.trim().replace(/\s+/g, ' ');
  const link = `<${u}>`;
  return tt && tt !== u ? `${escapeText(tt)}, ${link}` : link;
}

/** Testi delle note nell'ordine in cui compaiono (lo stesso della numerazione nel testo). */
export function footnotesOf(doc: PMNode): string[] {
  const out: string[] = [];
  const walk = (n: PMNode) => {
    if (n.type === 'footnote') out.push(String(n.attrs?.text ?? ''));
    n.content?.forEach(walk);
  };
  walk(doc);
  return out;
}

export interface NotePart {
  text: string;
  href?: string;
}

/** Il Markdown di una nota come pezzi di testo semplice, con gli indirizzi dei link a parte. */
export function noteParts(md: string): NotePart[] {
  const parts: NotePart[] = [];
  const push = (p: NotePart) => {
    const last = parts[parts.length - 1];
    if (last && !last.href && !p.href) last.text += p.text;
    else parts.push(p);
  };
  const walk = (n: PMNode) => {
    if (n.type === 'text') {
      const link = n.marks?.find((m) => m.type === 'link');
      push(link ? { text: n.text ?? '', href: String(link.attrs?.href ?? '') } : { text: n.text ?? '' });
    } else if (n.type === 'hardBreak') push({ text: ' ' });
    n.content?.forEach((c, i) => {
      if (i > 0 && n.type === 'doc') push({ text: ' ' });
      walk(c);
    });
  };
  walk(parseMarkdown(md));
  return parts;
}

/** La nota come testo semplice (per il suggerimento sul richiamo). */
export function notePlain(md: string): string {
  return noteParts(md)
    .map((p) => p.text)
    .join('')
    .trim();
}
