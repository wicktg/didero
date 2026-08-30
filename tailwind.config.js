/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        board: {
          canvas: "#F7F5F0",
          card: "#FFFFFF",
          line: "#2B2D2F",
          border: "#E4DFD5",
          accent: "#1A365D",
        },
        monopoly: {
          brown: "#8B4513",
          lightblue: "#70B5D8",
          pink: "#D84384",
          orange: "#F57C00",
          red: "#D32F2F",
          yellow: "#FBC02D",
          green: "#2E7D32",
          darkblue: "#1565C0",
          railroad: "#37474F",
          utility: "#D97706",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
