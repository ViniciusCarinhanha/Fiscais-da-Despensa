/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2f6c38',
          dim: '#1b5224',
          container: '#d0f3c5',
        },
        'surface-container': {
          lowest: '#ffffff',
          low: '#f0f5ee',
          DEFAULT: '#e8efe5',
          high: '#e0e9dd',
          highest: '#d8e3d5',
        },
        'on-surface': {
          DEFAULT: '#1a1c18',
          variant: '#43493e',
        },
        outline: {
          DEFAULT: '#73796e',
          variant: '#c3c8bc',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
