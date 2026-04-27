import clsx from 'clsx';

import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  }
>;

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-soft',
        'transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-fast ease-out-expo',
        'hover:-translate-y-px hover:shadow-card active:translate-y-0 active:shadow-soft active:shadow-focus-inner',
        'focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50',
        {
          'bg-primary text-text-inverse hover:bg-primary-hover':
            variant === 'primary',
          'border border-border bg-surface text-text hover:bg-surface-hover':
            variant === 'secondary',
          'text-text-muted hover:bg-surface-hover hover:text-text':
            variant === 'ghost',
          'bg-danger text-text-inverse hover:bg-danger/90':
            variant === 'danger',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
