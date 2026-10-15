import { isValidElement, type ReactNode, type HTMLAttributes } from 'react';
import { isPortuguese } from '@/lib/workspace';
import { nativeCopy, spanishCopy } from '@/lib/study-copy';

export function copyText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(copyText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return copyText(node.props.children);
  return '';
}
export function StudyCopy({
  children,
  native,
  as: Tag = 'p',
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  native?: string;
  as?: 'p' | 'span' | 'small' | 'strong' | 'h3' | 'div' | 'li';
}) {
  const text = copyText(children);
  const primary = native || nativeCopy(text);
  const language = isPortuguese ? 'pt-BR' : 'en';
  if (['li', 'span', 'small', 'strong'].includes(Tag))
    return (
      <Tag {...props} lang={language} data-study-copy={primary ? 'translated' : 'missing'}>
        {primary && <span className="study-native">{primary}</span>}
        <span className="study-spanish" lang="es">
          {children}
        </span>
      </Tag>
    );
  return (
    <>
      {primary && (
        <Tag {...props} lang={language} className={`${props.className || ''} study-native`}>
          {primary}
        </Tag>
      )}
      <Tag
        {...props}
        id={primary ? undefined : props.id}
        lang="es"
        className={`${props.className || ''} study-spanish`}
        data-study-copy={primary ? 'translated' : 'missing'}
      >
        {children}
      </Tag>
    </>
  );
}
export function SpanishTranslation({ text, spanish }: { text: string; spanish?: string }) {
  const translation = spanish || spanishCopy(text);
  return translation ? (
    <span className="study-spanish" lang="es">
      {translation}
    </span>
  ) : null;
}
