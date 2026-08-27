import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    // Breakpoints per the design spec: 480 / 768 / 1024 / 1280 / 1440.
    screens: {
      xs: '480px',
      sm: '768px',
      md: '1024px',
      lg: '1280px',
      xl: '1440px',
    },
    extend: {
      colors: {
        ink: '#151515',
        blue: { DEFAULT: '#0500FF', deep: '#0B10A0' },
        orange: { DEFAULT: '#ED7504', dark: '#C96103' },
        magenta: { DEFAULT: '#BA006D', dark: '#95005A' },
        navy: '#232536',
        grey: {
          bg: '#EFEFEF',
          panel: '#F7F7F7',
          line: '#DDDDDD',
          muted: '#7A7A7A',
        },
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1600px',
        prose: '800px',
        form: '520px',
      },
      borderRadius: {
        card: '16px',
        media: '24px',
      },
      boxShadow: {
        pill: '0 6px 24px rgba(21, 21, 21, 0.08)',
        card: '0 8px 30px rgba(21, 21, 21, 0.06)',
        lift: '0 10px 26px rgba(21, 21, 21, 0.14)',
        /* Raised state for cards. Two layers: a tight contact shadow keeps the
           card anchored, a wide soft one carries the sense of height. */
        float: '0 2px 6px rgba(21, 21, 21, 0.05), 0 20px 44px rgba(21, 21, 21, 0.13)',
        /* Same geometry, tinted to the brand blue for accent surfaces. */
        glow: '0 2px 6px rgba(5, 0, 255, 0.06), 0 20px 44px rgba(5, 0, 255, 0.16)',
      },
      letterSpacing: {
        eyebrow: '0.15em',
        cta: '0.12em',
        tightest: '-0.03em',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 30s) linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
