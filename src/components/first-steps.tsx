'use client';
import { StudyCopy } from './study-copy';
import { useState } from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import { isPortuguese } from '@/lib/workspace';
import { Button } from './ui';
export function FirstSteps({ onTest, onDone }: { onTest: () => void; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const pages = [
    {
      title: 'Primero, encontrá tu punto de partida.',
      body: 'Hacé el test orientativo: mezcla lectura, gramática y vocabulario, empezando por lo más sencillo. No necesitás preparar nada. Si no sabés una respuesta, marcá la opción correspondiente.',
    },
    {
      title: 'Después, seguí la sugerencia del día.',
      body: 'En Inicio, abrí el primer paso de la guía. Leé un párrafo y tocá una palabra desconocida. Luego abrí la clase sugerida. Las noticias y juegos son prácticas opcionales relacionadas con lo que vas viendo.',
    },
    {
      title: 'Consultá ayuda y mirá lo que falta.',
      body: 'Verbos, tiempos y armado de oraciones están siempre disponibles en Language help / Ajuda com o idioma. Progreso te muestra tus logros y qué reforzar. Las clases avanzan por requisitos; el test orienta y no saltea esos requisitos.',
    },
  ];
  return (
    <section className="card welcome-guide" aria-label="First steps tutorial">
      <span className="eyebrow">
        <Compass size={17} /> {isPortuguese ? 'SEU PRIMEIRO DIA' : 'YOUR FIRST DAY'}
      </span>
      <h2>{isPortuguese ? 'Vamos começar juntos.' : 'Let’s start together.'}</h2>
      <span className="pill neutral">{step + 1} / 3</span>
      <StudyCopy as="h3">{pages[step].title}</StudyCopy>
      <StudyCopy as="p">{pages[step].body}</StudyCopy>
      <StudyCopy as="p" className="fine-print">
        Tus respuestas se guardan automáticamente. Podés pausar el test y retomarlo; no hace falta
        configurar GitHub para guardar en este dispositivo.
      </StudyCopy>
      <div className="welcome-actions">
        <Button onClick={onTest}>
          Start the level check <ArrowRight size={15} />
        </Button>
        {step < 2 ? (
          <Button secondary onClick={() => setStep(step + 1)}>
            Next tip
          </Button>
        ) : (
          <Button secondary onClick={onDone}>
            Explore my day
          </Button>
        )}
      </div>
      {step < 2 && (
        <button className="text-link" onClick={onDone}>
          Explore my day
        </button>
      )}
    </section>
  );
}
