import clsx from 'clsx';

import type { InputHTMLAttributes } from 'react';

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text',
        'placeholder:text-placeholder',
        'transition-[border-color,box-shadow] duration-fast ease-out-expo',
        'focus:border-primary focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]',
        className,
      )}
      {...props}
    />
  );
}
