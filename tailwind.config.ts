import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: "#F7F4F0",
          50: "#FCFAF8",
          100: "#F7F4F0",
          200: "#EEE9E2",
        },
        mauve: {
          light: "#F5EFF7",
          DEFAULT: "#E8DFEA",
          dark: "#D6CAD9",
          border: "#DCCFDF",
        },
        plum: {
          light: "#92708B",
          DEFAULT: "#76566F",
          dark: "#5A3E54",
          subtle: "#F3EEF2",
        },
        sage: {
          light: "#576F63",
          DEFAULT: "#3F5148",
          dark: "#2D3B34",
          subtle: "#EDF2EF",
        },
        oviareText: {
          primary: "#29262B",
          secondary: "#77717A",
          muted: "#9D97A2",
          subtle: "#B6B0BA",
        },
        oviareBorder: {
          DEFAULT: "#E7E1E6",
          subtle: "#F0EAEF",
          strong: "#D2CAD1",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        serif: [
          "var(--font-serif)",
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(41, 38, 43, 0.04)",
        card: "0 1px 3px 0 rgba(41, 38, 43, 0.05), 0 1px 2px -1px rgba(41, 38, 43, 0.05)",
        floating: "0 4px 12px 0 rgba(41, 38, 43, 0.07)",
      },
      borderRadius: {
        oviare: "12px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};

export default config;
