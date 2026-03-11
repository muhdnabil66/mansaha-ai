/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        grok: {
          light: {
            bg: "#fdfdfd",
            input: "#f8f8f8",
            text: "#0d0d0d",
            muted: "#9a9a9a",
            border: "#e5e5e5",
          },
          dark: {
            bg: "#141414",
            input: "#212121",
            text: "white",
            muted: "#6b6b6b",
            border: "#2a2a2a",
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    // tailwind-scrollbar tidak wajib, boleh guna CSS biasa
  ],
};
