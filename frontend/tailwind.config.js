/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary palette from reference image
                cream: '#F8E9A1',
                coral: '#F76C6C',
                'coral-dark': '#e55555',
                sky: '#A8D0E6',
                'sky-dark': '#8bbdd9',
                navy: '#374785',
                'navy-dark': '#24305E',

                // Dark theme backgrounds using navy palette
                dark: {
                    primary: '#1a1f3c',
                    secondary: '#24305E',
                    tertiary: '#374785',
                    card: 'rgba(36, 48, 94, 0.8)',
                    hover: 'rgba(168, 208, 230, 0.1)',
                },

                // Accent colors
                accent: {
                    primary: '#F76C6C',
                    'primary-hover': '#e55555',
                    secondary: '#A8D0E6',
                    tertiary: '#F8E9A1',
                },

                // Text colors
                text: {
                    primary: '#ffffff',
                    secondary: '#A8D0E6',
                    muted: 'rgba(168, 208, 230, 0.7)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(247, 108, 108, 0.3)',
                'glow-lg': '0 0 40px rgba(247, 108, 108, 0.4)',
                'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
                'float': '0 20px 40px rgba(0, 0, 0, 0.3)',
            },
            backgroundImage: {
                'accent-gradient': 'linear-gradient(135deg, #F76C6C 0%, #F8E9A1 100%)',
                'navy-gradient': 'linear-gradient(135deg, #24305E 0%, #374785 100%)',
                'sky-gradient': 'linear-gradient(135deg, #A8D0E6 0%, #F8E9A1 100%)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 2s infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'gradient-shift': 'gradient-shift 8s ease infinite',
                'fade-in-up': 'fade-in-up 0.6s ease-out',
                'fade-in': 'fade-in 0.4s ease-out',
                'slide-in-right': 'slide-in-right 0.4s ease-out',
            },
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(247, 108, 108, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(247, 108, 108, 0.5)' },
                },
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'slide-in-right': {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
            },
            transitionProperty: {
                'height': 'height',
                'spacing': 'margin, padding',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
