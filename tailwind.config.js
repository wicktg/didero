/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        board: {
          canvas: "#F5F0E8",
          cell: "#FEFDFB",
          line: "#2B2D2F",
          border: "#D8D0C4",
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
      animation: {
        "dice-tumble": "dice-tumble 420ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "card-slide-in": "card-slide-in 250ms ease-out forwards",
        "modal-enter": "modal-enter 200ms ease-out forwards",
        "log-entry-in": "log-entry-in 220ms ease-out forwards",
        "token-appear": "token-appear 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "turn-glow": "turn-glow 2s ease-in-out infinite",
        "gold-shimmer": "gold-shimmer 4s linear infinite",
        "breathe": "breathe 1.8s ease-in-out infinite",
      },
      keyframes: {
        "dice-tumble": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "15%": { transform: "rotate(14deg) scale(1.08)" },
          "30%": { transform: "rotate(-10deg) scale(1.06)" },
          "45%": { transform: "rotate(8deg) scale(1.03)" },
          "60%": { transform: "rotate(-4deg) scale(1.01)" },
          "75%": { transform: "rotate(2deg) scale(1)" },
          "100%": { transform: "rotate(0deg) scale(1)" },
        },
        "card-slide-in": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "modal-enter": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "log-entry-in": {
          "0%": { opacity: "0", transform: "translateX(10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "token-appear": {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "60%": { opacity: "1", transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "turn-glow": {
          "0%, 100%": { boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.3)" },
          "50%": { boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.12)" },
        },
        "gold-shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "breathe": {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
