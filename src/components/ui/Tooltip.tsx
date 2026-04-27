import clsx from 'clsx';
import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import type { ReactElement, ReactNode } from 'react';

type TooltipProps = {
  content: ReactNode;
  /** Delay before showing on pointer hover (keyboard focus shows immediately). */
  delayMs?: number;
  /** When true, the wrapper is block-level so `w-full` triggers can fill. */
  block?: boolean;
  /** Tighter padding and type — for icon buttons and dense toolbars. */
  compact?: boolean;
  children: ReactElement<{ 'aria-describedby'?: string }>;
};

export function Tooltip({
  content,
  delayMs = 500,
  block = false,
  compact = false,
  children,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const delayRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerOpenRef = useRef(false);

  const clearDelay = useCallback(() => {
    if (delayRef.current !== undefined) {
      clearTimeout(delayRef.current);
      delayRef.current = undefined;
    }
  }, []);

  useEffect(() => () => clearDelay(), [clearDelay]);

  const showPointer = useCallback(() => {
    clearDelay();
    delayRef.current = setTimeout(() => {
      delayRef.current = undefined;
      pointerOpenRef.current = true;
      setOpen(true);
    }, delayMs);
  }, [clearDelay, delayMs]);

  const hidePointer = useCallback(() => {
    clearDelay();
    pointerOpenRef.current = false;
    setOpen(false);
  }, [clearDelay]);

  const describedBy = open ? id : undefined;
  const trigger = cloneElement(children, {
    'aria-describedby':
      [describedBy, children.props['aria-describedby']]
        .filter(Boolean)
        .join(' ') || undefined,
  });

  const isPlainString =
    typeof content === 'string' || typeof content === 'number';

  return (
    <span
      className={clsx(
        'relative max-w-full',
        block ? 'block w-full' : 'inline-flex',
      )}
      onPointerEnter={showPointer}
      onPointerLeave={hidePointer}
      onFocusCapture={() => {
        clearDelay();
        setOpen(true);
      }}
      onBlurCapture={() => {
        clearDelay();
        pointerOpenRef.current = false;
        setOpen(false);
      }}
    >
      {trigger}
      {open ? (
        <span
          id={id}
          role="tooltip"
          className={clsx(
            'pointer-events-none absolute left-1/2 top-full -translate-x-1/2 text-left shadow-soft',
            compact
              ? 'z-[300] mt-1.5 max-w-[14rem] rounded-lg border border-border bg-background-elevated px-2.5 py-1'
              : 'z-50 mt-2 rounded-2xl border border-border bg-background-elevated px-4 py-3',
            isPlainString
              ? clsx(
                  'whitespace-nowrap text-text',
                  compact
                    ? 'text-[11px] font-medium leading-tight'
                    : 'text-xs font-medium',
                )
              : clsx(
                  'max-w-[min(68rem,calc(100vw-2rem))] text-text',
                  compact ? 'text-xs leading-snug' : 'text-sm leading-relaxed',
                ),
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
