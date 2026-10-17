'use client';
import { useState, type FormEvent } from 'react';
import { account, listLocalAccounts, loginLocal, logoutLocal, registerLocal } from '@/lib/browser/local-accounts';
import { EnglishApp } from './english-app';
export function AccountGate() {
  const [current, setCurrent] = useState(account);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>(() => 'login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') await registerLocal(email, password);
      else await loginLocal(email, password);
      setCurrent(account());
      setPassword('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo ingresar.');
    } finally { setBusy(false); }
  }
  if (current)
    return <>
      <div className="local-account-bar" role="group" aria-label="Cuenta local">
        <span title={current.email}>{current.email} <small>· solo en este dispositivo</small></span>
        <button type="button" onClick={() => { logoutLocal(); window.location.reload(); }}>Cerrar sesión</button>
      </div>
      <EnglishApp/>
    </>;
  return <main className="auth-page">
    <section className="card auth-card local-account-login">
      <span className="eyebrow">ENGLISH OS · PRIVATE STUDY</span>
      <h1>{mode === 'login' ? 'Bienvenido de nuevo' : 'Creá tu cuenta'}</h1>
      <p className="muted">Tu inglés, tus ejercicios y tu progreso. Cada cuenta tiene un espacio privado en este navegador.</p>
      <form onSubmit={submit}>
        <label className="field">Email
          <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)}/>
        </label>
        <label className="field">Contraseña
          <input type="password" autoComplete={mode==='login'?'current-password':'new-password'} required minLength={mode==='register'?12:1} value={password} onChange={e => setPassword(e.target.value)}/>
        </label>
        {mode === 'register' && <p className="fine-print">Mínimo 12 caracteres. No hay recuperación de contraseñas por email porque no usamos ningún servidor.</p>}
        <button className="button" type="submit" disabled={busy}>{busy?'Procesando…':mode==='login'?'Iniciar sesión':'Crear cuenta'}</button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="button" className="text-link" onClick={() => {setError('');setMode(mode==='login'?'register':'login');}}>
        {mode==='login'?'¿No tenés cuenta? Crear una':'Ya tengo cuenta'}
      </button>
      <p className="fine-print">Los datos se guardan cifrados en este dispositivo. No se envían a una base de datos externa ni se sincronizan con otros dispositivos. Si borrás los datos del navegador, podés perder el progreso.</p>
      {listLocalAccounts().length>0 && <p className="fine-print">Cuentas existentes en este navegador: {listLocalAccounts().length}</p>}
    </section>
  </main>;
}
