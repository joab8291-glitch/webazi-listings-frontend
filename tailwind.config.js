export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#EEF0EA',
        paperDark: '#E2E5DB',
        ink: '#1F2A24',
        inkSoft: '#4A554E',
        jade: '#2F6F5E',
        jadeDark: '#204F42',
        ochre: '#C1651B',
        ochreDark: '#9C4F14',
        muted: '#8A8578',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
