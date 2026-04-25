import type { Config } from 'tailwindcss';

/**
 * Semantic colors below mirror `src/styles/index.css` @theme defaults.
 * Dark appearance is driven by the `html.dark` CSS variable overrides
 * (same token names) when the user picks Dark or System → dark in settings.
 */
const config: Config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#F8FAFC',
          subtle: '#F1F5F9',
          elevated: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          hover: '#F1F5F9',
          selected: '#EEF2FF',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        text: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
          subtle: '#94A3B8',
          inverse: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          soft: '#DBEAFE',
          text: '#1E40AF',
        },
        accent: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
          soft: '#EDE9FE',
          text: '#5B21B6',
        },
        success: {
          DEFAULT: '#16A34A',
          soft: '#DCFCE7',
          text: '#166534',
        },
        warning: {
          DEFAULT: '#D97706',
          soft: '#FEF3C7',
          text: '#92400E',
        },
        danger: {
          DEFAULT: '#DC2626',
          soft: '#FEE2E2',
          text: '#991B1B',
        },
        canvas: {
          DEFAULT: '#FFFFFF',
          grid: '#E2E8F0',
          node: '#FFFFFF',
          nodeBorder: '#CBD5E1',
          edge: '#64748B',
          selection: '#2563EB',
        },
      },
      borderRadius: {
        sm: '7px',
        md: '12px',
        lg: '17px',
        xl: '22px',
        '2xl': '29px',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
        card: '0 10px 36px -14px rgb(15 23 42 / 0.12)',
        floating: '0 24px 54px -24px rgb(15 23 42 / 0.22)',
        focus: '0 0 0 4px rgb(37 99 235 / 0.18)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
};

export default config;
