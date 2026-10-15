'use client';
import { courseRoute } from '@/lib/course-route';
import { CourseMenu } from './course-menu';
import { OralPractice } from './oral-practice';
import { NewsBriefing } from './news-briefing';
import { OfflineStatus } from './offline-status';
import { Games } from './games';
import { LanguageHelp } from './language-help';
import { Classes } from './classes';
import { WordHelpCloud } from './word-help';
import { Puzzle } from 'lucide-react';
import { StudySpaces } from './study-spaces';
import { isPortuguese } from '@/lib/workspace';
import { DailyWords } from './daily-words';
import { AppUpdate } from './app-update';
import { PdfStudio } from './pdf-studio';
import { DownloadLink } from './ui';
import { GitHubSync } from './github-sync';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CircleHelp,
  Compass,
  Home,
  Languages,
  Lightbulb,
  LoaderCircle,
  Menu,
  Moon,
  Settings2,
  NotebookPen,
  Headphones,
  Sun,
  X,
  ArrowUpRight,
} from 'lucide-react';
import type { Snapshot, Activity, Document } from '@/lib/types';
import { Dashboard, ActivityList } from './dashboard';
import { HomeRoutine } from './home-routine';
import { Diagnostic } from './diagnostic';
import { Library } from './library';
import { Reader } from './reader';
import { Vocabulary } from './vocabulary';
import { Practice } from './practice';
import { Progress, Calendar } from './analytics';
import { api, Button, Heading, Empty } from './ui';
import { useDialog } from './use-dialog';
const navigation = [
  { title: 'Home', icon: Home },
  { title: 'PDF Studio', icon: NotebookPen },
  { title: 'My Day', icon: Compass },
  { title: 'Library', icon: BookOpen },
  { title: 'Practice', icon: Languages },
  { title: 'Games', icon: Puzzle },
  { title: 'Vocabulary', icon: Languages },
  { title: 'Progress', icon: ChartNoAxesCombined },
  { title: 'Calendar', icon: CalendarDays },
  { title: 'Classes', icon: BookOpen },
  { title: 'News', icon: BookOpen },
  { title: 'Language help', icon: Lightbulb },
  { title: 'Oral practice', icon: Headphones },
];
export function EnglishApp() {
  const [data, setData] = useState<Snapshot | null>(null),
    [view, setView] = useState('Home');
  const [suggestedClass, setSuggestedClass] = useState('');
  const [suggestedGame, setSuggestedGame] = useState('');
  const [classroomVisit, setClassroomVisit] = useState(0);
  const [classroomSection, setClassroomSection] = useState<'classes' | 'practice'>('classes');
  const [active, setActive] = useState<Activity | null>(null),
    [error, setError] = useState(''),
    [locked, setLocked] = useState(false),
    [token, setToken] = useState('');
  const [settings, setSettings] = useState(false),
    [mobileMenu, setMobileMenu] = useState(false),
    [opening, setOpening] = useState(false);
  const refresh = useCallback(async () => {
    const state = await api<Snapshot>('state');
    setData(state);
    document.documentElement.dataset.theme = state.profile.theme;
    document.documentElement.dataset.studyLanguage = isPortuguese ? 'pt' : 'en';
  }, []);
  useEffect(() => {
    const onRemoteChange = () => {
      void refresh().catch((e) => setError(e.message));
    };
    window.addEventListener('english-data-changed', onRemoteChange);
    refresh().catch((e) => {
      if (e.message.includes('access key')) setLocked(true);
      else setError(e.message);
    });
    return () => window.removeEventListener('english-data-changed', onRemoteChange);
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
    setClassroomSection('classes');
    setActive(null);
    setMobileMenu(false);
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
  async function toggleTheme() {
    if (!data) return;
    const theme = data.profile.theme === 'dark' ? 'light' : 'dark';
    try {
      await api('profile', { ...data.profile, theme });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
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
  const appNavigation = navigation;
  const doc = data.documents.find((d) => d.id === active?.document_id);
  return (
    <div className="app-shell">
      <a className="skip-learning-link" href="#main-content">
        {isPortuguese ? 'Ir para o conteúdo' : 'Skip to learning'}
      </a>
      {mobileMenu && (
        <button
          className="drawer-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`}>
        <Logo />
        <StudySpaces compact />
        <button
          className="icon-button mobile-sidebar-close"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
        >
          <X size={19} />
        </button>
        <div className="workspace-label">
          <span className="status-dot" />
          PERSONAL SPACE{' '}
        </div>
        <nav aria-label="Main navigation">
          <div className="nav-primary">
            {appNavigation
              .filter((item) => ['Home', 'Classes', 'Vocabulary', 'PDF Studio', 'Progress'].includes(item.title))
              .sort((a, b) =>
                ['Home', 'Classes', 'Vocabulary', 'PDF Studio', 'Progress'].indexOf(a.title) -
                ['Home', 'Classes', 'Vocabulary', 'PDF Studio', 'Progress'].indexOf(b.title),
              )
              .map(({ title, icon: Icon }) => (
                <button
                  key={title}
                  aria-label={title}
                  aria-current={view === title && !active ? 'page' : undefined}
                  className={`nav-item ${view === title && !active ? 'active' : ''}`}
                  onClick={() => void navigate(title)}
                >
                  <Icon size={19} />
                  <span>{
                    title === 'Home' ? (isPortuguese ? 'Hoje' : 'Today') :
                    title === 'Vocabulary' ? (isPortuguese ? 'Revisão' : 'Review') :
                    title === 'PDF Studio' ? (isPortuguese ? 'Biblioteca' : 'Library') :
                    title === 'Classes' ? (isPortuguese ? 'Aulas' : 'Classes') :
                    (isPortuguese ? 'Progresso' : 'Progress')
                  }</span>
                </button>
              ))}
          </div>
          <details
            className="nav-more"
            open={['Library', 'Practice', 'My Day', 'Games', 'Calendar', 'News', 'Language help', 'Oral practice'].includes(view)}
          >
            <summary>{isPortuguese ? 'Outras ferramentas' : 'More tools'}</summary>
            {appNavigation
              .filter((item) => ['Library', 'Practice', 'My Day', 'Games', 'Calendar', 'News', 'Language help', 'Oral practice'].includes(item.title))
              .map(({ title, icon: Icon }) => (
                <button
                  key={title}
                  aria-label={title}
                  className={`nav-item ${view === title && !active ? 'active' : ''}`}
                  onClick={() => void navigate(title)}
                >
                  <Icon size={19} />
                  <span>{
                    title === 'Library' ? (isPortuguese ? 'Leituras' : 'Readings') :
                    title === 'My Day' ? (isPortuguese ? 'Todas as atividades' : 'All activities') :
                    title === 'Practice' ? (isPortuguese ? 'Prática extra' : 'Extra practice') :
                    title === 'Oral practice' ? (isPortuguese ? 'Fala' : 'Speaking') :
                    title
                  }</span>
                </button>
              ))}
          </details>
        </nav>
        <div className="sidebar-bottom">
          <div className="goal-note">
            <div className="goal-icon">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <span>Your learning path</span>
              <strong>{`${isPortuguese ? 'MCER' : 'English'} · ${courseRoute(data).level}`}</strong>
            </div>
          </div>
          <button
            className="nav-item"
            onClick={() => {
              setSettings(true);
              setMobileMenu(false);
            }}
          >
            <Settings2 size={18} />
            Preferences{' '}
          </button>
          <div className="user-profile">
            <span className="avatar">{data.profile.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{data.profile.name}</strong>
              <span>My personal journey</span>
            </div>
            <button
              className="icon-button"
              aria-label="Open preferences"
              onClick={() => setSettings(true)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={20} />
            </button>
            <span>My space</span>
            <ChevronRight size={14} />
            <strong>{active ? (isPortuguese ? 'Atividade' : 'Activity') : view === 'Home' ? (isPortuguese ? 'Hoje' : 'Today') : view === 'Assessment' ? (isPortuguese ? 'Diagnóstico' : 'Assessment') : view}</strong>
          </div>
          <div className="topbar-actions">
            <div className="topbar-course"><CourseMenu data={data} navigate={(target) => void navigate(target)} /></div>
            <AppUpdate />
            {view === 'Home' && !active && <span id="daily-word-slot" />}
            <div className="topbar-extra"><WordHelpCloud data={data} refresh={refresh} /></div>
            <button
              className="icon-button topbar-extra"
              onClick={toggleTheme}
              aria-label={
                data.profile.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {data.profile.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-button"
              aria-label="Help and preferences"
              onClick={() => setSettings(true)}
            >
              <CircleHelp size={18} />
            </button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div id="app-updates" />
          {error && (
            <div role="alert" className="error global-error">
              {error}
              <button aria-label="Dismiss message" onClick={() => setError('')}>
                <X size={16} />
              </button>
            </div>
          )}
          {opening && (
            <div className="operation-indicator" role="status">
              Opening and saving your session…{' '}
            </div>
          )}
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
            <Diagnostic data={data} refresh={refresh} close={() => void navigate('Home')} />
          ) : view === 'Home' ? (
            <>
              <Dashboard
              data={data}
              refresh={refresh}
              onStart={onStart}
              navigate={(target) => void navigate(target)}
              onDiagnostic={() => {
                setView('Assessment');
                window.scrollTo({ top: 0 });
              }}
              onRead={(doc) => void openDocument(doc)}
              onClass={(id) => {
                void navigate('Classes');
                setSuggestedClass(id);
              }}
              onGame={(seed) => {
                void navigate('Games');
                setSuggestedGame(seed);
              }}
              onRoutine={(mode) =>
                window.dispatchEvent(
                  new CustomEvent('english-os:routine-start', { detail: { mode } }),
                )
              }
            />
            <HomeRoutine
              data={data}
              refresh={refresh}
              onStart={onStart}
              onClass={(id) => {
                void navigate('Classes');
                setSuggestedClass(id);
              }}
              onGame={(seed) => {
                void navigate('Games');
                setSuggestedGame(seed);
              }}
              compact
            />
            </>
          ) : view === 'PDF Studio' ? (
            <PdfStudio data={data} refresh={refresh} onRead={(doc) => void openDocument(doc)} />
          ) : view === 'My Day' ? (
            <div className="learning-path-view">
              <Heading
                eyebrow={isPortuguese ? 'PLANO DE ESTUDO' : 'STUDY PLAN'}
                title={isPortuguese ? 'Todas as atividades' : 'All activities'}
                description={isPortuguese ? 'Seu plano de atividades. Comece pela próxima tarefa pendente.' : 'Your full activity list. Start with the next unfinished task.'}
              />
              <section className="card daily-card">
                <ActivityList data={data} onStart={onStart} />
              </section>
            </div>
          ) : view === 'Practice' ? (
            <div className="learning-path-view">
              <Heading
                eyebrow={isPortuguese ? 'PRÁTICA EXTRA' : 'EXTRA PRACTICE'}
                title={isPortuguese ? 'Pratique no seu ritmo' : 'Practise at your pace'}
                description={isPortuguese ? 'Atividades para reforçar o que você estudou.' : 'Extra activities to reinforce your learning.'}
              />
              <HomeRoutine
                data={data}
                refresh={refresh}
                onStart={onStart}
                onClass={(id) => { void navigate('Classes'); setSuggestedClass(id); }}
                onGame={(seed) => { void navigate('Games'); setSuggestedGame(seed); }}
              />
            </div>
          ) : view === 'Oral practice' ? (
            <OralPractice data={data} refresh={refresh} />
          ) : view === 'Language help' ? (
            <LanguageHelp />
          ) : view === 'News' ? (
            <NewsBriefing />
          ) : view === 'Library' ? (
            <Library data={data} onOpen={(d) => void openDocument(d)} refresh={refresh} />
          ) : view === 'MCER' && isPortuguese ? (
            <Classes
              data={data}
              refresh={refresh}
              navigate={(target) => void navigate(target)}
              onStart={onStart}
              key={`${classroomSection}:${classroomVisit}`}
              initialSection={classroomSection}
              initialLesson={suggestedClass}
            />
          ) : view === 'Classes' ? (
            <Classes
              data={data}
              refresh={refresh}
              navigate={(target) => void navigate(target)}
              onStart={onStart}
              key={`${classroomSection}:${classroomVisit}`}
              initialSection={classroomSection}
              initialLesson={suggestedClass}
            />
          ) : view === 'Games' ? (
            <Games data={data} refresh={refresh} initialSeed={suggestedGame} />
          ) : view === 'Vocabulary' ? (
            <Vocabulary data={data} refresh={refresh} />
          ) : view === 'Progress' ? (
            <Progress data={data} navigate={(target) => void navigate(target)} />
          ) : view === 'Calendar' ? (
            <Calendar data={data} />
          ) : (
            <>
              <Heading
                eyebrow="ONE IDEA IN ACTION"
                title="Make room for practice."
                description="Reading, grammar, and writing for situations that matter to you."
              />
              <section className="card daily-card">
                <ActivityList data={data} onStart={onStart} />
              </section>
            </>
          )}
          {/* Account and offline technical details live in Preferences. */}
        </main>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Quick navigation">
        {[navigation[0], navigation[9], navigation[6], navigation[1], navigation[7]].map(
          ({ title, icon: Icon }) => (
            <button
              key={title}
              aria-current={view === title && !active ? 'page' : undefined}
              onClick={() => void navigate(title)}
            >
              <Icon size={20} />
              <span>
                {title === 'Home' ? (isPortuguese ? 'Hoje' : 'Today') : title === 'Classes' ? (isPortuguese ? 'Aulas' : 'Classes') : title === 'PDF Studio' ? (isPortuguese ? 'Ler' : 'Read') : title === 'Vocabulary' ? (isPortuguese ? 'Revisar' : 'Review') : (isPortuguese ? 'Progresso' : title)}
              </span>
            </button>
          ),
        )}
      </nav>
      {view === 'Home' && !active && (
        <DailyWords
          data={data}
          refresh={refresh}
          openVocabulary={() => void navigate('Vocabulary')}
        />
      )}
      {settings && <Preferences data={data} refresh={refresh} close={() => setSettings(false)} />}
    </div>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        {isPortuguese ? 'p' : 'e'}
        <span>
          <ArrowUpRight size={14} />
        </span>
      </span>
      <div>
        {isPortuguese ? 'português' : 'english'}
        <span>os.</span>
        <small>MAKE IT YOURS</small>
      </div>
    </div>
  );
}
function Preferences({
  data,
  refresh,
  close,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  close: () => void;
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
  const dialogRef = useDialog(close, busy);
  return (
    <div className="modal-backdrop">
      <section
        role="dialog"
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby="preferences-title"
        className="card modal"
      >
        <div className="section-heading">
          <h2 id="preferences-title">Make it yours.</h2>
          <button className="icon-button" aria-label="Close preferences" onClick={close}>
            <X size={20} />
          </button>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              await api('profile', profile);
              await refresh();
              close();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="field">
            Your name{' '}
            <input
              autoFocus
              required
              maxLength={60}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </label>
          <label className="field">
            Your usual study time{' '}
            <select
              value={profile.daily_minutes}
              onChange={(e) => setProfile({ ...profile, daily_minutes: Number(e.target.value) })}
            >
              <option value={5}>5 minutes · a small break</option>
              <option value={20}>20 minutes · my daily session</option>
              <option value={40}>40 minutes · explore more</option>
            </select>
          </label>
          <p className="fine-print">Duration changes apply to your next daily plan.</p>
          <fieldset className="interests">
            <legend>Your interests</legend>
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
            Appearance{' '}
            <select
              value={profile.theme}
              onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy || !profile.interests.length}>
            {busy ? 'Saving…' : 'Save preferences'}
            <Check size={16} />
          </Button>
        </form>
        {process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github' && <GitHubSync />}
        <OfflineStatus />
        <div className="settings-info">
          <span className="eyebrow">PRIVACY AND DATA</span>
          <p>
            {process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github'
              ? 'Your data is saved in this browser and synced when you connect your private GitHub repository.'
              : 'Your data is saved in the server database.'}{' '}
            {data.aiAvailable
              ? 'AI writing feedback is configured.'
              : process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github'
                ? 'You can study here without an external AI service. PDF Studio also supports local AI.'
                : 'AI writing feedback requires a configured server key.'}
          </p>
          <p>
            This is an informal starting assessment, not a CEFR certification. For online access,{' '}
            {process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github'
              ? 'your personal data stays outside the public repository.'
              : 'configure an access key and HTTPS on the server.'}
          </p>
          <DownloadLink endpoint="export">Download my history</DownloadLink>
        </div>
      </section>
    </div>
  );
}
