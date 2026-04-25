import clsx from 'clsx';

import type { PropsWithChildren } from 'react';

export function Badge({
  children,
  tone = 'default',
  className,
}: PropsWithChildren<{
  tone?: 'default' | 'success' | 'warning' | 'accent';
  className?: string;
}>) {
  return (
    <span
      className={clsx(
        'rounded-full px-2.5 py-1 text-xs font-medium',
        {
          'bg-surface-hover text-text-muted': tone === 'default',
          'bg-success-soft text-success-text': tone === 'success',
          'bg-warning-soft text-warning-text': tone === 'warning',
          'bg-accent-soft text-accent-text': tone === 'accent',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
