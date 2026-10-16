'use client';
import { useEffect, useState } from 'react';
import { isPortuguese, studyStorage } from '@/lib/workspace';
const key = 'background-motion:v1';
/** Decorative, compositor-only movement. Never covers or receives study interactions. */
export function StudioAtmosphere() {
  useEffect(() => {
    try {
      document.documentElement.dataset.backgroundMotion =
        studyStorage.getItem(key) === 'off' ? 'off' : 'on';
    } catch {
      /* Storage may be unavailable; OS reduced-motion still applies. */
    }
    const visibility = () => {
      document.documentElement.dataset.backgroundPaused = document.hidden ? 'true' : 'false';
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
  return (
    <div className="studio-atmosphere" aria-hidden="true">
      <span className="studio-orb" />
      <span className="studio-orb" />
      <span className="studio-orb" />
    </div>
  );
}
export function BackgroundMotionControl() {
  const [enabled, setEnabled] = useState(true),
    [error, setError] = useState(false);
  useEffect(() => {
    setEnabled(document.documentElement.dataset.backgroundMotion !== 'off');
  }, []);
  return (
    <div className="motion-preference">
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            const next = e.target.checked;
            try {
              studyStorage.setItem(key, next ? 'on' : 'off');
              document.documentElement.dataset.backgroundMotion = next ? 'on' : 'off';
              setEnabled(next);
              setError(false);
            } catch {
              setError(true);
            }
          }}
        />
        <span>{isPortuguese ? 'Cores em movimento no fundo' : 'Moving background colours'}</span>
      </label>
      <p className="fine-print">
        {isPortuguese
          ? 'Salvo automaticamente neste navegador. Respeita a preferência do dispositivo por movimento reduzido.'
          : 'Saved automatically in this browser. Respects your device’s reduced-motion preference.'}
      </p>
      <p className="fine-print" lang="es">
        Colores en movimiento de fondo. Se guarda automáticamente en este navegador y respeta la
        preferencia de reducir movimiento.
      </p>
      {error && (
        <p role="alert">
          {isPortuguese
            ? 'Não foi possível salvar esta preferência.'
            : 'This preference could not be saved.'}
        </p>
      )}
    </div>
  );
}
