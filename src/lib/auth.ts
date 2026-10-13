import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { AppError } from './service';
export function equal(a: string, b: string) {
  const digest = (s: string) => createHmac('sha256', 'english-os-comparison').update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}
export function sessionCookie() {
  const expires = String(Date.now() + 7 * 86400_000);
  return `${expires}.${createHmac('sha256', process.env.APP_ACCESS_TOKEN!).update(expires).digest('hex')}`;
}
export function authorized(request: NextRequest) {
  const token = process.env.APP_ACCESS_TOKEN;
  if (!token) return process.env.ENGLISH_REQUIRE_AUTH !== '1';
  const cookie = request.cookies.get('english-session')?.value || '';
  const [expires, signature] = cookie.split('.');
  return Boolean(
    expires &&
      signature &&
      Number(expires) > Date.now() &&
      equal(signature, createHmac('sha256', token).update(expires).digest('hex')),
  );
}
export function checkOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host'))
    throw new AppError('Origen de solicitud no permitido.', 403);
  if (request.headers.get('sec-fetch-site') === 'cross-site')
    throw new AppError('Solicitud entre sitios no permitida.', 403);
}
