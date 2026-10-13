'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Send, Headphones, Square, MessageCircle } from 'lucide-react';
import { voiceDocumentId, voiceTopics } from '@/lib/voice';
import { isPortuguese, studyStorage } from '@/lib/workspace';
import { recognitionConstructor, type Recognition } from '@/lib/browser/speech';
import type { Snapshot } from '@/lib/types';
import { api, Button, Heading } from './ui';
import {
  enableLocalAI,
  localStatus,
  oralReply,
  stopLocalAI,
  type LocalStatus,
} from '@/lib/browser/local-ai';
export function VoiceRoom({ data, refresh }: { data: Snapshot; refresh: () => Promise<void> }) {
  const [draft, setDraft] = useState(''),
    [topic, setTopic] = useState<string>('daily'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [listening, setListening] = useState(false),
    [status, setStatus] = useState<LocalStatus>({ state: 'off', loaded: 0, total: 0 });
  const [supported, setSupported] = useState(false),
    [allowBrowser, setAllowBrowser] = useState(false),
    [readAloud, setReadAloud] = useState(true),
    [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]),
    [voice, setVoice] = useState('');
  const mic = useRef<Recognition | null>(null),
    alive = useRef(true),
    sending = useRef(false),
    draftRef = useRef('');
  const lang = isPortuguese ? 'pt-BR' : 'en-US';
  const teacher = isPortuguese ? 'Clara' : 'Maya';
  const messages = data.tutorMessages.filter((item) => item.document_id === voiceDocumentId);
  const selected = voiceTopics.find((item) => item.id === topic)!;
  useEffect(() => {
    alive.current = true;
    setSupported(Boolean(recognitionConstructor()));
    setStatus(localStatus());
    setAllowBrowser(studyStorage.getItem('voice-room-browser-speech') === 'yes');
    const saved = studyStorage.getItem('voice-room-draft');
    if (saved) {
      setDraft(saved);
      draftRef.current = saved;
    }
    const update = () => setStatus(localStatus());
    window.addEventListener('english-local-ai', update);
    const updateVoices = () => {
      if ('speechSynthesis' in window)
        setVoices(
          speechSynthesis
            .getVoices()
            .filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2))),
        );
    };
    updateVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', updateVoices);
    return () => {
      alive.current = false;
      mic.current?.abort();
      if (sending.current) stopLocalAI();
      window.speechSynthesis?.cancel();
      window.removeEventListener('english-local-ai', update);
      window.speechSynthesis?.removeEventListener('voiceschanged', updateVoices);
    };
  }, [lang]);
  function edit(value: string) {
    setDraft(value);
    draftRef.current = value;
    studyStorage.setItem('voice-room-draft', value);
  }
  function speak(text: string) {
    if (!('speechSynthesis' in window)) {
      setError('This browser has no spoken playback. You can read the transcript.');
      return;
    }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.88;
    const chosen = voices.find((v) => v.voiceURI === voice);
    if (chosen) utterance.voice = chosen;
    utterance.onerror = (event) => {
      if (alive.current && !['canceled', 'interrupted'].includes(event.error))
        setError('Voice playback could not start. Tap Listen to try again.');
    };
    speechSynthesis.speak(utterance);
  }
  async function record() {
    setError('');
    const Constructor = recognitionConstructor();
    if (!Constructor) {
      setError('Voice recognition is not available here. You can type instead.');
      return;
    }
    const recognition = new Constructor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    if (!allowBrowser) {
      if (!('processLocally' in recognition) || !Constructor.available) {
        setError(
          'On-device speech recognition is not available in this browser. You can type, or allow browser speech recognition below.',
        );
        return;
      }
      try {
        const availability = await Constructor.available({ langs: [lang], processLocally: true });
        if (availability !== 'available') {
          setError(
            'The on-device speech pack for this language is not installed. You can type, or allow browser speech recognition below.',
          );
          return;
        }
        recognition.processLocally = true;
      } catch {
        setError('On-device speech recognition could not start. You can type instead.');
        return;
      }
    }
    window.speechSynthesis?.cancel();
    const prefix = draftRef.current.trim();
    mic.current = recognition;
    recognition.onresult = (event) => {
      if (!alive.current) return;
      const text = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join(' ');
      edit(`${prefix}${prefix ? ' ' : ''}${text}`.slice(0, 1000));
    };
    recognition.onerror = (event) => {
      if (alive.current) {
        setListening(false);
        setError(
          event.error === 'not-allowed'
            ? 'Microphone permission was denied. You can type instead.'
            : event.error === 'no-speech'
              ? 'No speech was detected. Try again or type your message.'
              : 'Voice recognition stopped. Check your microphone and connection, or type instead.',
        );
      }
    };
    recognition.onend = () => {
      if (alive.current) setListening(false);
      mic.current = null;
    };
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError('The microphone could not start. Try again or type instead.');
    }
  }
  async function send() {
    const text = draftRef.current.trim();
    if (!text || sending.current || status.state !== 'ready' || listening) return;
    sending.current = true;
    setBusy(true);
    setError('');
    try {
      await api('voice/message', {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        mode: 'user',
      });
      edit('');
      await refresh();
      if (!alive.current) return;
      const reply = await oralReply(text, data.tutorMessages, selected.title);
      if (!alive.current) return;
      await api('voice/message', {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply.content,
        mode: reply.mode,
      });
      await refresh();
      if (alive.current && readAloud) speak(reply.content);
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      sending.current = false;
      if (alive.current) setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="YOUR SPEAKING CORNER"
        title="Let’s talk."
        description="Speak, check your words, and hear your AI tutor reply."
      />
      <section className="card voice-room">
        <div className="voice-teacher">
          <span className="voice-avatar" aria-hidden="true">
            <Headphones size={34} />
          </span>
          <div>
            <h2>{teacher}</h2>
            <p>AI language tutor · patient, clear, encouraging</p>
          </div>
        </div>
        <details className="voice-about">
          <summary>About your tutor</summary>
          <p>
            A fictional AI tutor with a teaching style inspired by experienced educators. It has no
            real degrees, career history or awards. The small local model can make mistakes. Voice
            transcripts are not pronunciation assessments.
          </p>
        </details>
        <div className="tabs voice-topic-tabs" aria-label="Conversation topics">
          {voiceTopics.map((item) => (
            <button
              key={item.id}
              className={topic === item.id ? 'active' : ''}
              onClick={() => setTopic(item.id)}
              disabled={busy || listening}
            >
              {item.title}
            </button>
          ))}
        </div>
        <div className="voice-starter">
          <MessageCircle size={20} />
          <div>
            <strong>{selected.prompt}</strong>
            <details>
              <summary>Help me start</summary>
              <p>{selected.example}</p>
              <p className="fine-print">Change one detail to make it about you.</p>
              <Button secondary onClick={() => edit(selected.example)} disabled={busy || listening}>
                Use this example
              </Button>
            </details>
          </div>
        </div>
        {status.state !== 'ready' && status.state !== 'generating' && (
          <div className="voice-enable">
            <p>Use the same local AI as PDF Studio. First download: about 98 MB; no paid API.</p>
            <Button
              disabled={status.state === 'loading'}
              onClick={() => {
                setError('');
                void enableLocalAI().catch((e) => setError(e.message));
              }}
            >
              {status.state === 'loading' ? 'Preparing your tutor…' : 'Enable local tutor'}
            </Button>
            {status.state === 'loading' && (
              <progress
                aria-label="AI download progress"
                max={status.total || 1}
                value={status.loaded}
              />
            )}
          </div>
        )}
        <div className="voice-transcript" role="log" aria-label="Conversation transcript">
          {messages.slice(-40).map((item) => (
            <div key={item.id} className={`voice-message ${item.role}`}>
              <span>{item.role === 'user' ? 'You' : teacher}</span>
              <p>{item.content}</p>
              {item.mode === 'guided' && (
                <span className="voice-mode">Practice prompt · the small model needed help</span>
              )}
              <button
                className="icon-button"
                aria-label="Listen to message"
                onClick={() => speak(item.content)}
              >
                <Volume2 size={17} />
              </button>
            </div>
          ))}
          {busy && <p role="status">Your tutor is thinking…</p>}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="voice-composer"
        >
          <label className="field">
            Your words
            <textarea
              value={draft}
              onChange={(e) => edit(e.target.value)}
              placeholder="Speak or type a message…"
              maxLength={1000}
              disabled={busy}
            />
          </label>
          <p className="fine-print">
            Check the transcript before sending. Your conversation is saved in this study space.
          </p>
          <div className="voice-controls">
            <Button
              type="button"
              secondary
              disabled={!supported || busy || status.state === 'loading'}
              onClick={() => (listening ? mic.current?.stop() : void record())}
            >
              {listening ? (
                <>
                  <MicOff size={18} /> Stop recording
                </>
              ) : (
                <>
                  <Mic size={18} /> Start speaking
                </>
              )}
            </Button>
            <Button
              type="submit"
              disabled={!draft.trim() || busy || listening || status.state !== 'ready'}
            >
              <Send size={17} /> Send
            </Button>
            {busy && (
              <Button secondary type="button" onClick={stopLocalAI}>
                <Square size={16} /> Stop reply
              </Button>
            )}
          </div>
        </form>
        {!supported && (
          <p className="fine-print">
            This browser does not support microphone transcription. Typing and listening remain
            available.
          </p>
        )}
        <details className="voice-options">
          <summary>Voice options</summary>
          <label>
            <input
              type="checkbox"
              checked={readAloud}
              onChange={(e) => setReadAloud(e.target.checked)}
            />{' '}
            Read replies aloud
          </label>
          <label className="field">
            Playback voice
            <select value={voice} onChange={(e) => setVoice(e.target.value)}>
              <option value="">Device default</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={allowBrowser}
              onChange={(e) => {
                setAllowBrowser(e.target.checked);
                studyStorage.setItem('voice-room-browser-speech', e.target.checked ? 'yes' : 'no');
              }}
              disabled={listening}
            />{' '}
            Allow browser speech recognition
          </label>
          <p className="fine-print">
            If enabled, your browser may send audio to its speech provider. Otherwise only available
            on-device recognition is used. No audio recording is saved by this app.
          </p>
        </details>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
    </>
  );
}
