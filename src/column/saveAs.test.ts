import { describe, it, expect } from 'vitest';
import { platform } from '../platform';
import type { MemoryPlatform } from '../platform/memory';
import { newSheet } from './format';
import { readSheetFile } from './sheets';
import { useColumn } from './store';

const mem = platform as MemoryPlatform;

describe('Salva come', () => {
  it('con copy scrive il file ma il pezzo resta nel suo', async () => {
    const sheet = { ...newSheet('f1', new Date()), markdown: 'testo' };
    useColumn.setState({ sheet, path: '/prove/originale.clmn', saveState: 'saved' });
    mem.queuePick('/prove/copia.clmn');
    expect(await useColumn.getState().saveAs({ copy: true })).toBe(true);
    expect((await readSheetFile('/prove/copia.clmn')).markdown).toBe('testo');
    expect(useColumn.getState().path).toBe('/prove/originale.clmn');
  });

  it('senza copy il pezzo passa al file nuovo', async () => {
    mem.queuePick('/prove/nuovo.clmn');
    expect(await useColumn.getState().saveAs()).toBe(true);
    expect(useColumn.getState().path).toBe('/prove/nuovo.clmn');
  });
});
