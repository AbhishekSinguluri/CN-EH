/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./popup.html",
    "./dashboard.html",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0f1d',
          900: '#0f172a',
          850: '#131d35',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        shield: {
          emerald: '#10b981',
          emeraldLight: '#ecfdf5',
          emeraldBorder: '#a7f3d0',
          amber: '#f59e0b',
          amberLight: '#fffbeb',
          amberBorder: '#fde68a',
          rose: '#ef4444',
          roseLight: '#fef2f2',
          roseBorder: '#fecaca',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
