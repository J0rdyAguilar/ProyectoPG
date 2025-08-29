/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        bg: "#ffffff",
        card: "#ffffff",
        soft: "#d1d5db", // borde suave visible
        primary: {
          DEFAULT: "#16a34a",
          50:  "#ecfdf5",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        ink: {
          DEFAULT: "#0f172a", // texto principal
          muted: "#475569",   // texto secundario
        },
      },
      borderRadius: { xl2: "1.25rem" },
      boxShadow: { soft: "0 1px 3px rgba(0,0,0,.08)" },
    },
  },
  plugins: [],
}
