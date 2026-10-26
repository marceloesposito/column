import { describe, it, expect } from 'vitest';
import { COMMANDS } from './commandSpecs';
import { GROUPED_IDS, shortcutGroups } from './shortcutGroups';

describe('foglio delle scorciatoie', () => {
  it('ogni comando con una scorciatoia sta in un gruppo', () => {
    const missing = COMMANDS.filter((c) => c.shortcut && !GROUPED_IDS.includes(c.id)).map((c) => c.id);
    expect(missing).toEqual([]);
  });

  it('nessun gruppo vuoto e nessun id ripetuto', () => {
    for (const g of shortcutGroups()) expect(g.rows.length, g.title).toBeGreaterThan(0);
    expect(GROUPED_IDS.filter((id, i) => GROUPED_IDS.indexOf(id) !== i)).toEqual([]);
  });
});
