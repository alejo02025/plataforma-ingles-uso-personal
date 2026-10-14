'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Newspaper } from 'lucide-react';
import { isPortuguese, assetBase } from '@/lib/workspace';
import { Heading } from './ui';
type Briefing = {
  checkedAt: string;
  stories: {
    id: string;
    language: string;
    topic: string;
    source: string;
    title: string;
    url: string;
    published: string;
  }[];
  unavailable: { language: string; topic: string }[];
};
export function NewsBriefing() {
  const [data, setData] = useState<Briefing>(),
    [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(`${assetBase}/assets/briefing.json`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('unavailable');
        return r.json();
      })
      .then((value) => {
        if (alive) setData(value);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  const stories = data?.stories.filter((s) => s.language === (isPortuguese ? 'pt' : 'en')) || [];
  return (
    <>
      <Heading
        eyebrow="THE WORLD, IN YOUR LANGUAGE"
        title="Your daily briefing."
        description="Headlines worth a closer look. Read the source, find new words, and form your own view."
      />
      <section className="card briefing-note">
        <Newspaper size={24} />
        <p lang="es">
          Titulares reales de fuentes identificadas; se consultan dos veces al día mediante GitHub.
          No son noticias generadas por IA ni una selección exhaustiva. Cada noticia muestra su
          fecha. Sin señal podés leer la última lista descargada; abrir la fuente requiere conexión.
        </p>
        {data && (
          <time>{new Date(data.checkedAt).toLocaleString(isPortuguese ? 'pt-BR' : 'en-US')}</time>
        )}
      </section>
      {!stories.length ? (
        <div className="empty">
          <h2>Nothing downloaded yet</h2>
          <p lang="es">
            {error
              ? 'No se pudo cargar la lista guardada. Volvé a intentarlo con conexión.'
              : 'Todavía no hay titulares recientes disponibles para este idioma. Se mostrarán cuando GitHub pueda consultar las fuentes; no reemplazamos una noticia por contenido inventado.'}
          </p>
        </div>
      ) : (
        <div className="briefing-grid">
          {stories.map((s) => (
            <article key={s.id} className="card briefing-story">
              <span className="eyebrow">
                {s.topic} · {s.source}
              </span>
              <h2>{s.title}</h2>
              <time dateTime={s.published}>
                {new Date(s.published).toLocaleString(isPortuguese ? 'pt-BR' : 'en-US')}
              </time>
              <a href={s.url} target="_blank" rel="noreferrer">
                Read the source <ArrowUpRight size={16} />
              </a>
            </article>
          ))}
        </div>
      )}
      {data?.unavailable.some((s) => s.language === (isPortuguese ? 'pt' : 'en')) && (
        <p lang="es" className="fine-print">
          Alguna fuente no respondió o no publicó titulares recientes. Los anteriores se conservan
          con su fecha original.
        </p>
      )}
    </>
  );
}
