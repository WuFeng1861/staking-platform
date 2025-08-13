/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#10B981',
          background: '#FFFFFF',
          surface: '#F8FAFC',
          text: '#1F2937',
          'text-secondary': '#6B7280',
          border: '#E5E7EB',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        // Dark theme colors
        dark: {
          primary: '#60A5FA',
          secondary: '#A78BFA',
          accent: '#34D399',
          background: '#111827',
          surface: '#1F2937',
          text: '#F9FAFB',
          'text-secondary': '#D1D5DB',
          border: '#374151',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
        },
        // NexaFi brand colors
        nexafi: {
          primary: '#6366F1',
          secondary: '#8B5CF6',
          accent: '#06B6D4',
          gradient: {
            from: '#6366F1',
            to: '#8B5CF6'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'nexafi': '0 4px 14px 0 rgba(99, 102, 241, 0.15)',
        'nexafi-lg': '0 10px 25px 0 rgba(99, 102, 241, 0.2)',
      }
    },
  },
  plugins: [],
}