/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette. Pink is the only hue; white and near-white carry most surfaces.
        'rose-mist': '#FFF1F6',
        'soft-petal': '#FFD6E7',
        'blush-pink': '#F8BBD0',
        'pink-glow': '#F672A7',
        'rose-pink': '#E0487E',
        'deep-rose': '#C2185B',
        // Text tones: warm near-blacks tinted toward the brand rose.
        ink: '#33202A',
        muted: '#6B5560',
        // Page canvas and hairline borders.
        canvas: '#FFFBFC',
        line: '#F3D9E3',
        // Short names used by the teen module. Same palette as above.
        mist: '#FFF1F6',
        petal: '#FFD6E7',
        blush: '#F8BBD0',
        glow: '#F672A7',
        rose: '#E0487E',
        deep: '#C2185B',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'ui-serif', 'Georgia', 'serif'],
      },
      fontSize: {
        // Editorial display sizes with tuned line heights.
        'display-sm': ['2rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-lg': ['3.25rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['4rem', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
      },
      borderRadius: {
        // A quieter corner scale. Pills remain available as rounded-full.
        lg: '0.5rem',
        xl: '0.625rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(51, 32, 42, 0.05)',
        card: '0 1px 2px rgba(51, 32, 42, 0.04), 0 16px 40px -28px rgba(51, 32, 42, 0.28)',
        glow: '0 1px 2px rgba(51, 32, 42, 0.08)',
        lift: '0 2px 4px rgba(51, 32, 42, 0.04), 0 22px 44px -30px rgba(194, 24, 91, 0.35)',
      },
      maxWidth: {
        prose: '68ch',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.85)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'pop-in': 'pop-in 0.18s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
