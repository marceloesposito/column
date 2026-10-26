// Salva come: si sceglie il formato e se scrivere solo una copia, poi si apre la finestra del
// sistema. Fuori dal .clmn e' sempre una copia, e un avviso dice cosa non passa.
import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Modal } from '../components/Modal';
import { useUi } from './ui';
import { useColumn } from './store';
import { EXT } from './format';
import { t } from '../i18n';

export type SaveFormat = 'clmn' | 'docx' | 'md' | 'pdf';

const FORMATS: SaveFormat[] = ['clmn', 'docx', 'md', 'pdf'];

// l'ultima scelta resta per la prossima volta (nella sessione)
let last: { format: SaveFormat; copy: boolean } = { format: 'clmn', copy: false };

async function run(format: SaveFormat, copy: boolean) {
  if (format === 'clmn') return (await import('./actions')).saveAs({ copy });
  const m = await import('./exportDoc');
  if (format === 'docx') return m.exportDocx();
  if (format === 'md') return m.exportMd();
  return m.exportPdf();
}

export function SaveAsDialog() {
  const path = useColumn((s) => s.path);
  const [format, setFormat] = useState<SaveFormat>(last.format);
  const [copyChoice, setCopy] = useState(last.copy);
  const native = format === 'clmn';
  const copy = !native || copyChoice;
  const close = () => useUi.getState().setDialog(null);
  const confirm = () => {
    last = { format, copy: copyChoice };
    close();
    void run(format, copy);
  };
  const where = path ? path.slice(path.lastIndexOf('/') + 1) : t('saveAs.draft');
  return (
    <Modal
      title={t('cmd.sheet.saveAs')}
      onClose={close}
      size="small"
      footer={
        <>
          <button className="btn" onClick={close}>
            {t('common.cancel')}
          </button>
          <button className="btn btn--primary" autoFocus onClick={confirm}>
            {format === 'pdf' ? t('saveAs.print') : t('saveAs.go')}
          </button>
        </>
      }
    >
      <div className="fx-form">
        <div className="fx-formats" role="radiogroup" aria-label={t('saveAs.format')}>
          {FORMATS.map((f) => (
            <label key={f} className={`fx-format${f === format ? ' is-on' : ''}`}>
              <input type="radio" name="save-format" checked={f === format} onChange={() => setFormat(f)} />
              <span className="fx-format__text">
                <span className="fx-format__name">{t(`saveAs.format.${f}`, { ext: EXT })}</span>
                <span className="fx-muted">{t(`saveAs.format.${f}.hint`)}</span>
              </span>
            </label>
          ))}
        </div>
        <label className="fx-check">
          <input type="checkbox" checked={copy} disabled={!native} onChange={(e) => setCopy(e.target.checked)} />
          <span>
            {t('saveAs.copy')}
            <span className="fx-muted"> — {t('saveAs.copy.hint', { name: where })}</span>
          </span>
        </label>
        {!native && (
          <div className="fx-alert" role="alert">
            <TriangleAlert size={16} />
            <span>{t(`saveAs.lost.${format}`)}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
