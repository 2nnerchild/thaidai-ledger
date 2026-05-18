import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'burnt-orange': '#C75D2C',
        'burnt-orange-dark': '#A04820',
        'deep-blue': '#1F3A5F',
        'deep-blue-dark': '#142640',
        cream: '#F5EDDC',
        'cream-light': '#FAF5E9',
        'cream-dark': '#E8DFC8',
        walnut: '#5C3A1E',
        'walnut-dark': '#3E2613',
        'grey-border': '#8B7E6A',
        'black-ink': '#1A1410',
        'red-warn': '#B23A2A',
        'green-success': '#4A6B3A',
      },
      fontFamily: {
        display: ['"DM Serif Display"', '"IBM Plex Sans KR"', 'serif'],
        body: ['"IBM Plex Sans KR"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0',
        none: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        full: '0',
      },
      boxShadow: {
        flat: '4px 4px 0 #3E2613',
        'flat-sm': '3px 3px 0 #3E2613',
        'flat-lg': '6px 6px 0 #3E2613',
      },
    },
  },
  plugins: [],
} satisfies Config;
