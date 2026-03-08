/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: "#2563EB",
        "primary-hover": "#1D4ED8",
        bargain: "#F97316",
        "bargain-hover": "#EA580C",
        seller: "#16A34A",
        "seller-hover": "#15803D",
        background: "#F8FAFC",
        "background-dark": "#111827",
        card: "#FFFFFF",
        "card-dark": "#1F2937",
        border: "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        "text-dark": "#F9FAFB",
        danger: "#DC2626",
        warning: "#F59E0B",
      }
    },
  },
  plugins: [],
};
