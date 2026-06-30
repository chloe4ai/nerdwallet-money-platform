import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nw: {
          green: '#00ae4d',
          dark: '#006842',
          darker: '#00401c',
          lime: '#8ccb32',
          mint: '#e6f7ed',
          mint2: '#d3f0de',
        },
        ink: '#1a2620',
        muted: '#5a6b62',
        faint: '#8a988f',
        line: '#e4ebe7',
        amber: '#b5740f',
        amberbg: '#fdf2dd',
        bluenw: '#1f6feb',
        bluebg: '#e9f1fe',
        rednw: '#c0392b',
        redbg: '#fbecec',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,40,20,.05), 0 10px 30px rgba(0,40,20,.07)',
      },
    },
  },
  plugins: [],
};
export default config;
