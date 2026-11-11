'use client';
import { useState } from 'react';
import { Download, Upload, HardDrive, X } from 'lucide-react';
import { isPortuguese } from '@/lib/workspace';
import {
  createLocalBackup,
  downloadLocalBackup,
  inspectLocalBackup,
  restoreLocalBackup,
} from '@/lib/browser/backup';
import type { LocalBackupFile } from '@/lib/browser/backup-format';
import { useDialog } from './use-dialog';
export function LocalBackup({ refresh }: { refresh: () => Promise<void> }) {
  const pt = isPortuguese;
  const [pending, setPending] = useState<LocalBackupFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const close = () => {
    if (!busy) setPending(null);
  };

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="settings-info local-backup">
      <span className="eyebrow">
        <HardDrive size={15} /> {pt ? 'SOMENTE NESTE DISPOSITIVO' : 'ONLY ON THIS DEVICE'}
      </span>
      <h2>{pt ? 'Seu aprendizado, com você' : 'Your learning, with you'}</h2>
      <p>
        {pt
          ? 'Guarde uma cópia do histórico, PDFs e gravações deste idioma. Para trocar de dispositivo, restaure a cópia no mesmo idioma.'
          : 'Keep a copy of this language’s history, PDFs and recordings. To move devices, restore it in the same language.'}
      </p>
      <p className="fine-print" lang="es">
        El respaldo contiene datos personales sin cifrar. Guardalo en un lugar privado. Los
        borradores de ejercicios abiertos y el modelo de IA no se incluyen.
      </p>
      <div className="actions">
        <button
          className="button"
          disabled={busy}
          onClick={() =>
            void run(async () => {
              downloadLocalBackup(await createLocalBackup());
              setMessage(
                pt
                  ? 'Cópia preparada. Confira o download antes de fechar.'
                  : 'Backup prepared. Check your download before closing.',
              );
            })
          }
        >
          <Download size={16} /> {pt ? 'Exportar cópia completa' : 'Export full backup'}
        </button>
        <label className="button secondary backup-file">
          <Upload size={16} /> {pt ? 'Restaurar cópia' : 'Restore backup'}
          <input
            aria-label={pt ? 'Restaurar cópia' : 'Restore backup'}
            type="file"
            accept="application/json,.json"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void run(async () => setPending(await inspectLocalBackup(file)));
            }}
          />
        </label>
      </div>
      {message && <p role="status">{message}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {pending && (
        <div className="modal-backdrop">
          <BackupDialog close={close} busy={busy}>
            <button
              className="icon-button"
              aria-label={pt ? 'Cancelar' : 'Cancel'}
              onClick={close}
              disabled={busy}
            >
              <X size={20} />
            </button>
            <span className="eyebrow">{pt ? 'CONFIRME A RESTAURAÇÃO' : 'CONFIRM RESTORE'}</span>
            <h2 id="restore-title">
              {pt ? 'Substituir este histórico?' : 'Replace this history?'}
            </h2>
            <p>
              {pending.workspace === 'pt' ? 'Português' : 'English'} ·{' '}
              {new Date(pending.createdAt).toLocaleString()} ·{' '}
              {pending.manifest.data.results.length} {pt ? 'resultados' : 'results'} ·{' '}
              {pending.attachments.length} {pt ? 'arquivos' : 'files'}
            </p>
            <p lang="es">
              Se reemplazará el historial de este idioma en este navegador. El otro idioma conserva
              sus datos. Primero se descargará una copia de seguridad del estado actual.
            </p>
            <div className="actions">
              <button className="button secondary" disabled={busy} onClick={close}>
                {pt ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                className="button"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    downloadLocalBackup(await createLocalBackup());
                    await restoreLocalBackup(pending);
                    setPending(null);
                    await refresh();
                    setMessage(
                      pt ? 'Cópia restaurada neste idioma.' : 'Backup restored for this language.',
                    );
                  })
                }
              >
                {busy
                  ? '…'
                  : pt
                    ? 'Salvar cópia atual e substituir'
                    : 'Back up current data & replace'}
              </button>
            </div>
          </BackupDialog>
        </div>
      )}
    </section>
  );
}

function BackupDialog({
  close,
  busy,
  children,
}: {
  close: () => void;
  busy: boolean;
  children: React.ReactNode;
}) {
  const ref = useDialog(close, busy);
  return (
    <section
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-title"
      className="modal backup-confirm"
    >
      {children}
    </section>
  );
}
