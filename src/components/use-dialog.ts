'use client';
import { useEffect, useRef } from 'react';
export function useDialog(close: () => void, blocked = false) {
  const ref = useRef<HTMLElement>(null);
  const callbacks = useRef({ close, blocked });
  callbacks.current = { close, blocked };
  const previous = useRef<HTMLElement | null>(
    typeof document === 'undefined' ? null : (document.activeElement as HTMLElement),
  );
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const focusable = () =>
      Array.from(
        element.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]',
        ),
      );
    focusable()[0]?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !callbacks.current.blocked) {
        event.preventDefault();
        callbacks.current.close();
      }
      if (event.key === 'Tab') {
        const items = focusable(),
          first = items[0],
          last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    element.addEventListener('keydown', keydown);
    return () => {
      element.removeEventListener('keydown', keydown);
      previous.current?.focus();
    };
  }, []);
  return ref;
}
