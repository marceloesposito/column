// Embed senza rete: da un indirizzo si riconosce il servizio (video, musica, post, mappa...) e si
// mostra una scheda fatta in casa. Niente iframe ne' anteprime scaricate: l'app resta offline e
// senza servizi esterni; il contenuto si apre nel browser.

export type EmbedKind = 'video' | 'audio' | 'post' | 'map' | 'doc' | 'code' | 'wiki';

export interface Embed {
  /** nome del servizio, come lo scrive il servizio stesso */
  provider: string;
  kind: EmbedKind;
  /** titolo ricavato dall'indirizzo (voce di Wikipedia, repo, nome del file...) */
  label?: string;
  /** video: secondo da cui parte */
  start?: number;
}

function parse(url: string): URL | null {
  try {
    const u = new URL(url.trim());
    return u.protocol === 'http:' || u.protocol === 'https:' ? u : null;
  } catch {
    return null;
  }
}

/** "1h2m3s", "83s", "83" -> secondi */
function seconds(v: string | null): number | undefined {
  if (!v) return undefined;
  if (/^\d+$/.test(v)) return Number(v) || undefined;
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(v);
  if (!m || !m[0]) return undefined;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) || undefined;
}

/** 83 -> "1:23", 3723 -> "1:02:03" */
export function clock(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

function words(segment: string): string {
  try {
    return decodeURIComponent(segment).replace(/[_-]+/g, ' ').trim();
  } catch {
    return segment;
  }
}

const SOCIAL: [RegExp, string, RegExp][] = [
  [/^(x|twitter)\.com$/, 'X', /^\/[^/]+\/status\/\d+/],
  [/^bsky\.app$/, 'Bluesky', /^\/profile\/[^/]+\/post\//],
  [/^instagram\.com$/, 'Instagram', /^\/(p|reel|tv)\//],
  [/^threads\.(net|com)$/, 'Threads', /^\/@[^/]+\/post\//],
  [/^facebook\.com$/, 'Facebook', /\/(posts|videos|reel)\//],
  [/^linkedin\.com$/, 'LinkedIn', /^\/(posts|feed\/update)\//],
];

export function embedOf(url: string): Embed | null {
  const u = parse(url);
  if (!u) return null;
  const host = u.hostname.replace(/^(www|m|mobile|music)\./, '');
  const path = u.pathname;
  const seg = path.split('/').filter(Boolean);

  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    const isVideo = host === 'youtu.be' ? seg.length > 0 : (path === '/watch' && u.searchParams.has('v')) || /^(shorts|embed|live)$/.test(seg[0] ?? '');
    if (!isVideo) return null;
    return { provider: 'YouTube', kind: 'video', start: seconds(u.searchParams.get('t') ?? u.searchParams.get('start')) };
  }
  if (host === 'vimeo.com' && /^\d+$/.test(seg[0] ?? '')) return { provider: 'Vimeo', kind: 'video', start: seconds(u.hash.match(/t=([\dhms]+)/)?.[1] ?? null) };
  if ((host === 'dailymotion.com' && seg[0] === 'video') || host === 'dai.ly') return { provider: 'Dailymotion', kind: 'video' };
  if (host === 'tiktok.com' && seg.includes('video')) return { provider: 'TikTok', kind: 'video' };
  if (host === 'raiplay.it' && /^(video|programmi)$/.test(seg[0] ?? '')) return { provider: 'RaiPlay', kind: 'video' };

  if (host === 'open.spotify.com' && /^(track|album|playlist|episode|show|artist)$/.test(seg[0] ?? '')) return { provider: 'Spotify', kind: 'audio' };
  if (host === 'soundcloud.com' && seg.length >= 2) return { provider: 'SoundCloud', kind: 'audio', label: words(seg[1]) };
  if (host.endsWith('bandcamp.com') && /^(track|album)$/.test(seg[0] ?? '')) return { provider: 'Bandcamp', kind: 'audio', label: words(seg[1] ?? '') || undefined };
  if (host === 'podcasts.apple.com' || (host === 'apple.com' && u.hostname.startsWith('music.'))) return { provider: 'Apple', kind: 'audio' };

  for (const [re, provider, post] of SOCIAL) if (re.test(host) && post.test(path)) return { provider, kind: 'post' };

  if (host.endsWith('.wikipedia.org') && seg[0] === 'wiki' && seg[1]) return { provider: 'Wikipedia', kind: 'wiki', label: words(seg.slice(1).join('/')) };
  if (host === 'github.com' && seg.length >= 2) return { provider: 'GitHub', kind: 'code', label: `${seg[0]}/${seg[1]}` };
  if (host === 'openstreetmap.org' || (host.startsWith('google.') && seg[0] === 'maps') || host === 'maps.google.com' || host === 'maps.app.goo.gl')
    return { provider: host === 'openstreetmap.org' ? 'OpenStreetMap' : 'Google Maps', kind: 'map', label: seg[0] === 'maps' && seg[1] === 'place' && seg[2] ? words(seg[2]).replace(/\+/g, ' ') : undefined };
  if (host === 'docs.google.com' && /^(document|spreadsheets|presentation)$/.test(seg[0] ?? '')) return { provider: 'Google Docs', kind: 'doc' };
  if (/\.pdf$/i.test(path)) return { provider: 'PDF', kind: 'doc', label: words(seg[seg.length - 1].replace(/\.pdf$/i, '')) };
  return null;
}

/** Dominio leggibile per i link senza embed ("www.example.com" -> "example.com"). */
export function siteOf(url: string): string {
  return parse(url)?.hostname.replace(/^www\./, '') ?? url;
}
