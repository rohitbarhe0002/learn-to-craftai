/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ChatGPT-Style Dark Theme Colors
        'bg-primary': '#0f0f0f',
        'bg-secondary': '#171717',
        'bg-tertiary': '#1f1f1f',
        'bg-input': '#2f2f2f',
        'bg-hover': '#2a2a2a',
        'bg-user-message': '#1a7f64',
        'bg-assistant-message': '#2f2f2f',
        'bg-assistant-message-hover': '#353535',
        'text-primary': '#ececec',
        'text-secondary': '#d1d1d1',
        'text-tertiary': '#a0a0a0',
        'text-disabled': '#6b6b6b',
        'accent-primary': '#10a37f',
        'accent-hover': '#0d8f6e',
        'border-color': '#404040',
        'border-light': '#2a2a2a',
        'error-color': '#ef4444',
        'success-color': '#10a37f',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      spacing: {
        'xs': '0.5rem',
        'sm': '0.75rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
      },
      borderRadius: {
        'sm': '6px',
        'md': '12px',
        'lg': '18px',
        'xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.3)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.4)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
}
