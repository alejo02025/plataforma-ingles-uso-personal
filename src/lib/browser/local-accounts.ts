'use client';
/** Offline accounts: credentials never leave this browser. Session encryption key lives only in memory. */
type Account = { id: string; email: string; salt: string; verifier: string };
const registryKey = 'english-os-local-accounts-v1';
let current: { id: string; email: string; key: CryptoKey } | null = null;
const bytes = (value: string) => new TextEncoder().encode(value);
const encoded = (buffer: Uint8Array) => btoa(Array.from(buffer, (c) => String.fromCharCode(c)).join(''));
const decoded = (value: string) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
const accounts = (): Account[] => {
  try { const parsed: unknown = JSON.parse(localStorage.getItem(registryKey) || '[]'); return Array.isArray(parsed) ? parsed as Account[] : []; }
  catch { return []; }
};
const persistAccounts = (records: Account[]) => localStorage.setItem(registryKey, JSON.stringify(records));
const normalized = (email: string) => email.trim().toLowerCase();
async function derive(password: string, salt: Uint8Array) {
  const secret = await crypto.subtle.importKey('raw', bytes(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new Uint8Array(salt), iterations: 310000, hash: 'SHA-256' }, secret, 512);
  const raw = new Uint8Array(bits);
  const verify = await crypto.subtle.digest('SHA-256', raw.slice(32));
  const key = await crypto.subtle.importKey('raw', raw.slice(0, 32), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  return { key, verifier: encoded(new Uint8Array(verify)) };
}
export function listLocalAccounts() { return accounts().map(({ email }) => email); }
export function account() { return current ? { id: current.id, email: current.email } : null; }
export function requireAccount() { if (!current) throw Error('Iniciá sesión para acceder a tu espacio personal.'); return current; }
export async function registerLocal(email: string, password: string) {
  const mail = normalized(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) || mail.length > 254) throw Error('Ingresá un email válido.');
  if (password.length < 12 || password.length > 256) throw Error('Usá una contraseña de al menos 12 caracteres.');
  const records = accounts();
  if (records.some((a) => a.email === mail)) throw Error('Ya existe una cuenta con ese email.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const { key, verifier } = await derive(password, salt);
  const created = { id: crypto.randomUUID(), email: mail, salt: encoded(salt), verifier };
  persistAccounts([...records, created]);
  current = { id: created.id, email: mail, key };
}
export async function loginLocal(email: string, password: string) {
  const record = accounts().find((a) => a.email === normalized(email));
  if (!record) throw Error('Email o contraseña incorrectos.');
  const result = await derive(password, decoded(record.salt));
  if (result.verifier !== record.verifier) throw Error('Email o contraseña incorrectos.');
  current = { id: record.id, email: record.email, key: result.key };
}
export function logoutLocal() { current = null; }
function serialize(value: unknown): unknown {
  if (value instanceof Uint8Array) return { __bytes: encoded(value) };
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, serialize(child)]));
  return value;
}
function deserialize(value: any): any {
  if (value && typeof value === 'object' && typeof value.__bytes === 'string' && Object.keys(value).length === 1) return decoded(value.__bytes);
  if (Array.isArray(value)) return value.map(deserialize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, deserialize(child)]));
  return value;
}
export async function encryptLocal(value: unknown) {
  const { key } = requireAccount();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes(JSON.stringify(serialize(value)))));
  return { version: 1, iv: encoded(iv), ciphertext: encoded(ciphertext) };
}
export async function decryptLocal(input: any) {
  const { key } = requireAccount();
  if (!input || input.version !== 1 || typeof input.iv !== 'string' || typeof input.ciphertext !== 'string')
    throw Error('Registro cifrado inválido.');
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decoded(input.iv) }, key, decoded(input.ciphertext));
    return deserialize(JSON.parse(new TextDecoder().decode(plain)));
  } catch { throw Error('No se pudo descifrar el historial de esta cuenta.'); }
}
