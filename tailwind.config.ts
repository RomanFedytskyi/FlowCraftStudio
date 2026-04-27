import type { Config } from 'tailwindcss';

/**
 * Semantic colors mirror `src/styles/index.css` @theme defaults.
 * Dark appearance uses the same token names via `html.dark` overrides.
 */
const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        background: {
          DEFAULT: '#f5f7fa',
          subtle: '#eef2f7',
          elevated: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f7fa',
          hover: '#e8ecf1',
          selected: '#e6f0ff',
        },
        border: {
          DEFAULT: '#e5e7eb',
          strong: '#d1d5db',
        },
        text: {
          DEFAULT: '#111827',
          muted: '#4b5563',
          subtle: '#6b7280',
          placeholder: '#4b5563',
          inverse: '#ffffff',
        },
        primary: {
          DEFAULT: '#0066ff',
          hover: '#0052cc',
          soft: '#cce0ff',
          text: '#003d99',
        },
        accent: {
          DEFAULT: '#0891b2',
          hover: '#0e7490',
          soft: '#cffafe',
          text: '#155e75',
        },
        success: {
          DEFAULT: '#059669',
          soft: '#d1fae5',
          text: '#047857',
        },
        warning: {
          DEFAULT: '#d97706',
          soft: '#fef3c7',
          text: '#92400e',
        },
        danger: {
          DEFAULT: '#dc2626',
          soft: '#fee2e2',
          text: '#991b1b',
        },
        canvas: {
          DEFAULT: '#ffffff',
          grid: '#e5e7eb',
          node: '#ffffff',
          nodeBorder: '#d1d5db',
          edge: '#6b7280',
          selection: '#0066ff',
        },
        handle: '#0066ff',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        none: 'none',
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
        sm: '0 1px 3px rgb(15 23 42 / 0.08)',
        md: '0 4px 12px rgb(15 23 42 / 0.1)',
        lg: '0 12px 40px -8px rgb(15 23 42 / 0.14)',
        card: '0 10px 36px -14px rgb(15 23 42 / 0.12)',
        floating: '0 24px 54px -24px rgb(15 23 42 / 0.22)',
        node: '0 2px 4px rgb(15 23 42 / 0.1)',
        focus: '0 0 0 2px rgb(0 102 255 / 0.35)',
        'focus-inner': 'inset 0 2px 4px rgb(15 23 42 / 0.12)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      transitionDuration: {
        fast: '150ms',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.33, 1, 0.68, 1)',
      },
    },
  },
};

export default config;
