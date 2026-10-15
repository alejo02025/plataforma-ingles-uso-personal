import { isPortuguese } from '@/lib/workspace';
import type { OralEvidence } from '@/lib/oral-practice';

/** A practice record, never an acoustic assessment or a raw storage envelope. */
export function OralEvidenceRecord({ attempt }: { attempt: OralEvidence }) {
  const pt = isPortuguese;
  return (
    <div className="oral-evidence-record">
      <strong>
        {attempt.mode === 'recording'
          ? pt
            ? 'Gravação'
            : 'Recording'
          : pt
            ? 'Escuta'
            : 'Listening'}
      </strong>
      <p>
        {attempt.mode === 'recording'
          ? `${Math.round(attempt.duration)} s · ${pt ? 'Pronúncia e fluência não avaliadas' : 'Pronunciation and fluency not assessed'}`
          : `${attempt.correct} / ${attempt.total} · ${attempt.helpUsed ? (pt ? 'Com apoio da transcrição' : 'With transcript support') : pt ? 'Perguntas sobre voz sintética' : 'Questions about synthetic speech'}`}
      </p>
      <small lang="es">
        {attempt.mode === 'recording'
          ? 'Grabación guardada como práctica; no es una evaluación de pronunciación ni fluidez.'
          : attempt.helpUsed
            ? 'Práctica auditiva con apoyo; no cuenta como resultado independiente.'
            : 'Resultado de estas preguntas sobre voz sintética; no certifica un nivel.'}
      </small>
      {attempt.transcript && <blockquote>{attempt.transcript}</blockquote>}
      {attempt.note && <p>{attempt.note}</p>}
    </div>
  );
}
