import { isPortuguese } from '@/lib/workspace';
export function Correction({
  explanation,
  correction,
}: {
  explanation: string;
  correction: string;
}) {
  return (
    <div className="answer-correction">
      <p lang="es">{explanation}</p>
      <p lang={isPortuguese ? 'pt-BR' : 'en'} className="answer-correction-model">
        <strong>{isPortuguese ? 'Correção: ' : 'Correction: '}</strong>
        {correction}
      </p>
    </div>
  );
}
