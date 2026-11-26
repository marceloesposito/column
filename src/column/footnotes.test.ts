import { describe, expect, it } from 'vitest';
import { footnotesOf, notePlain, noteParts, sourceNote } from './footnotes';
import { docToMarkdown, markdownToDoc } from './doc';
import { dropBlockDoc } from './tabula/bridge';

describe('note a piè di pagina', () => {
  it('la nota di una fonte ha titolo e indirizzo', () => {
    expect(sourceNote('La Stampa', 'https://www.lastampa.it/a')).toBe('La Stampa, <https://www.lastampa.it/a>');
    expect(sourceNote('', 'https://example.com')).toBe('<https://example.com>');
    expect(sourceNote('https://example.com', 'https://example.com')).toBe('<https://example.com>');
    expect(sourceNote('Un *titolo* [x]', 'https://e.it')).toBe('Un \\*titolo\\* \\[x\\], <https://e.it>');
  });

  it("l'indirizzo sta nella nota e non nel corpo del testo", () => {
    const content = dropBlockDoc({ id: 'b', kind: 'link', text: 'Il Post', url: 'https://www.ilpost.it/x', x: 0, y: 0, w: 0, h: 0 });
    expect(content).toEqual({ type: 'footnote', attrs: { text: 'Il Post, <https://www.ilpost.it/x>' } });
    const md = docToMarkdown({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Come scrive' }, content as never] }] });
    expect(md).toBe('Come scrive[^1]\n\n[^1]: Il Post, <https://www.ilpost.it/x>\n');
    // il Markdown torna uguale e la nota resta una nota
    expect(docToMarkdown(markdownToDoc(md))).toBe(md);
    expect(footnotesOf(markdownToDoc(md))).toEqual(['Il Post, <https://www.ilpost.it/x>']);
  });

  it('elenca le note nell\'ordine del testo', () => {
    const doc = markdownToDoc('Uno[^a] due[^b]\n\n- tre[^c]\n\n[^a]: Prima.\n[^b]: Seconda.\n[^c]: Terza.\n');
    expect(footnotesOf(doc)).toEqual(['Prima.', 'Seconda.', 'Terza.']);
  });

  it('il testo della nota si legge semplice, con i link a parte', () => {
    expect(noteParts('Il Post, <https://www.ilpost.it/x>')).toEqual([
      { text: 'Il Post, ' },
      { text: 'https://www.ilpost.it/x', href: 'https://www.ilpost.it/x' },
    ]);
    expect(noteParts('Una *nota* semplice.')).toEqual([{ text: 'Una nota semplice.' }]);
    expect(notePlain('Il Post, <https://www.ilpost.it/x>')).toBe('Il Post, https://www.ilpost.it/x');
  });
});
