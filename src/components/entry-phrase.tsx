'use client';
import { useEffect, useState } from 'react';
import { entryPhrases } from '@/locales/learning/entry-phrases';
import { isPortuguese } from '@/lib/workspace';
import { Speak } from './ui';
export function EntryPhrase() {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(Math.floor(Date.now() / 1000) % entryPhrases.length), []);
  const phrase = entryPhrases[index];
  return (
    <section className="entry-phrase" aria-label="A phrase to begin">
      <span aria-hidden="true" className="phrase-mark">
        “
      </span>
      <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>
        {isPortuguese ? phrase.pt : phrase.en}
      </blockquote>
      <p lang="es">{phrase.es}</p>
      <div>
        <span>ONE THOUGHT TO TAKE WITH YOU</span>
        <Speak text={isPortuguese ? phrase.pt : phrase.en} />
      </div>
    </section>
  );
}
