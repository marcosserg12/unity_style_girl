import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Paleta Unity Girl ───────────────────────────────────────────────
      colors: {
        wine: {
          50:  '#fdf2f4',
          100: '#fce7eb',
          200: '#f9d2da',
          300: '#f4adbc',
          400: '#ec7d95',
          500: '#e0516f',
          600: '#ca3053',
          700: '#aa2040',
          800: '#8b1a2d',
          900: '#7b0d1e',
          950: '#5c0b17',
        },
        cream: {
          50:  '#fdfcfb',
          100: '#f5f0e8',
          200: '#ede8df',
          300: '#e0d9ce',
          400: '#c9bfb0',
          500: '#b0a396',
        },
        gold: {
          400: '#d4af37',
          500: '#c9a227',
        },
      },

      // ─── Tipografia via variáveis CSS (next/font) ────────────────────────
      fontFamily: {
        serif:  ['var(--font-serif)', 'Georgia', 'serif'],
        script: ['var(--font-script)', 'cursive'],
        sans:   ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },

      // ─── Sombras ────────────────────────────────────────────────────────
      boxShadow: {
        'card':       '0 2px 8px rgba(123, 13, 30, 0.08), 0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(123, 13, 30, 0.15), 0 2px 8px rgba(0,0,0,0.08)',
        'modal':      '0 20px 60px rgba(0,0,0,0.3)',
        'wine':       '0 4px 14px rgba(123, 13, 30, 0.4)',
      },

      // ─── Animações ───────────────────────────────────────────────────────
      animation: {
        'fade-in':        'fadeIn 0.5s ease-out both',
        'slide-up':       'slideUp 0.6s ease-out both',
        'slide-in-right': 'slideInRight 0.4s ease-out both',
        'marquee':        'marquee 30s linear infinite',
        'float':          'float 7s ease-in-out infinite',
        'sparkle':        'sparkle 2.8s ease-in-out infinite',
        'bounce-soft':    'bounceSoft 2.4s ease-in-out infinite',
        'rotate-in':      'rotateIn 0.6s ease-out both',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:      { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(100%)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        marquee:      { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%':      { transform: 'translateY(-14px) rotate(1.5deg)' },
          '66%':      { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%':      { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%':      { transform: 'translateY(-8px)' },
          '60%':      { transform: 'translateY(-4px)' },
        },
        rotateIn: { '0%': { opacity: '0', transform: 'rotate(-6deg) scale(0.9)' }, '100%': { opacity: '1', transform: 'rotate(0deg) scale(1)' } },
      },

      backgroundImage: {
        'gradient-wine':  'linear-gradient(135deg, #7b0d1e 0%, #8b1a2d 50%, #5c0b17 100%)',
        'gradient-cream': 'linear-gradient(180deg, #f5f0e8 0%, #ede8df 100%)',
        'gradient-hero':  'linear-gradient(to right, rgba(123,13,30,0.92) 0%, rgba(92,11,23,0.7) 60%, transparent 100%)',
      },
    },
  },
  plugins: [],
}

export default config
