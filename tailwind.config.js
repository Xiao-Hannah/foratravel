/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sourced from foratravel.com production CSS (April 2026).
        cream: "#FEFAF5",        // primary background (warm off-white)
        creamDeep: "#F4ECDD",    // section divider / subtle band
        ink: "#131313",          // primary text (near-black)
        inkSoft: "#474747",      // secondary text
        fora: "#4B64FF",         // accent (cobalt) — used sparingly
        foraDark: "#3A4FE0",     // hover state for cobalt
        coral: "#F1644B",        // secondary accent
        sand: "#C3AD97",         // warm neutral / borders
        taupe: "#827363",        // muted warm gray-brown (CTA secondary)
        taupeDark: "#6B5E50",    // hover state for taupe
        mustard: "#FFCD27",      // tertiary accent
      },
      fontFamily: {
        // Fraunces stands in for Fora's proprietary Chiswick serif.
        display: [
          "var(--font-display)",
          "'Iowan Old Style'",
          "Georgia",
          "serif",
        ],
        sans: [
          "'Helvetica Neue'",
          "Helvetica",
          "Arial",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightish: "-0.01em",
        tighter2: "-0.02em",
      },
      borderRadius: {
        // Fora favors small radii for buttons (6px) and square inputs.
        cta: "6px",
      },
      keyframes: {
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        slideIn: "slideIn 220ms ease-out",
        fadeUp: "fadeUp 360ms cubic-bezier(0.2, 0.8, 0.2, 1)",
        pop: "pop 320ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
