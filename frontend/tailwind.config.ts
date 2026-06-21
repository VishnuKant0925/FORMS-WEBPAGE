import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B5ED7',
          dark:    '#0A4EBB',
          light:   '#EFF6FF',
        },
        secondary: '#1E88E5',
        accent:    '#00897B',
        success:   '#2E7D32',
        warning:   '#ED6C02',
        error:     '#D32F2F',
        surface:   '#FFFFFF',
        bg:        '#F4F6FA',
        border:    '#E5E7EB',
        'text-primary':   '#111827',
        'text-secondary': '#6B7280',
        'text-muted':     '#9CA3AF',
      },
      fontFamily: {
        sans:   ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        // Correctly defines font-hindi as a Tailwind class
        hindi:  ['var(--font-noto-devanagari)', 'Noto Sans Devanagari', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      borderRadius: {
        card:  '10px',
        input: '6px',
        btn:   '6px',
      },
      boxShadow: {
        card:         '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 14px rgba(0,0,0,0.09)',
        sidebar:      '1px 0 0 #E5E7EB',
        topnav:       '0 1px 0 #E5E7EB',
      },
      spacing: {
        'sidebar': '256px',
        'topnav':  '60px',
      },
    },
  },
  plugins: [],
};

export default config;
