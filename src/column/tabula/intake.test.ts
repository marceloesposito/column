import { describe, expect, it } from 'vitest';
import { asUrl, intake } from './intake';
import { clock, embedOf, siteOf } from './embed';

describe('intake', () => {
  it('immagini e file di testo diventano blocchi; il resto dei file si ignora', () => {
    const files = [
      { name: 'foto.PNG', type: '' },
      { name: 'appunti.md', type: '' },
      { name: 'contratto.zip', type: 'application/zip' },
      { name: 'image.png', type: 'image/png' },
    ];
    expect(intake({ files, text: '/Users/x/foto.PNG' })).toEqual([
      { kind: 'image', file: 0 },
      { kind: 'textFile', file: 1 },
      { kind: 'image', file: 3 },
    ]);
  });

  it('un indirizzo (o uno per riga) diventa un link', () => {
    expect(intake({ text: ' https://example.com/a ' })).toEqual([{ kind: 'link', url: 'https://example.com/a', title: '' }]);
    expect(intake({ text: 'www.example.com\nhttps://b.org' })).toEqual([
      { kind: 'link', url: 'https://www.example.com', title: '' },
      { kind: 'link', url: 'https://b.org', title: '' },
    ]);
    expect(intake({ uriList: '# commento\r\nhttps://a.it/x', text: 'https://a.it/x' })).toEqual([{ kind: 'link', url: 'https://a.it/x', title: '' }]);
  });

  it('una parola con link copiata da una pagina tiene il suo titolo', () => {
    const html = '<meta charset="utf-8"><a href="https://it.wikipedia.org/wiki/Roma">Roma &amp; dintorni</a>';
    expect(intake({ text: 'Roma & dintorni', html })).toEqual([{ kind: 'link', url: 'https://it.wikipedia.org/wiki/Roma', title: 'Roma & dintorni' }]);
  });

  it('il resto del testo diventa una nota', () => {
    expect(intake({ text: 'Una frase con https://a.it dentro\r\n\r\nE un a capo' })).toEqual([{ kind: 'note', text: 'Una frase con https://a.it dentro\n\nE un a capo' }]);
    expect(intake({ html: '<p>Solo <b>html</b></p>' })).toEqual([{ kind: 'note', text: 'Solo html' }]);
    expect(intake({ text: '   ' })).toEqual([]);
  });

  it('asUrl vuole http(s) e un dominio', () => {
    expect(asUrl('javascript:alert(1)')).toBeNull();
    expect(asUrl('file:///etc/passwd')).toBeNull();
    expect(asUrl('http://localhost')).toBeNull();
    expect(asUrl('due parole')).toBeNull();
  });
});

describe('embedOf', () => {
  it('video', () => {
    expect(embedOf('https://www.youtube.com/watch?v=abc&t=83')).toEqual({ provider: 'YouTube', kind: 'video', start: 83 });
    expect(embedOf('https://youtu.be/abc?t=1m2s')).toEqual({ provider: 'YouTube', kind: 'video', start: 62 });
    expect(embedOf('https://youtube.com/shorts/abc')?.kind).toBe('video');
    expect(embedOf('https://www.youtube.com/@canale')).toBeNull();
    expect(embedOf('https://vimeo.com/12345')?.provider).toBe('Vimeo');
  });

  it('musica, post, voci, codice, mappe e documenti', () => {
    expect(embedOf('https://open.spotify.com/track/xyz')).toEqual({ provider: 'Spotify', kind: 'audio' });
    expect(embedOf('https://soundcloud.com/artista/un-brano')?.label).toBe('un brano');
    expect(embedOf('https://x.com/qualcuno/status/123')).toEqual({ provider: 'X', kind: 'post' });
    expect(embedOf('https://x.com/qualcuno')).toBeNull();
    expect(embedOf('https://it.wikipedia.org/wiki/Divina_Commedia')).toEqual({ provider: 'Wikipedia', kind: 'wiki', label: 'Divina Commedia' });
    expect(embedOf('https://github.com/marceloesposito/logos/pull/3')?.label).toBe('marceloesposito/logos');
    expect(embedOf('https://www.google.com/maps/place/Piazza+Navona/@41')?.label).toBe('Piazza Navona');
    expect(embedOf('https://www.openstreetmap.org/#map=15/41.9/12.5')?.kind).toBe('map');
    expect(embedOf('https://example.com/carte/Relazione_2026.pdf')).toEqual({ provider: 'PDF', kind: 'doc', label: 'Relazione 2026' });
    expect(embedOf('https://example.com/')).toBeNull();
    expect(embedOf('non un indirizzo')).toBeNull();
  });

  it('clock e siteOf', () => {
    expect(clock(83)).toBe('1:23');
    expect(clock(3723)).toBe('1:02:03');
    expect(siteOf('https://www.example.com/a')).toBe('example.com');
  });
});
