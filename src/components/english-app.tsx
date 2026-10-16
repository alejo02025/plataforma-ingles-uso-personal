'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle, Settings2, X } from 'lucide-react';
import { assetBase, isPortuguese } from '@/lib/workspace';
import type { Snapshot, Activity, Document } from '@/lib/types';
import type { StudyTask } from '@/lib/daily-study';
import { Today } from './today';
import { RoutinePractice } from './routine-practice';
import { Diagnostic } from './diagnostic';
import { Classes } from './classes';
import { Vocabulary } from './vocabulary';
import { Games } from './games';
import { OralPractice } from './oral-practice';
import { LanguageHelp } from './language-help';
import { Library } from './library';
import { PdfStudio } from './pdf-studio';
import { NewsBriefing } from './news-briefing';
import { Reader } from './reader';
import { Practice } from './practice';
import { Progress, Calendar } from './analytics';
import { GitHubSync } from './github-sync';
import { OfflineStatus } from './offline-status';
import { blockedSpaceChangeEvent, LanguageSwitcher, SpaceLink } from './space-link';
import { AppUpdate } from './app-update';
import { DailyWords } from './daily-words';
import { WordHelpCloud } from './word-help';
import { api, Button, EmbeddedHeadings, DownloadLink } from './ui';
export function EnglishApp() {
  const [data, setData] = useState<Snapshot | null>(null),
    [view, setView] = useState('Home');
  const [suggestedClass, setSuggestedClass] = useState('');
  const [suggestedGame, setSuggestedGame] = useState('');
  const [classroomVisit, setClassroomVisit] = useState(0);
  const [active, setActive] = useState<Activity | null>(null),
    [error, setError] = useState(''),
    [locked, setLocked] = useState(false),
    [token, setToken] = useState('');
  const [opening, setOpening] = useState(false);
  const refresh = useCallback(async () => {
    const state = await api<Snapshot>('state');
    setData(state);
    document.documentElement.dataset.theme = state.profile.theme;
    document.documentElement.dataset.studyLanguage = isPortuguese ? 'pt' : 'en';
  }, []);
  useEffect(() => {
    const onBlockedSpaceChange = () =>
      setError(
        isPortuguese
          ? 'Finalize ou cancele a gravação antes de trocar de idioma.'
          : 'Finish or cancel the recording before changing language.',
      );
    const onRemoteChange = () => {
      void refresh().catch((e) => setError(e.message));
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') onRemoteChange();
    };
    window.addEventListener('english-data-changed', onRemoteChange);
    window.addEventListener(blockedSpaceChangeEvent, onBlockedSpaceChange);
    document.addEventListener('visibilitychange', onVisible);
    refresh().catch((e) => {
      if (e.message.includes('access key')) setLocked(true);
      else setError(e.message);
    });
    return () => {
      window.removeEventListener('english-data-changed', onRemoteChange);
      window.removeEventListener(blockedSpaceChangeEvent, onBlockedSpaceChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);
  async function navigate(target: string) {
    if (document.querySelector('.oral-recording-active')) {
      setError(
        isPortuguese
          ? 'Pare a gravação antes de sair desta seção.'
          : 'Stop the recording before leaving this section.',
      );
      return;
    }
    setSuggestedClass('');
    setSuggestedGame('');
    setClassroomVisit((v) => v + 1);
    setView(
      ['Speaking', 'Course practice'].includes(target)
        ? 'Language help'
        : target === 'MCER'
          ? 'Classes'
          : target,
    );
    setActive(null);
    setError('');
    try {
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function openDocument(doc: Document) {
    setOpening(true);
    setError('');
    try {
      const { id } = await api<{ id: string }>('reading-activity', { documentId: doc.id });
      const state = await api<Snapshot>('state');
      setData(state);
      setActive(state.plan.activities.find((a) => a.id === id)!);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOpening(false);
    }
  }
  function onStart(a: Activity) {
    setActive(a);
    window.scrollTo({ top: 0 });
  }
  if (locked)
    return (
      <div className="auth-page">
        <section className="card auth-card">
          <Logo />
          <span className="eyebrow">YOUR PRIVATE SPACE</span>
          <h1>Welcome back.</h1>
          <p className="muted">Enter your English OS access key.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              try {
                await api('login', { token });
                await refresh();
                setLocked(false);
                setToken('');
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <label className="field">
              Access key{' '}
              <input
                type="password"
                autoFocus
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            <Button type="submit">
              Sign in <ArrowUpRight size={16} />
            </Button>
          </form>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>
      </div>
    );
  if (!data)
    return (
      <div className="loading-screen">
        <Logo />
        {error ? (
          <>
            <p role="alert">{error}</p>
            <Button
              onClick={() => {
                setError('');
                void refresh().catch((e) => setError(e.message));
              }}
            >
              Try again{' '}
            </Button>
          </>
        ) : (
          <>
            <LoaderCircle className="spinner" size={25} />
            <p>Preparing your space…</p>
          </>
        )}
      </div>
    );
  const pt = isPortuguese;
  const area =
    view === 'Settings' || view === 'Assessment'
      ? 'settings'
      : ['Classes', 'Language help', 'MCER'].includes(view)
        ? 'classes'
        : ['Vocabulary', 'Practice', 'Games', 'Oral practice'].includes(view)
          ? 'review'
          : ['PDF Studio', 'Library', 'News'].includes(view)
            ? 'library'
            : ['Progress', 'Calendar'].includes(view)
              ? 'progress'
              : 'today';
  const destinations = [
    { area: 'today', target: 'Home', label: pt ? 'Hoje' : 'Today', emoji: '☀️' },
    { area: 'classes', target: 'Classes', label: pt ? 'Aulas' : 'Classes', emoji: '📚' },
    { area: 'review', target: 'Vocabulary', label: pt ? 'Revisão' : 'Review', emoji: '🧠' },
    {
      area: 'library',
      target: 'PDF Studio',
      label: pt ? 'Biblioteca' : 'Library',
      emoji: '📖',
    },
    {
      area: 'progress',
      target: 'Progress',
      label: pt ? 'Progresso' : 'Progress',
      emoji: '🌱',
    },
  ];
  const groups: Record<string, { target: string; label: string }[]> = {
    classes: [
      { target: 'Classes', label: pt ? 'Percurso' : 'Course' },
      { target: 'Language help', label: pt ? 'Guia de idioma' : 'Language reference' },
    ],
    review: [
      { target: 'Vocabulary', label: pt ? 'Palavras' : 'Words' },
      { target: 'Practice', label: pt ? 'Prática' : 'Practice' },
      { target: 'Games', label: pt ? 'Jogos' : 'Games' },
      { target: 'Oral practice', label: pt ? 'Ouvir e gravar' : 'Listen & record' },
    ],
    library: [
      { target: 'PDF Studio', label: pt ? 'Meus arquivos' : 'My files' },
      { target: 'Library', label: pt ? 'Leituras' : 'Readings' },
      { target: 'News', label: pt ? 'Notícias' : 'News' },
    ],
    progress: [
      { target: 'Progress', label: pt ? 'Visão geral' : 'Overview' },
      { target: 'Calendar', label: pt ? 'Calendário' : 'Calendar' },
    ],
  };
  const areaTitle =
    destinations.find((d) => d.area === area)?.label || (pt ? 'Ajustes' : 'Settings');
  const doc = data.documents.find((d) => d.id === active?.document_id);
  async function startTask(task: StudyTask) {
    try {
      const action = task.action;
      if (action.kind === 'activity') {
        const activity = [
          ...data!.plan.activities,
          ...(data!.backlog || []),
          ...(data!.resumeActivity ? [data!.resumeActivity] : []),
        ].find((a) => a.id === action.id);
        if (!activity)
          throw new Error(
            pt
              ? 'Esta atividade não está disponível. Veja seus arquivos.'
              : 'This activity is unavailable. Check your files.',
          );
        onStart(activity);
      } else if (action.kind === 'class') {
        setView('Classes');
        setSuggestedClass(action.id);
        setClassroomVisit((v) => v + 1);
      } else if (action.kind === 'review') {
        void navigate('Vocabulary');
      } else if (action.mode === 'writing') {
        const activity = await api<Activity>('course/writing', {});
        await refresh();
        onStart(activity);
      } else {
        window.dispatchEvent(
          new CustomEvent('english-os:routine-start', {
            detail: { mode: action.mode, level: action.level, block: action.block },
          }),
        );
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="app-shell" data-area={area.toLowerCase()}>
      <a className="skip-learning-link" href="#main-content">
        {pt ? 'Ir para o conteúdo' : 'Skip to learning'}
      </a>
      <aside className="sidebar">
        <Logo />
        <nav className="nav-primary" aria-label={pt ? 'Navegação principal' : 'Main navigation'}>
          {destinations.map((d) => (
            <button
              key={d.area}
              className={`nav-item ${area === d.area ? 'active' : ''}`}
              aria-current={area === d.area ? 'page' : undefined}
              onClick={() => void navigate(d.target)}
            >
              <span className="nav-emoji" aria-hidden>
                {d.emoji}
              </span>
              <span>{d.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${area === 'settings' ? 'active' : ''}`}
            onClick={() => void navigate('Settings')}
          >
            <Settings2 size={18} />
            {pt ? 'Ajustes' : 'Settings'}
          </button>
          <div className="space-owner">
            <span className="owner-avatar" aria-hidden>
              {data.profile.name.slice(0, 1).toLocaleUpperCase()}
            </span>
            <span>{data.profile.name}</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <div className="workspace-masthead">
          <div className="mobile-brand">
            <Logo />
          </div>
          <LanguageSwitcher portuguese={pt} />
          <button
            className="icon-button mobile-settings"
            aria-label={pt ? 'Ajustes' : 'Settings'}
            onClick={() => void navigate('Settings')}
          >
            <Settings2 size={19} />
          </button>
        </div>
        <main id="main-content" tabIndex={-1}>
          {error && (
            <div role="alert" className="error global-error">
              {error}
              <button
                className="icon-button"
                aria-label={pt ? 'Fechar mensagem' : 'Dismiss message'}
                onClick={() => setError('')}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {opening && (
            <p className="operation-indicator" role="status">
              {pt ? 'Abrindo seu material…' : 'Opening your material…'}
            </p>
          )}
          <div className="runtime-services" hidden={area !== 'settings'}>
            <div id="app-updates" />
            <AppUpdate />
            <OfflineStatus />
          </div>
          <header hidden={area === 'today' && !active} className="workspace-heading">
            <div className="workspace-title-row">
              {(area !== 'today' || active) && (
                <span className="workspace-kicker" aria-hidden>
                  {destinations.find((d) => d.area === area)?.emoji || '⚙️'}
                </span>
              )}
              {(area !== 'today' || active) && (
                <h1>{active ? (pt ? 'Atividade' : 'Activity') : areaTitle}</h1>
              )}
              <WordHelpCloud data={data} refresh={refresh} />
            </div>
            {groups[area] && (
              <nav className="section-tabs" aria-label={pt ? 'Seções' : 'Sections'}>
                {groups[area].map((t) => (
                  <button
                    key={t.target}
                    aria-current={view === t.target ? 'page' : undefined}
                    className={view === t.target ? 'active' : ''}
                    onClick={() => void navigate(t.target)}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            )}
          </header>
          <EmbeddedHeadings>
            {active ? (
              active.kind === 'reading' && doc ? (
                <Reader
                  key={active.id}
                  document={doc}
                  activity={active}
                  data={data}
                  refresh={refresh}
                  close={() => void navigate(view)}
                />
              ) : (
                <Practice
                  key={active.id}
                  activity={active}
                  data={data}
                  refresh={refresh}
                  close={() => void navigate(view)}
                />
              )
            ) : view === 'Assessment' ? (
              <Diagnostic data={data} refresh={refresh} close={() => void navigate('Settings')} />
            ) : view === 'Home' || view === 'My Day' ? (
              <Today
                data={data}
                refresh={refresh}
                onTask={(task) => void startTask(task)}
                navigate={(target) => void navigate(target)}
              />
            ) : view === 'PDF Studio' ? (
              <PdfStudio data={data} refresh={refresh} onRead={(doc) => void openDocument(doc)} />
            ) : view === 'Library' ? (
              <Library data={data} onOpen={(doc) => void openDocument(doc)} refresh={refresh} />
            ) : view === 'News' ? (
              <NewsBriefing />
            ) : view === 'Classes' || view === 'MCER' ? (
              <Classes
                key={classroomVisit}
                data={data}
                refresh={refresh}
                navigate={(target) => void navigate(target)}
                onStart={onStart}
                initialLesson={suggestedClass}
              />
            ) : view === 'Language help' ? (
              <LanguageHelp
                onOpenLesson={(id) => {
                  setView('Classes');
                  setSuggestedClass(id);
                  setClassroomVisit((v) => v + 1);
                }}
              />
            ) : view === 'Vocabulary' ? (
              <>
                <div className="review-tools">
                  <span id="daily-word-slot" />
                </div>
                <Vocabulary data={data} refresh={refresh} embedded />
                <DailyWords
                  data={data}
                  refresh={refresh}
                  openVocabulary={() => void navigate('Vocabulary')}
                />
              </>
            ) : view === 'Practice' ? (
              <RoutinePractice
                data={data}
                refresh={refresh}
                onStart={onStart}
                onClass={(id) => {
                  setView('Classes');
                  setSuggestedClass(id);
                }}
                onGame={(seed) => {
                  setView('Games');
                  setSuggestedGame(seed);
                }}
              />
            ) : view === 'Games' ? (
              <Games data={data} refresh={refresh} initialSeed={suggestedGame} />
            ) : view === 'Oral practice' ? (
              <OralPractice data={data} refresh={refresh} />
            ) : view === 'Progress' ? (
              <Progress data={data} navigate={(target) => void navigate(target)} />
            ) : view === 'Calendar' ? (
              <Calendar data={data} />
            ) : (
              <Preferences
                data={data}
                refresh={refresh}
                close={() => {}}
                onDiagnostic={() => void navigate('Assessment')}
              />
            )}
          </EmbeddedHeadings>
        </main>
      </div>
      <nav
        className="mobile-bottom-nav"
        aria-label={pt ? 'Navegação principal' : 'Main navigation'}
      >
        {destinations.map((d) => (
          <button
            key={d.area}
            aria-current={area === d.area ? 'page' : undefined}
            onClick={() => void navigate(d.target)}
          >
            <span className="nav-emoji bottom-emoji" aria-hidden>
              {d.emoji}
            </span>
            <span>{d.label}</span>
          </button>
        ))}
      </nav>
      <RoutinePractice
        data={data}
        refresh={refresh}
        onStart={onStart}
        onClass={(id) => {
          setView('Classes');
          setSuggestedClass(id);
        }}
        onGame={(seed) => {
          setView('Games');
          setSuggestedGame(seed);
        }}
        compact
      />
    </div>
  );
}

function Logo() {
  return (
    <div className="logo">
      <img
        className="logo-mark"
        alt=""
        width="36"
        height="36"
        src={`${assetBase}/assets/app/${isPortuguese ? 'portuguese-os-v1' : 'english-os-v1'}.svg`}
      />
      <span className="logo-wordmark">
        lingua<span className="logo-dot">.</span>
        <small>{isPortuguese ? 'Português' : 'English'}</small>
      </span>
    </div>
  );
}
function Preferences({
  data,
  refresh,
  close,
  onDiagnostic,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  close: () => void;
  onDiagnostic: () => void;
}) {
  const [profile, setProfile] = useState(data.profile),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const baseline = useRef(data.profile);
  useEffect(() => {
    const before = baseline.current as unknown as Record<string, unknown>;
    setProfile((current) => ({
      ...data.profile,
      ...Object.fromEntries(
        Object.entries(current).filter(
          ([key, value]) => JSON.stringify(value) !== JSON.stringify(before[key]),
        ),
      ),
    }));
    baseline.current = data.profile;
  }, [data.profile]);
  const [saved, setSaved] = useState(false);
  return (
    <section className="settings-page">
      <div className="settings-main">
        <h2>{isPortuguese ? 'Preferências' : 'Preferences'}</h2>
        <form
          data-update-guard={
            JSON.stringify(profile) !== JSON.stringify(data.profile) ? 'dirty' : undefined
          }
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              await api('profile', profile);
              await refresh();
              setSaved(true);
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field">
            {isPortuguese ? 'Seu nome' : 'Your name'}{' '}
            <input
              autoFocus
              required
              maxLength={60}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </label>
          <label className="field">
            {isPortuguese ? 'Tempo habitual' : 'Usual study time'}{' '}
            <select
              aria-label={isPortuguese ? 'Tempo habitual' : 'Usual study time'}
              value={profile.daily_minutes}
              onChange={(e) => setProfile({ ...profile, daily_minutes: Number(e.target.value) })}
            >
              {![15, 20, 30, 45].includes(profile.daily_minutes) && (
                <option value={profile.daily_minutes}>{profile.daily_minutes} min</option>
              )}
              {[15, 20, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </label>
          <p className="fine-print">
            {isPortuguese
              ? 'Aplicado aos próximos dias. O trabalho atual é preservado.'
              : 'Applies to future days. Current work is preserved.'}
          </p>
          <fieldset className="interests">
            <legend>{isPortuguese ? 'Seus interesses' : 'Your interests'}</legend>
            {['Travel', 'Finance', 'History', 'Technology', 'Work', 'Everyday Life'].map((t) => (
              <label
                className={`interest-chip ${profile.interests.includes(t) ? 'active' : ''}`}
                key={t}
              >
                <input
                  type="checkbox"
                  checked={profile.interests.includes(t)}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      interests: e.target.checked
                        ? [...profile.interests, t]
                        : profile.interests.filter((x) => x !== t),
                    })
                  }
                />
                {t}
              </label>
            ))}
          </fieldset>
          <label className="field">
            {isPortuguese ? 'Aparência' : 'Appearance'}{' '}
            <select
              aria-label={isPortuguese ? 'Aparência' : 'Appearance'}
              value={profile.theme}
              onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
            >
              <option value="light">{isPortuguese ? 'Claro' : 'Light'}</option>
              <option value="dark">{isPortuguese ? 'Escuro' : 'Dark'}</option>
            </select>
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy || !profile.interests.length}>
            {busy
              ? isPortuguese
                ? 'Salvando…'
                : 'Saving…'
              : isPortuguese
                ? 'Salvar preferências'
                : 'Save preferences'}
            <Check size={16} />
          </Button>
        </form>
        {saved && (
          <p role="status">{isPortuguese ? 'Preferências salvas.' : 'Preferences saved.'}</p>
        )}
      </div>
      <div className="settings-secondary">
        {process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github' && <GitHubSync />}

        <section className="settings-info">
          <h2>{isPortuguese ? 'Dados e privacidade' : 'Data & privacy'}</h2>
          <p>
            {isPortuguese
              ? 'O progresso é salvo neste navegador. A sincronização privada é opcional; para outro dispositivo, sincronize ou exporte seus dados.'
              : 'Progress is saved in this browser. Private sync is optional; sync or export your data to use another device.'}
          </p>
          <DownloadLink endpoint="export">
            {isPortuguese ? 'Exportar histórico' : 'Export history'}
          </DownloadLink>
        </section>
        <details className="settings-info">
          <summary>{isPortuguese ? 'Diagnóstico e avaliação' : 'Assessment & level check'}</summary>
          <p>
            {isPortuguese
              ? 'O diagnóstico é orientativo, não uma certificação. Escrita e gravações ficam no histórico sem notas automáticas de qualidade ou pronúncia.'
              : 'The level check is a starting reference, not a certificate. Writing and recordings remain in history without automatic quality or pronunciation grades.'}
          </p>
          <button className="button secondary" onClick={onDiagnostic}>
            {isPortuguese ? 'Fazer diagnóstico' : 'Take the level check'}
          </button>
        </details>
        <section className="settings-info">
          <h2>{isPortuguese ? 'Espaços de estudo' : 'Study spaces'}</h2>
          <SpaceLink language="en" />
          <SpaceLink language="pt" />
        </section>
      </div>
    </section>
  );
}
