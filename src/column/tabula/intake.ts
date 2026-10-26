// Cosa diventa un blocco nei Clips quando si incolla (Cmd/Ctrl+V) o si trascina dentro qualcosa:
// immagini -> blocchi immagine, file di testo -> note, indirizzi -> link (con embed se il servizio
// e' riconosciuto), il resto del testo -> una nota. Solo dati: la lettura dei file sta nella vista.

export interface IntakeInput {
  text?: string;
  /** text/uri-list: un indirizzo per riga, # per i commenti */
  uriList?: string;
  html?: string;
  files?: { name: string; type: string }[];
}

export type Intake =
  | { kind: 'image'; file: number }
  | { kind: 'textFile'; file: number }
  | { kind: 'link'; url: string; title: string }
  | { kind: 'note'; text: string };

export const IMAGE_FILE = /\.(png|jpe?g|gif|webp|svg)$/i;
const TEXT_FILE = /\.(txt|md|markdown)$/i;

/** Un indirizzo web da solo ("www." diventa https://), altrimenti null. */
export function asUrl(s: string): string | null {
  const v = s.trim();
  if (!v || /\s/.test(v)) return null;
  const withScheme = /^www\./i.test(v) ? `https://${v}` : v;
  try {
    const u = new URL(withScheme);
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.') ? withScheme : null;
  } catch {
    return null;
  }
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function plain(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(#\d+|[a-z]+);/gi, (m, e: string) => (e[0] === '#' ? String.fromCharCode(Number(e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? m)))
    .replace(/\s+/g, ' ')
    .trim();
}

/** Le ancore dell'HTML copiato: indirizzo e testo. */
function anchors(html: string): { href: string; text: string }[] {
  const out: { href: string; text: string }[] = [];
  for (const m of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)) out.push({ href: plain(m[2]), text: plain(m[3]) });
  return out;
}

export function intake(input: IntakeInput): Intake[] {
  const files = input.files ?? [];
  const fromFiles: Intake[] = [];
  files.forEach((f, i) => {
    if (f.type.startsWith('image/') || IMAGE_FILE.test(f.name)) fromFiles.push({ kind: 'image', file: i });
    else if (f.type === 'text/plain' || f.type === 'text/markdown' || TEXT_FILE.test(f.name)) fromFiles.push({ kind: 'textFile', file: i });
  });
  // con dei file il testo che li accompagna e' di solito solo il loro nome o percorso
  if (files.length) return fromFiles;

  const html = input.html ?? '';
  const links = anchors(html);
  const titleFor = (url: string) => {
    const a = links.find((l) => l.href === url);
    return a && a.text !== url ? a.text : '';
  };

  const uris = (input.uriList ?? '')
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map(asUrl);
  if (uris.length && uris.every(Boolean)) return uris.map((url) => ({ kind: 'link', url: url!, title: titleFor(url!) }));

  const text = (input.text ?? '').replace(/\r\n?/g, '\n').trim();
  const lines = text.split('\n').filter((l) => l.trim());
  const urls = lines.map(asUrl);
  if (lines.length && urls.every(Boolean)) return urls.map((url) => ({ kind: 'link', url: url!, title: titleFor(url!) }));

  // una parola con un link copiata da una pagina: un link col suo titolo
  if (links.length === 1 && text && plain(html) === text.replace(/\s+/g, ' ')) {
    const url = asUrl(links[0].href);
    if (url) return [{ kind: 'link', url, title: links[0].text }];
  }
  if (text) return [{ kind: 'note', text }];
  if (html) {
    const p = plain(html);
    if (p) return [{ kind: 'note', text: p }];
  }
  return [];
}
