import config from '@dir/ui/tailwind.config.cjs'

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["**/*.{ts,tsx}", "../ui/**/*.{ts,tsx}", "../ui/tailwind.config.cjs"],
  theme: {
    ...config.theme
  },
  plugins: [require("tailwindcss-animate")],
};
