'use client';
import { useEffect, useRef, useState } from 'react';
import { api } from './ui';
export function useStudySession(activityId: string, completed: boolean) {
  const [sessionId, setSessionId] = useState(''),
    [error, setError] = useState('');
  const seconds = useRef(0);
  useEffect(() => {
    if (completed) return;
    let cancelled = false,
      timer: ReturnType<typeof setInterval> | undefined;
    let lastInteraction = Date.now();
    const interact = () => {
      lastInteraction = Date.now();
    };
    window.addEventListener('pointerdown', interact);
    window.addEventListener('keydown', interact);
    window.addEventListener('scroll', interact, true);
    let currentId = '';
    let ticks = 0;
    async function tick() {
      try {
        await api('tick', { sessionId: currentId, seconds: seconds.current });
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    }
    api<{ id: string; active_seconds: number }>('session', { activityId })
      .then((s) => {
        if (cancelled) return;
        currentId = s.id;
        seconds.current = s.active_seconds;
        setSessionId(s.id);
        timer = setInterval(() => {
          ticks += 1;
          if (document.visibilityState === 'visible' && Date.now() - lastInteraction < 60_000)
            seconds.current += 1;
          if (ticks % 15 === 0) void tick();
        }, 1000);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener('pointerdown', interact);
      window.removeEventListener('keydown', interact);
      window.removeEventListener('scroll', interact, true);
      if (currentId) void tick();
    };
  }, [activityId, completed]);
  return { sessionId, seconds, error };
}
