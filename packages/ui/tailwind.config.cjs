/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", 'html[class~="dark"]'],
  content: [
    "./src/**/*.{ts,tsx}",
    "../core/**/*.{ts,tsx}"
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      colors: {
        border: {
          DEFAULT: "var(--border)",
          subtle: "var(--border-subtle)"
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          900: "var(--primary-darkest)",
          800: "var(--primary-container)",
          700: "var(--primary-medium)",
          500: "var(--primary)",
          400: "var(--primary-subtle)",
          100: "var(--primary-foreground)",
        },
        link: {
          DEFAULT: "var(--link)"
        }
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "calc(var(--radius) + 4px)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
