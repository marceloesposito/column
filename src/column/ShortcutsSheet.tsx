// Foglio delle scorciatoie: sale dal fondo della finestra (come in Figma) col "?" in alto a destra o
// F1, e si chiude con Esc, la X o di nuovo il "?". Non copre il testo con uno sfondo scuro.
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useUi } from './ui';
import { shortcutGroups } from './shortcutGroups';
import { shortcutLabel } from './keys';
import { t, useLang } from '../i18n';

export function ShortcutsSheet() {
  useLang();
  const open = useUi((s) => s.shortcuts);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        useUi.getState().setShortcuts(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);
  if (!open) return null;
  return (
    <section className="fx-shortcuts" role="dialog" aria-label={t('shortcuts.title')}>
      <header className="fx-shortcuts__head">
        <h2 className="fx-shortcuts__title">{t('shortcuts.title')}</h2>
        <span className="fx-muted">{t('help.intro')}</span>
        <button className="icon-btn" onClick={() => useUi.getState().setShortcuts(false)} title={t('common.close')} aria-label={t('common.close')}>
          <X size={16} />
        </button>
      </header>
      <div className="fx-shortcuts__groups">
        {shortcutGroups().map((g) => (
          <div key={g.title} className="fx-shortcuts__group">
            <h3>{t(g.title)}</h3>
            <dl>
              {g.rows.map((r) => (
                <div key={r.label} className="fx-shortcuts__row">
                  <dt>{t(r.label)}</dt>
                  <dd>
                    <kbd>{shortcutLabel(r.keys)}</kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
