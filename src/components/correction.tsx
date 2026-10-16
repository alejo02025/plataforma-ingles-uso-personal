import { isPortuguese } from '@/lib/workspace';
import { StudyCopy, SpanishTranslation } from './study-copy';
export function Correction({
  explanation,
  correction,
  explanationNative,
  correctionSpanish,
}: {
  explanation: string;
  correction: string;
  explanationNative?: string;
  correctionSpanish?: string;
}) {
  return (
    <div className="answer-correction">
      <StudyCopy native={explanationNative}>{explanation}</StudyCopy>
      <p lang={isPortuguese ? 'pt-BR' : 'en'} className="answer-correction-model">
        <strong>{isPortuguese ? 'Correção: ' : 'Correction: '}</strong>
        {correction}
        <SpanishTranslation text={correction} spanish={correctionSpanish} />
      </p>
    </div>
  );
}
