import clsx from 'clsx';

import type { HTMLAttributes, PropsWithChildren } from 'react';

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-surface shadow-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
