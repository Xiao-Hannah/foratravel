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

        // First Quote Walkthrough palette (ported from first-booking-buddy)
        wtBg: "#F5F0E8",         // warm cream background
        wtCard: "#FFFFFF",       // white card surface
        wtBorder: "#E0DAD0",     // hairline border
        wtMuted: "#888888",      // muted secondary text
        wtMutedBg: "#EFEAE0",    // muted input background
        brown: "#7D6A4F",        // primary CTA
        brownHover: "#675843",   // CTA hover
        earn: "#8B6914",         // earnings amber-brown
        earnBg: "#FDF8F5",
        reserve: "#F5A623",      // reserve badge amber
        reserveBanner: "#FEF9EC",
        warningBanner: "#FEF3CD",
        beigeImage: "#D4C5B0",   // photo placeholder
        tipBg: "#F0EDE8",
        sidekickBg: "#F5F5F5",
        success: "#2ECC71",      // selected / check
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
        checkPop: "pop 400ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      },
    },
  },
  plugins: [],
};
