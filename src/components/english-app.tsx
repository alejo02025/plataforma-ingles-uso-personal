'use client';
import { DownloadLink } from './ui';
import { GitHubSync, GitHubSyncStatus } from './github-sync';
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
  LoaderCircle,
  Menu,
  Moon,
  Settings2,
  Sun,
  X,
  ArrowUpRight,
} from 'lucide-react';
import type { Snapshot, Activity, Document } from '@/lib/types';
import { Dashboard, ActivityList } from './dashboard';
import { Diagnostic } from './diagnostic';
import { Library } from './library';
import { Reader } from './reader';
import { Vocabulary } from './vocabulary';
import { Practice } from './practice';
import { Progress, Calendar } from './analytics';
import { api, Button, Heading, Empty } from './ui';
import { useDialog } from './use-dialog';
const navigation = [
  { title: 'Inicio', icon: Home },
  { title: 'Mi día', icon: Compass },
  { title: 'Biblioteca', icon: BookOpen },
  { title: 'Practicar', icon: Languages },
  { title: 'Vocabulario', icon: Languages },
  { title: 'Progreso', icon: ChartNoAxesCombined },
  { title: 'Calendario', icon: CalendarDays },
];
export function EnglishApp() {
  const [data, setData] = useState<Snapshot | null>(null),
    [view, setView] = useState('Inicio');
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
  }, []);
  useEffect(() => {
    const onRemoteChange = () => {
      void refresh().catch((e) => setError(e.message));
    };
    window.addEventListener('english-data-changed', onRemoteChange);
    refresh().catch((e) => {
      if (e.message.includes('clave de acceso')) setLocked(true);
      else setError(e.message);
    });
    return () => window.removeEventListener('english-data-changed', onRemoteChange);
  }, [refresh]);
  async function navigate(target: string) {
    setView(target);
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
          <span className="eyebrow">TU ESPACIO PRIVADO</span>
          <h1>Bienvenido de nuevo.</h1>
          <p className="muted">Ingresá la clave de acceso configurada para tu English OS.</p>
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
              Clave de acceso
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
              Entrar
              <ArrowUpRight size={16} />
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
              Reintentar
            </Button>
          </>
        ) : (
          <>
            <LoaderCircle className="spinner" size={25} />
            <p>Preparando tu espacio…</p>
          </>
        )}
      </div>
    );
  const doc = data.documents.find((d) => d.id === active?.document_id);
  return (
    <div className="app-shell">
      {mobileMenu && (
        <button
          className="drawer-backdrop"
          aria-label="Cerrar navegación"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`}>
        <Logo />
        <button
          className="icon-button mobile-sidebar-close"
          aria-label="Cerrar menú"
          onClick={() => setMobileMenu(false)}
        >
          <X size={19} />
        </button>
        <div className="workspace-label">
          <span className="status-dot" />
          ESPACIO PERSONAL
        </div>
        <nav aria-label="Navegación principal">
          {navigation.map(({ title, icon: Icon }) => (
            <button
              key={title}
              className={`nav-item ${view === title && !active ? 'active' : ''}`}
              onClick={() => void navigate(title)}
            >
              <Icon size={19} strokeWidth={1.7} />
              {title}
              {title === 'Vocabulario' && data.vocabulary.length > 0 && (
                <span className="nav-count">{data.vocabulary.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="goal-note">
            <div className="goal-icon">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <span>Tu próximo horizonte</span>
              <strong>Inglés B2</strong>
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
            Preferencias
          </button>
          <div className="user-profile">
            <span className="avatar">{data.profile.name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{data.profile.name}</strong>
              <span>Mi recorrido personal</span>
            </div>
            <button
              className="icon-button"
              aria-label="Abrir preferencias"
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
              aria-label="Abrir navegación"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={20} />
            </button>
            <span>Mi espacio</span>
            <ChevronRight size={14} />
            <strong>{active ? 'Práctica' : view === 'Diagnóstico' ? 'Diagnóstico' : view}</strong>
          </div>
          <div className="topbar-actions">
            {process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github' && (
              <GitHubSyncStatus onOpen={() => setSettings(true)} />
            )}
            <span className="private-label">
              <span className="status-dot" />
              {data.protected ? 'Espacio protegido' : 'Uso personal'}
            </span>
            <button
              className="icon-button"
              onClick={toggleTheme}
              aria-label={
                data.profile.theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'
              }
            >
              {data.profile.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-button"
              aria-label="Ayuda y preferencias"
              onClick={() => setSettings(true)}
            >
              <CircleHelp size={18} />
            </button>
          </div>
        </header>
        <main id="main-content">
          {error && (
            <div role="alert" className="error global-error">
              {error}
              <button aria-label="Cerrar mensaje" onClick={() => setError('')}>
                <X size={16} />
              </button>
            </div>
          )}
          {opening && (
            <div className="operation-indicator" role="status">
              Abriendo y guardando tu sesión…
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
          ) : view === 'Diagnóstico' ? (
            <Diagnostic data={data} refresh={refresh} close={() => void navigate('Inicio')} />
          ) : view === 'Inicio' ? (
            <Dashboard
              data={data}
              onStart={onStart}
              navigate={(target) => void navigate(target)}
              onDiagnostic={() => setView('Diagnóstico')}
            />
          ) : view === 'Mi día' ? (
            <>
              <Heading
                eyebrow="TU RECORRIDO, PREPARADO"
                title="Un plan para hoy."
                description={data.plan.reason}
              >
                <span className="pill neutral">{data.plan.minutes} minutos sugeridos</span>
              </Heading>
              <section className="card daily-card">
                <ActivityList data={data} onStart={onStart} />
              </section>
              <div className="evidence-banner">
                <Check size={20} />
                <p>
                  Tu plan se conserva durante el día. Si cambiás la duración en Preferencias, se
                  aplicará al próximo plan.
                </p>
              </div>
            </>
          ) : view === 'Biblioteca' ? (
            <Library data={data} onOpen={(d) => void openDocument(d)} refresh={refresh} />
          ) : view === 'Vocabulario' ? (
            <Vocabulary data={data} refresh={refresh} />
          ) : view === 'Progreso' ? (
            <Progress data={data} />
          ) : view === 'Calendario' ? (
            <Calendar data={data} />
          ) : (
            <>
              <Heading
                eyebrow="UNA IDEA EN ACCIÓN"
                title="Hacé lugar a la práctica."
                description="Lectura, gramática y escritura para situaciones que sí te importan."
              />
              <section className="card daily-card">
                <ActivityList data={data} onStart={onStart} />
              </section>
              <Empty
                title="La voz llega en la próxima fase."
                detail="Speaking y listening tendrán grabación, transcripción y audios naturales. Mientras tanto, podés escuchar tus lecturas con las voces del navegador."
              />
            </>
          )}
          <footer className="app-footer">
            <span>ENGLISH OS</span>
            <p>Menos organizar. Más descubrir.</p>
            <span>Tu ritmo. Tu recorrido.</span>
          </footer>
        </main>
      </div>
      {settings && <Preferences data={data} refresh={refresh} close={() => setSettings(false)} />}
    </div>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">
        e
        <span>
          <ArrowUpRight size={14} />
        </span>
      </span>
      <div>
        english<span>os.</span>
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
          <h2 id="preferences-title">A tu manera.</h2>
          <button className="icon-button" aria-label="Cerrar preferencias" onClick={close}>
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
            Cómo te llamás
            <input
              autoFocus
              required
              maxLength={60}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </label>
          <label className="field">
            Tu tiempo habitual
            <select
              value={profile.daily_minutes}
              onChange={(e) => setProfile({ ...profile, daily_minutes: Number(e.target.value) })}
            >
              <option value={5}>5 minutos · una pausa</option>
              <option value={20}>20 minutos · mi sesión diaria</option>
              <option value={40}>40 minutos · explorar más</option>
            </select>
          </label>
          <p className="fine-print">Los cambios de duración se aplican al próximo plan diario.</p>
          <fieldset className="interests">
            <legend>Lo que te interesa</legend>
            {['Viajes', 'Finanzas', 'Historia', 'Tecnología', 'Trabajo', 'Vida cotidiana'].map(
              (t) => (
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
              ),
            )}
          </fieldset>
          <label className="field">
            Apariencia
            <select
              value={profile.theme}
              onChange={(e) => setProfile({ ...profile, theme: e.target.value })}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy || !profile.interests.length}>
            {busy ? 'Guardando…' : 'Guardar preferencias'}
            <Check size={16} />
          </Button>
        </form>
        {process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github' && <GitHubSync />}
        <div className="settings-info">
          <span className="eyebrow">PRIVACIDAD Y DATOS</span>
          <p>
            {process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github'
              ? 'Los datos se guardan en este navegador y se sincronizan al conectar tu repositorio privado de GitHub.'
              : 'Los datos se guardan en la base del servidor.'}{' '}
            {data.aiAvailable
              ? 'La corrección con IA está configurada.'
              : process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github'
                ? 'Esta edición permite estudiar sin servicios de IA.'
                : 'Para activar correcciones, configurá ENGLISH_AI_API_KEY en el servidor.'}
          </p>
          <p>
            Este producto tiene un diagnóstico orientativo, no una certificación MCER. Para acceso
            desde Internet,{' '}
            {process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github'
              ? 'tus datos personales se mantienen fuera del repositorio público.'
              : 'configurá APP_ACCESS_TOKEN y HTTPS.'}
          </p>
          <DownloadLink endpoint="export">Descargar mi historial</DownloadLink>
        </div>
      </section>
    </div>
  );
}
