'use client';
import { useEffect, useRef, useState } from 'react';
import { Headphones, Mic, Square, Volume2 } from 'lucide-react';
import { courseRoute } from '@/lib/course-route';
import { oralEvidence, oralTask, type OralInput } from '@/lib/oral-practice';
import { read, write } from '@/lib/browser/storage';
import { isPortuguese, studyStorage } from '@/lib/workspace';
import type { Snapshot } from '@/lib/types';
import { api, Button, Heading, Speak } from './ui';
import { StudyCopy } from './study-copy';
import { Correction } from './correction';
import { pronunciationNotes } from '@/locales/learning/pronunciation-notes';

function Copy({ en, pt, es }: { en: string; pt: string; es: string }) {
  return <StudyCopy native={isPortuguese ? pt : en}>{es}</StudyCopy>;
}
type Draft = {
  id: string;
  mode: OralInput['mode'];
  level: OralInput['level'];
  transcript: string;
  note: string;
  answers: (number | null)[];
  heard: boolean;
  helpUsed: boolean;
  duration: number;
  mime: string;
};
const fresh = (level: OralInput['level']): Draft => ({
  id: crypto.randomUUID(),
  mode: 'recording',
  level,
  transcript: '',
  note: '',
  answers: [null, null],
  heard: false,
  helpUsed: false,
  duration: 0,
  mime: '',
});
export function OralPractice({
  data,
  refresh,
  initialMode = 'recording',
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  initialMode?: 'recording' | 'listening';
}) {
  const pt = isPortuguese,
    activeLevel = courseRoute(data).level;
  const [draft, setDraft] = useState<Draft>(() => ({ ...fresh(activeLevel), mode: initialMode }));
  const [ready, setReady] = useState(false),
    [recording, setRecording] = useState(false),
    [audioPending, setAudioPending] = useState(false),
    [busy, setBusy] = useState(false),
    [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<Blob | null>(null),
    [url, setUrl] = useState(''),
    [historyAudio, setHistoryAudio] = useState<Record<string, string>>({});
  const [visibleText, setVisibleText] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState('');
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    elapsed = useRef(0),
    draftRef = useRef(draft),
    pendingRef = useRef(audioPending),
    alive = useRef(true),
    historyUrls = useRef(new Map<string, string>());
  draftRef.current = draft;
  pendingRef.current = audioPending;
  const task = oralTask(draft.level, pt),
    attempts = oralEvidence(data).slice().reverse();
  const native = (en: string, br: string) => (pt ? br : en);
  useEffect(() => {
    alive.current = true;
    try {
      const raw = studyStorage.getItem('oral-draft:v1');
      if (raw) {
        const old = JSON.parse(raw) as Draft;
        if (
          /^[\da-f-]{36}$/i.test(old.id) &&
          ['recording', 'listening'].includes(old.mode) &&
          ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(old.level) &&
          typeof old.note === 'string' &&
          typeof old.transcript === 'string' &&
          Array.isArray(old.answers) &&
          old.answers.length === 2 &&
          old.answers.every((a) => a === null || (Number.isInteger(a) && a >= 0 && a <= 2)) &&
          !attempts.some((a) => a.id === old.id)
        ) {
          setDraft(old);
          setVisibleText(old.helpUsed);
          void read<Blob>(`oral-audio:${old.id}`).then((blob) => {
            if (blob instanceof Blob && alive.current) setAudio(blob);
          });
        }
      }
    } catch {
      setError(
        native(
          'The draft could not be opened. Saved history is unchanged.',
          'Não foi possível abrir o rascunho. O histórico salvo continua preservado.',
        ),
      );
    }
    setReady(true);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (recorder.current?.state === 'recording' || pendingRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      alive.current = false;
      if (recorder.current?.state === 'recording') recorder.current.stop();
      stream.current?.getTracks().forEach((t) => t.stop());
      window.speechSynthesis?.cancel();
      window.removeEventListener('beforeunload', beforeUnload);
      for (const value of historyUrls.current.values()) URL.revokeObjectURL(value);
    };
  }, []);
  useEffect(() => {
    if (!ready || saved) return;
    try {
      studyStorage.setItem('oral-draft:v1', JSON.stringify(draft));
    } catch {
      setError(
        native(
          'The draft could not be saved. Keep a copy before leaving.',
          'Não foi possível salvar o rascunho. Guarde uma cópia antes de sair.',
        ),
      );
    }
  }, [draft, ready, saved]);
  useEffect(() => {
    if (!audio) {
      setUrl('');
      return;
    }
    const value = URL.createObjectURL(audio);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [audio]);
  useEffect(() => {
    for (const attempt of attempts.filter((a) => a.mode === 'recording').slice(0, 12)) {
      if (historyUrls.current.has(attempt.id)) continue;
      void read<Blob>(`oral-audio:${attempt.id}`).then((blob) => {
        if (!(blob instanceof Blob) || !alive.current) return;
        const value = URL.createObjectURL(blob);
        historyUrls.current.set(attempt.id, value);
        setHistoryAudio((current) => ({ ...current, [attempt.id]: value }));
      });
    }
  }, [data.tutorMessages]);
  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => {
      const duration = Math.min(120, (Date.now() - elapsed.current) / 1000);
      setDraft((d) => ({ ...d, duration }));
      if (duration >= 120) recorder.current?.stop();
    }, 500);
    return () => clearInterval(timer);
  }, [recording]);
  async function record() {
    if (audioPending || recording || busy) return;
    setError('');
    setSaved(false);
    if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
      setError(
        native(
          'Audio recording is unavailable in this browser. You can still use the model and listening activity.',
          'A gravação não está disponível neste navegador. Você ainda pode usar o modelo e a atividade de escuta.',
        ),
      );
      return;
    }
    setAudioPending(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!alive.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find((m) =>
        MediaRecorder.isTypeSupported(m),
      );
      const rec = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
      recorder.current = rec;
      const chunks: Blob[] = [];
      const id = draft.id;
      rec.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      rec.onerror = () => {
        setError(
          native(
            'Recording failed. Try again; no grade was assigned.',
            'A gravação falhou. Tente novamente; nenhuma nota foi atribuída.',
          ),
        );
        media.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      rec.onstop = () => {
        if (alive.current) setAudioPending(true);
        media.getTracks().forEach((t) => t.stop());
        const duration = Math.min(120, Math.max(0.1, (Date.now() - elapsed.current) / 1000));
        const clip = new Blob(chunks, { type: rec.mimeType || chunks[0]?.type || 'audio/webm' });
        if (alive.current) setRecording(false);
        if (!clip.size || clip.size > 10 * 1024 * 1024) {
          if (alive.current) setAudioPending(false);
          if (alive.current)
            setError(
              native(
                'The recording is empty or too large. Record a shorter clip.',
                'A gravação está vazia ou é grande demais. Grave um trecho mais curto.',
              ),
            );
          return;
        }
        void write(`oral-audio:${id}`, clip)
          .then(() => {
            const next = { ...draftRef.current, id, duration, mime: clip.type };
            studyStorage.setItem('oral-draft:v1', JSON.stringify(next));
            if (alive.current) {
              setAudio(clip);
              setDraft(next);
            }
          })
          .catch(() => {
            if (alive.current) {
              setAudio(clip);
              setDraft((d) => ({ ...d, duration, mime: clip.type }));
              setError(
                native(
                  'Browser storage is full. Download your recording before leaving.',
                  'O armazenamento está cheio. Baixe sua gravação antes de sair.',
                ),
              );
            }
          })
          .finally(() => {
            if (alive.current) setAudioPending(false);
          });
      };
      setAudio(null);
      setDraft((d) => ({ ...d, duration: 0 }));
      elapsed.current = Date.now();
      rec.start(1000);
      setRecording(true);
    } catch {
      stream.current?.getTracks().forEach((t) => t.stop());
      setError(
        native(
          'Microphone access was denied or unavailable. No audio was saved; listening remains available.',
          'O acesso ao microfone foi negado ou está indisponível. Nenhum áudio foi salvo; a escuta continua disponível.',
        ),
      );
    } finally {
      if (alive.current) setAudioPending(false);
    }
  }
  function listen() {
    setError('');
    if (!window.speechSynthesis) {
      setError(
        native(
          'Spoken playback is unavailable. You can reveal the transcript for supported practice.',
          'A reprodução por voz está indisponível. Pode abrir a transcrição para uma prática com apoio.',
        ),
      );
      return;
    }
    const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith(pt ? 'pt' : 'en'));
    if (!voices.some((v) => v.localService)) {
      setError(
        native(
          'No local voice is installed. Open the transcript for supported practice, or install a device voice in system settings.',
          'Nenhuma voz local está instalada. Abra a transcrição para praticar com apoio ou instale uma voz nas configurações do dispositivo.',
        ),
      );
      return;
    }
    speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(task.story);
    speech.lang = pt ? 'pt-BR' : 'en-US';
    speech.rate = 0.86;
    speech.voice = voices.find((v) => v.localService)!;
    speech.onstart = () => setPlaying(true);
    speech.onend = () => {
      setPlaying(false);
      setDraft((d) => ({ ...d, heard: true }));
    };
    speech.onerror = () => {
      setPlaying(false);
      setError(
        native(
          'Playback did not finish. Try again or use the transcript.',
          'A reprodução não terminou. Tente novamente ou use a transcrição.',
        ),
      );
    };
    speechSynthesis.speak(speech);
  }
  async function save() {
    setBusy(true);
    setError('');
    try {
      if (draft.mode === 'recording' && (!audio || !draft.duration))
        throw new Error(
          native('Record and stop the audio first.', 'Grave e pare o áudio primeiro.'),
        );
      if (
        draft.mode === 'listening' &&
        (draft.answers.some((a) => a === null) || (!draft.heard && !visibleText))
      )
        throw new Error(
          native(
            'Listen or open the transcript, then answer both questions.',
            'Escute ou abra a transcrição e responda às duas perguntas.',
          ),
        );
      if (draft.mode === 'recording') await write(`oral-audio:${draft.id}`, audio);
      const response = await api<{
        evidence: OralInput;
        correct: number | null;
        total: number | null;
      }>('oral/attempt', {
        ...draft,
        kind: 'oral-v1',
        transcriptSource: draft.transcript.trim() ? 'manual' : null,
        answers: draft.mode === 'listening' ? draft.answers : [],
        helpUsed: draft.helpUsed || (draft.mode === 'listening' && !draft.heard),
      });
      setDraft({
        ...response.evidence,
        answers: response.evidence.mode === 'listening' ? response.evidence.answers : [null, null],
      });
      setSaved(true);
      studyStorage.setItem('oral-draft:v1', '');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function next(mode: Draft['mode']) {
    if (recording || busy || audioPending) return;
    if (audio && !saved) {
      setError(
        native(
          'Save this recording before starting another activity. Its audio is kept in your draft.',
          'Salve esta gravação antes de começar outra atividade. O áudio está mantido no rascunho.',
        ),
      );
      return;
    }
    setDraft({ ...fresh(activeLevel), mode });
    setAudio(null);
    setSaved(false);
    setError('');
    setVisibleText(false);
    window.speechSynthesis?.cancel();
    setPlaying(false);
  }
  return (
    <div className={`oral-room ${recording || audioPending ? 'oral-recording-active' : ''}`}>
      <Heading
        eyebrow={native('LISTEN. SPEAK. REFLECT.', 'ESCUTE. FALE. REFLITA.')}
        title={native('Oral practice', 'Prática oral')}
        description={native(
          'Short tasks, your own recording, clear limits.',
          'Tarefas curtas, sua gravação e limites claros.',
        )}
      />
      <Copy
        en="Practice listening and record yourself. A recording or a transcript is not a pronunciation assessment."
        pt="Pratique a escuta e grave sua voz. Uma gravação ou transcrição não é uma avaliação de pronúncia."
        es="Practicá escucha y grabá tu voz. Una grabación o transcripción no equivale a evaluar tu pronunciación."
      />
      <div
        className="tabs oral-tabs"
        role="group"
        aria-label={native('Oral practice sections', 'Seções de prática oral')}
        data-no-word-help
      >
        <button
          aria-pressed={draft.mode === 'recording'}
          disabled={recording || busy || audioPending}
          onClick={() => next('recording')}
        >
          <Mic size={18} />
          {native('Record & review', 'Gravar e revisar')}
        </button>
        <button
          aria-pressed={draft.mode === 'listening'}
          disabled={recording || busy || audioPending}
          onClick={() => next('listening')}
        >
          <Headphones size={18} />
          {native('Listening lab', 'Laboratório de escuta')}
        </button>
      </div>
      <section className="card oral-task">
        <span className="pill neutral">
          {draft.level} · {native('Practice, not certification', 'Prática, não certificação')}
        </span>
        {draft.mode === 'recording' ? (
          <>
            <h2>
              {native('Say something that is true for you.', 'Diga algo verdadeiro sobre você.')}
            </h2>
            <StudyCopy native={task.prompt}>{task.spanishPrompt}</StudyCopy>
            <details>
              <summary>{native('Hear a model', 'Ouvir um modelo')}</summary>
              <blockquote>{task.model}</blockquote>
              <p lang="es">{task.spanishModel}</p>
              <Speak text={task.model} />
            </details>
            <Copy
              en="Plan a short answer, record up to two minutes, then listen back. Compare the message with the goal—not with an invented score."
              pt="Planeje uma resposta curta, grave até dois minutos e escute depois. Compare a mensagem com o objetivo, não com uma nota inventada."
              es="Planeá una respuesta corta, grabá hasta dos minutos y escuchate. Compará el mensaje con el objetivo, sin una nota inventada."
            />
            <div className="oral-controls" data-no-word-help>
              <Button
                disabled={!ready || busy || saved || audioPending || Boolean(audio)}
                onClick={() => (recording ? recorder.current?.stop() : void record())}
              >
                {recording ? <Square size={17} /> : <Mic size={17} />}{' '}
                {recording
                  ? native('Stop recording', 'Parar gravação')
                  : native('Record audio', 'Gravar áudio')}
              </Button>
              <span role="status">
                {Math.floor(draft.duration)} s ·{' '}
                {recording
                  ? native('Recording', 'Gravando')
                  : native('Duration only', 'Apenas duração')}
              </span>
            </div>
            {url && (
              <div className="oral-audio">
                <audio controls src={url} aria-label={native('Your recording', 'Sua gravação')} />
                <a
                  className="text-link"
                  href={url}
                  download={`practice-${draft.id}.${draft.mime.includes('mp4') ? 'm4a' : draft.mime.includes('ogg') ? 'ogg' : 'webm'}`}
                >
                  {native('Download audio', 'Baixar áudio')}
                </a>
              </div>
            )}
            <label className="field">
              {native('Your transcript or notes (optional)', 'Sua transcrição ou notas (opcional)')}
              <small lang="es">
                Tu transcripción o notas, opcional. Es texto ingresado por vos, no reconocimiento
                automático.
              </small>
              <textarea
                disabled={recording || busy || saved}
                rows={3}
                maxLength={1200}
                value={draft.transcript}
                onChange={(e) => setDraft((d) => ({ ...d, transcript: e.target.value }))}
              />
            </label>
            <label className="field">
              {native('One thing to improve next time', 'Uma coisa para melhorar na próxima vez')}
              <small lang="es">Una cosa para mejorar la próxima vez.</small>
              <textarea
                disabled={recording || busy || saved}
                rows={2}
                maxLength={450}
                value={draft.note}
                onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
              />
            </label>
            <details className="oral-self-review">
              <summary>{native('A useful self-review', 'Uma revisão útil')}</summary>
              <ul>
                <li>
                  {native(
                    'Did I answer the task and include a concrete detail?',
                    'Respondi à tarefa e incluí um detalhe concreto?',
                  )}
                </li>
                <li>
                  {native(
                    'Did my verbs match the time I wanted to express?',
                    'Meus verbos combinaram com o tempo que quis expressar?',
                  )}
                </li>
                <li>
                  {native(
                    'Where did I pause? What phrase would help me next time?',
                    'Onde fiz pausas? Qual expressão ajudaria na próxima vez?',
                  )}
                </li>
              </ul>
              <Copy
                en="These questions guide reflection. They do not produce a fluency, pronunciation or CEFR score."
                pt="Estas perguntas orientam a reflexão. Não produzem nota de fluência, pronúncia ou MCER."
                es="Estas preguntas orientan la reflexión. No generan notas de fluidez, pronunciación ni MCER."
              />
            </details>
          </>
        ) : (
          <>
            <h2>{native('Listen for meaning.', 'Escute para entender.')}</h2>
            <Copy
              en="Listen to a short message, then answer two questions. The voice is generated by your browser, not a native-speaker recording. Two answers are a small sample, not a listening level."
              pt="Escute um recado curto e responda a duas perguntas. A voz é gerada pelo navegador, não é uma gravação de falante nativo. Duas respostas são uma amostra pequena, não um nível de escuta."
              es="Escuchá un mensaje y respondé dos preguntas. La voz la genera el navegador, no es una grabación de un hablante nativo. Dos respuestas son una muestra pequeña, no un nivel auditivo."
            />
            <div className="oral-controls" data-no-word-help>
              <Button disabled={playing || busy} onClick={listen}>
                <Volume2 size={18} />
                {native('Listen to the message', 'Ouvir o recado')}
              </Button>
              <Button
                secondary
                disabled={busy}
                onClick={() => {
                  setVisibleText(true);
                  if (!saved) setDraft((d) => ({ ...d, helpUsed: true }));
                }}
              >
                {native('Show transcript (support)', 'Mostrar transcrição (apoio)')}
              </Button>
            </div>
            {visibleText && (
              <blockquote className="oral-transcript">
                {task.story}
                <span className="study-spanish" lang="es">
                  {task.spanishStory}
                </span>
              </blockquote>
            )}
            {task.questions.map((q, i) => (
              <fieldset
                key={`${draft.id}:${i}`}
                className="oral-question"
                disabled={saved || busy}
                data-no-word-help
              >
                <legend>
                  {i + 1}. {q}
                  <span className="study-spanish" lang="es">
                    {task.spanishQuestions[i]}
                  </span>
                </legend>
                {task.options[i].map((_, order) => {
                  const at = (order + Number.parseInt(draft.id.slice(0, 2), 16) + i) % 3;
                  return (
                    <label key={at}>
                      <input
                        type="radio"
                        name={`oral-${i}`}
                        checked={draft.answers[i] === at}
                        onChange={() =>
                          setDraft((d) => ({
                            ...d,
                            answers: d.answers.map((a, n) => (n === i ? at : a)),
                          }))
                        }
                      />
                      {task.options[i][at]}
                    </label>
                  );
                })}
                {saved && (
                  <Correction
                    explanation={task.whySpanish[i]}
                    explanationNative={task.whyNative[i]}
                    correction={task.options[i][0]}
                  />
                )}
              </fieldset>
            ))}
          </>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {!saved ? (
          <Button
            disabled={!ready || recording || busy || (draft.mode === 'recording' && !audio)}
            onClick={() => void save()}
          >
            {busy ? native('Saving…', 'Salvando…') : native('Save practice', 'Salvar prática')}
          </Button>
        ) : (
          <>
            <p className="oral-saved" role="status">
              {native('Saved in your history.', 'Salvo no seu histórico.')}
              {draft.mode === 'listening'
                ? ` ${draft.answers.filter((a) => a === 0).length} / 2`
                : ''}
            </p>
            <Copy
              en={
                draft.mode === 'recording'
                  ? 'Audio is stored on this device. Content, fluency and pronunciation are pending evaluation. A manual transcript is not speech recognition.'
                  : draft.helpUsed
                    ? 'Supported practice saved. Because you used the transcript, this does not count as independent listening evidence.'
                    : 'Two objective answers saved for this synthetic-voice task. This sample does not establish a CEFR listening level.'
              }
              pt={
                draft.mode === 'recording'
                  ? 'O áudio fica neste dispositivo. Conteúdo, fluência e pronúncia aguardam avaliação. Uma transcrição manual não é reconhecimento de voz.'
                  : draft.helpUsed
                    ? 'Prática com apoio salva. Como usou a transcrição, não conta como evidência independente de escuta.'
                    : 'Duas respostas objetivas salvas para esta tarefa de voz sintética. A amostra não estabelece um nível de escuta MCER.'
              }
              es={
                draft.mode === 'recording'
                  ? 'El audio queda en este dispositivo. Contenido, fluidez y pronunciación siguen pendientes de evaluación. Una transcripción manual no es reconocimiento de voz.'
                  : draft.helpUsed
                    ? 'Práctica con apoyo guardada. Como usaste la transcripción, no cuenta como evidencia auditiva independiente.'
                    : 'Dos respuestas objetivas guardadas de esta tarea con voz sintética. La muestra no establece un nivel auditivo MCER.'
              }
            />
            <Button secondary onClick={() => next(draft.mode)}>
              {native('Repeat this task', 'Repetir esta tarefa')}
            </Button>
          </>
        )}
      </section>
      <section className="card oral-history">
        <h2>{native('Your practice archive', 'Seu histórico de prática')}</h2>
        <Copy
          en="Recordings stay on this device and can be downloaded. The text history can be included in a backup; audio files are not synced or included in JSON exports."
          pt="As gravações ficam neste dispositivo e podem ser baixadas. O histórico em texto pode entrar no backup; os arquivos de áudio não são sincronizados nem incluídos na exportação JSON."
          es="Las grabaciones quedan en este dispositivo y se pueden descargar. El historial de texto puede incluirse en respaldos; los audios no se sincronizan ni se incluyen en la exportación JSON."
        />
        {!attempts.length && (
          <p>
            {native(
              'Your first saved practice will appear here.',
              'Sua primeira prática salva aparecerá aqui.',
            )}
          </p>
        )}
        {attempts.slice(0, 12).map((a) => (
          <article key={a.id}>
            <h3>
              {a.level} ·{' '}
              {a.mode === 'recording'
                ? native('Recording', 'Gravação')
                : native('Listening', 'Escuta')}
            </h3>
            <time dateTime={a.created_at}>
              {new Date(a.created_at).toLocaleString(pt ? 'pt-BR' : 'en')}
            </time>
            {a.mode === 'recording' ? (
              <>
                <p>
                  {Math.round(a.duration)} s ·{' '}
                  {native('Pronunciation: not assessed', 'Pronúncia: não avaliada')}
                </p>
                {historyAudio[a.id] ? (
                  <audio
                    src={historyAudio[a.id]}
                    controls
                    aria-label={native('Saved recording', 'Gravação salva')}
                  />
                ) : (
                  <p>
                    {native(
                      'Audio is not available on this device.',
                      'O áudio não está disponível neste dispositivo.',
                    )}
                  </p>
                )}
              </>
            ) : (
              <p>
                {a.correct} / {a.total} ·{' '}
                {a.helpUsed
                  ? native('With transcript support', 'Com apoio da transcrição')
                  : native('Synthetic listening task', 'Tarefa de escuta sintética')}
              </p>
            )}
            {a.transcript && <blockquote>{a.transcript}</blockquote>}
            {a.note && <p>{a.note}</p>}
          </article>
        ))}
      </section>
      <details className="pronunciation-guide">
        <summary>{pt ? 'Sons para observar' : 'Sounds to notice'}</summary>
        <p lang="es">
          Escuchá un modelo local, grabá la misma frase y compará. Esta guía no evalúa tu
          pronunciación.
        </p>
        {pronunciationNotes[pt ? 'pt' : 'en'].map((note) => (
          <article key={note.title}>
            <h3 lang={pt ? 'pt-BR' : 'en'}>{note.title}</h3>
            <p lang={pt ? 'pt-BR' : 'en'}>{note.native}</p>
            <p lang="es" className="study-spanish">
              {note.spanish}
            </p>
            <blockquote lang={pt ? 'pt-BR' : 'en'}>
              {note.example} <Speak text={note.example} />
            </blockquote>
          </article>
        ))}
      </details>
    </div>
  );
}
