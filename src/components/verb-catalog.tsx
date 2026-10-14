'use client';
import { useEffect, useMemo, useState } from 'react';
import { assetBase, isPortuguese } from '@/lib/workspace';
import { Speak } from './ui';
import { Foundations } from './foundations';
type Entry = { word: string; senses: { id: string; es: string[]; gloss: string }[] };
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
export function VerbCatalog() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    fetch(`${assetBase}/assets/verbs/${isPortuguese ? 'pt' : 'en'}.json`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error('catalog');
        return r.json();
      })
      .then(setEntries)
      .catch((e) => {
        if (e.name !== 'AbortError') setError(true);
      });
    return () => controller.abort();
  }, [retry]);
  const indexed = useMemo(
    () =>
      entries.map((e) => ({
        entry: e,
        key: normalize(`${e.word} ${e.senses.flatMap((s) => s.es).join(' ')}`),
      })),
    [entries],
  );
  const matches = useMemo(
    () => indexed.filter((e) => e.key.includes(normalize(query))).map((e) => e.entry),
    [indexed, query],
  );
  const size = 30,
    visible = matches.slice(page * size, (page + 1) * size);
  return (
    <section className="verb-catalog">
      <div className="toolkit-intro">
        <h2>{isPortuguese ? 'Encontre seu verbo' : 'Find your verb'}</h2>
        <p lang="es">
          Buscá una acción en español o en el idioma que estudiás. Abrí un verbo para consultar sus
          significados. Una misma palabra puede tener varios sentidos.
        </p>
      </div>
      <label className="field verb-search">
        {isPortuguese ? 'Buscar verbos' : 'Search verbs'}
        <input
          type="search"
          value={query}
          placeholder={isPortuguese ? 'estudar, viajar, aprender…' : 'study, travel, aprender…'}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
      </label>
      <p className="fine-print catalog-count" aria-live="polite">
        {entries.length
          ? `${matches.length.toLocaleString(isPortuguese ? 'pt-BR' : 'en')} / ${entries.length.toLocaleString(isPortuguese ? 'pt-BR' : 'en')} ${isPortuguese ? 'verbos e expressões verbais' : 'verbs and verb expressions'}`
          : error
            ? ''
            : isPortuguese
              ? 'Carregando verbos…'
              : 'Loading verbs…'}
      </p>
      {error && (
        <div role="alert">
          <p lang="es">
            No se pudo abrir el catálogo. Conectate una vez para descargarlo; después queda
            disponible sin señal cuando la app indique que está lista sin conexión.
          </p>
          <button onClick={() => setRetry((v) => v + 1)}>
            {isPortuguese ? 'Tentar novamente' : 'Try again'}
          </button>
        </div>
      )}
      <div className="verb-results">
        {visible.map((entry) => (
          <details className="verb-entry card" key={entry.word}>
            <summary>
              <strong>{entry.word}</strong>
              <span lang="es">{entry.senses[0].es.slice(0, 2).join(' · ')}</span>
            </summary>
            <div className="verb-senses">
              <Speak text={entry.word} />
              {entry.senses.map((sense, i) => (
                <div key={sense.id}>
                  <p lang="es">
                    <strong>{i + 1}.</strong> {sense.es.join(' · ')}
                  </p>
                  <details>
                    <summary>
                      {isPortuguese
                        ? 'Definição do dicionário em inglês'
                        : 'Dictionary definition & examples'}
                    </summary>
                    <p lang="en">{sense.gloss}</p>
                  </details>
                </div>
              ))}
              <p className="fine-print" lang="es">
                Las equivalencias dependen del contexto; no todas se pueden intercambiar. Este
                diccionario incluye usos poco frecuentes. Para aprender el patrón de conjugación,
                usá los modelos cotidianos de abajo.
              </p>
            </div>
          </details>
        ))}
      </div>
      {entries.length > 0 && !matches.length && (
        <p lang="es">
          No encontramos ese verbo. Probá el infinitivo o una palabra más corta, en español o en el
          idioma que estudiás.
        </p>
      )}
      {matches.length > size && (
        <nav
          className="catalog-pages"
          aria-label={isPortuguese ? 'Páginas de verbos' : 'Verb pages'}
        >
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            {isPortuguese ? 'Anterior' : 'Previous'}
          </button>
          <span>
            {page + 1} / {Math.ceil(matches.length / size)}
          </span>
          <button
            disabled={(page + 1) * size >= matches.length}
            onClick={() => setPage((p) => p + 1)}
          >
            {isPortuguese ? 'Próxima' : 'Next'}
          </button>
        </nav>
      )}
      <details className="toolkit-practice">
        <summary>
          {isPortuguese ? 'Conjugar verbos do dia a dia' : 'Conjugate everyday verbs'}
        </summary>
        <p lang="es">
          Modelos de uso revisados para verbos cotidianos: elegí persona y tiempo. El catálogo
          amplio es de significados; no genera conjugaciones automáticas para verbos irregulares.
        </p>
        <Foundations mode="verbs" referenceOnly onOpenLesson={() => {}} />
      </details>
      <details className="catalog-sources">
        <summary>{isPortuguese ? 'Fontes do dicionário' : 'Dictionary sources'}</summary>
        <p lang="es">
          Princeton WordNet 3.0, OpenWordnet-PT y Multilingual Central Repository, mediante Open
          Multilingual WordNet 1.4. Equivalencias alineadas por significado.
        </p>
        <a href={`${assetBase}/assets/verbs/NOTICE.md`} target="_blank" rel="noreferrer">
          WordNet / OMW · CC BY-SA 3.0 · Licencias y atribución
        </a>
      </details>
    </section>
  );
}
