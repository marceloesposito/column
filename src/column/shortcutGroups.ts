// Il foglio delle scorciatoie (tasto "?" in alto a destra): i comandi con una scorciatoia, a gruppi.
// Un test controlla che ogni scorciatoia di commandSpecs stia in un gruppo.
import { specOf } from './commandSpecs';

export interface ShortcutRow {
  /** chiave i18n */
  label: string;
  keys: string;
}

export interface ShortcutGroup {
  /** chiave i18n del titolo */
  title: string;
  rows: ShortcutRow[];
}

const GROUPS: { title: string; ids: string[]; extra?: ShortcutRow[] }[] = [
  { title: 'shortcuts.group.piece', ids: ['sheet.new', 'sheet.open', 'sheet.save', 'sheet.saveAs', 'sheet.exportPdf', 'sheet.rename', 'version.save'] },
  {
    title: 'shortcuts.group.text',
    ids: ['text.bold', 'text.italic', 'text.underline', 'text.strike', 'edit.link', 'comment.add'],
    extra: [
      { label: 'shortcuts.undo', keys: 'Mod+Z' },
      { label: 'shortcuts.redo', keys: 'Mod+Shift+Z' },
      { label: 'help.slash', keys: '/' },
    ],
  },
  { title: 'shortcuts.group.view', ids: ['tabula.toggle', 'versions.toggle', 'panel.sheets', 'panel.index', 'silentium.toggle', 'zoom.in', 'zoom.out', 'zoom.reset'] },
  { title: 'shortcuts.group.app', ids: ['palette.open', 'timer.toggle', 'app.help', 'app.prefs', 'app.quit'] },
];

export function shortcutGroups(): ShortcutGroup[] {
  return GROUPS.map((g) => ({
    title: g.title,
    rows: [
      ...g.ids.flatMap((id) => {
        const s = specOf(id);
        return s?.shortcut ? [{ label: s.label, keys: s.shortcut }] : [];
      }),
      ...(g.extra ?? []),
    ],
  }));
}

/** Gli id messi nei gruppi (per il test). */
export const GROUPED_IDS = GROUPS.flatMap((g) => g.ids);
