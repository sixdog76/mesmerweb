/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Near-black background
        dark: {
          900: '#0B0E11',
          800: '#12161B',
          700: '#1A1F26',
        },
        // Soft white text (not pure white)
        cream: {
          100: '#F5F5F3',
          200: '#E8E8E4',
          300: '#D4D4CE',
        },
        // Muted teal accent
        accent: {
          DEFAULT: '#5B8A8A',
          light: '#7BA3A3',
          dark: '#4A7272',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Limited font scale for minimalism
        'hero': ['clamp(2.5rem, 6vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'sub': ['clamp(1.125rem, 2vw, 1.5rem)', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.7' }],
      },
      spacing: {
        // Generous spacing
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease-out forwards',
        'fade-in-delayed': 'fadeIn 1.2s ease-out 0.4s forwards',
        'fade-in-slow': 'fadeIn 2s ease-out 0.8s forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
