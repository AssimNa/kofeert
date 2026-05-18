/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kofert: {
          green: "#1D9E75",
          orange: "#EF9F27",
          red: "#E24B4A",
          blue: "#85B7EB",
          dark: "#1A1A1A",
          gray: "#F5F5F5",
          "gray-dark": "#333333",
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
