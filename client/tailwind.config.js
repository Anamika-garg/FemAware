/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'rose-mist': '#FFF1F6',
        'soft-petal': '#FFD6E7',
        'blush-pink': '#F8BBD0',
        'pink-glow': '#F672A7',
        'rose-pink': '#E0487E',
        'deep-rose': '#C2185B',
        ink: '#3B2430',
        muted: '#7C5B6A',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -18px rgba(194, 24, 91, 0.28)',
        card: '0 18px 45px -28px rgba(194, 24, 91, 0.32)',
        glow: '0 12px 28px -12px rgba(246, 114, 167, 0.65)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(115deg, #FFF1F6 0%, #FFD6E7 55%, #F672A7 140%)',
        'brand-gradient': 'linear-gradient(to right, #FFF1F6, #F672A7)',
        'petal-radial':
          'radial-gradient(circle at 20% 10%, rgba(248,187,208,0.45), transparent 42%), radial-gradient(circle at 90% 0%, rgba(246,114,167,0.18), transparent 34%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.03)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'soft-pulse': 'soft-pulse 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
