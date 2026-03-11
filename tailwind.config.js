/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Outfit', 'Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#4F46E5", // Indigo-600
          hover: "#4338CA",   // Indigo-700
          light: "#E0E7FF",
        },
        bargain: {
          DEFAULT: "#F97316", // Orange-500
          hover: "#EA580C",   // Orange-600
          light: "#FFEDD5",
        },
        seller: {
          DEFAULT: "#10B981", // Emerald-500
          hover: "#059669",   // Emerald-600
          light: "#D1FAE5",
        },
        background: {
          DEFAULT: "#F8FAFC", // Slate-50
          dark: "#0F172A",    // Slate-900
        },
        card: {
          DEFAULT: "#FFFFFF",
          dark: "#1E293B",
        },
        border: {
          DEFAULT: "#E2E8F0", // Slate-200
          dark: "#334155",
        },
        text: {
          primary: "#0F172A", // Slate-900
          secondary: "#64748B", // Slate-500
          dark: "#F8FAFC",
        },
        danger: {
          DEFAULT: "#EF4444",
          hover: "#DC2626",
        },
        warning: {
          DEFAULT: "#F59E0B",
          hover: "#D97706",
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
