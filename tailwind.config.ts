import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'lg': '1rem',
        'md': '0.75rem',
        'sm': '0.5rem',
      },
      boxShadow: {
        'soft': '0 6px 18px rgba(16,24,40,0.08)',
        'elevated': '0 18px 40px rgba(16,24,40,0.12)',
      },
      colors: {
        // Use CSS variables for dynamic theme colors where needed
        'primary': 'hsl(var(--primary-h) var(--primary-s) var(--primary-l))',
        'accent': 'hsl(var(--accent-h) var(--accent-s) var(--accent-l))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;