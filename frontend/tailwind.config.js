/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        // Custom green palette inspired by modern design
        primary: {
          50: '#f0fdf6',   // Very light green
          100: '#dcfce7',  // Light green  
          200: '#bbf7d0',  // Light green
          300: '#86efac',  // Medium light green
          400: '#4ade80',  // Medium green
          500: '#22c55e',  // Main green
          600: '#16a34a',  // Dark green
          700: '#15803d',  // Darker green
          800: '#166534',  // Very dark green
          900: '#14532d',  // Darkest green
          950: '#052e16',  // Almost black green
        },
        // Custom neutral palette
        neutral: {
          50: '#fafafa',   // Almost white
          100: '#f5f5f5',  // Very light gray
          200: '#e5e5e5',  // Light gray
          300: '#d4d4d4',  // Medium light gray
          400: '#a3a3a3',  // Medium gray
          500: '#737373',  // Gray
          600: '#525252',  // Dark gray
          700: '#404040',  // Darker gray
          800: '#262626',  // Very dark gray
          900: '#171717',  // Almost black
          950: '#0a0a0a',  // Black
        },
        // Accent colors
        accent: {
          mint: '#22d3ee',    // Cyan accent
          sage: '#84cc16',    // Lime accent
          forest: '#059669',  // Emerald accent
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 20px 40px -5px rgba(0, 0, 0, 0.09)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 60px -10px rgba(0, 0, 0, 0.1)',
      }
    },
  },
}