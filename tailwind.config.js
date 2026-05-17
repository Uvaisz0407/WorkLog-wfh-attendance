/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        dark: {
          900: '#080C14',
          800: '#0D1220',
          700: '#111827',
          600: '#1A2235',
          500: '#1E2A42',
          400: '#243352',
        },
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: '#60A5FA',
          subtle: 'rgba(59,130,246,0.12)',
        },
        success: { DEFAULT: '#10B981', subtle: 'rgba(16,185,129,0.12)' },
        warning: { DEFAULT: '#F59E0B', subtle: 'rgba(245,158,11,0.12)' },
        danger: { DEFAULT: '#EF4444', subtle: 'rgba(239,68,68,0.12)' },
        purple: { DEFAULT: '#8B5CF6', subtle: 'rgba(139,92,246,0.12)' },
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
