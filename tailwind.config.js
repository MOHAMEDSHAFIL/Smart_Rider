/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        crt: {
          dark: '#070B09',
          black: '#0A0F0C',
          panel: '#0F1612',
          panelBorder: 'rgba(57, 255, 136, 0.15)',
          panelHover: '#141E19',
          green: '#39FF88',
          greenDim: '#1C6639',
          greenGlow: 'rgba(57, 255, 136, 0.4)',
          amber: '#FFB020',
          amberDim: '#66460C',
          amberGlow: 'rgba(255, 176, 32, 0.4)',
          red: '#FF3B3B',
          redDim: '#661717',
          redGlow: 'rgba(255, 59, 59, 0.4)',
          blue: '#5FA8D3',
          blueDim: '#1B4763',
          blueGlow: 'rgba(95, 168, 211, 0.4)',
          muted: '#52665B',
          text: '#C8DDD0',
          textBright: '#E9F5EE',
        },
        day: {
          bg: '#F4F6F5',
          panel: '#FFFFFF',
          panelBorder: '#E2E8E4',
          panelHover: '#F8FAF9',
          green: '#0D8A46',
          greenBg: '#E7F7EE',
          amber: '#C27400',
          amberBg: '#FEF5E7',
          red: '#D92D20',
          redBg: '#FEE4E2',
          blue: '#175CD3',
          blueBg: '#EFF8FF',
          muted: '#667085',
          text: '#1D2939',
          textBright: '#0F172A',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'crt-green': '0 0 15px rgba(57, 255, 136, 0.25)',
        'crt-amber': '0 0 15px rgba(255, 176, 32, 0.25)',
        'crt-red': '0 0 18px rgba(255, 59, 59, 0.35)',
        'crt-blue': '0 0 15px rgba(95, 168, 211, 0.25)',
        'day-card': '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '0.99' },
          '50%': { opacity: '0.97' },
        }
      }
    },
  },
  plugins: [],
};
