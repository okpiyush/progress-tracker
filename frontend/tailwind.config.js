/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: '#09090b',    // Zinc 950
                    secondary: '#18181b',  // Zinc 900
                    tertiary: '#27272a',   // Zinc 800
                },
                border: {
                    DEFAULT: '#27272a',   // Zinc 800
                    bright: '#3f3f46',    // Zinc 700
                },
                accent: {
                    green: '#10b981',     // Emerald 500
                    blue: '#3b82f6',      // Blue 500
                    orange: '#f59e0b',    // Amber 500
                    red: '#ef4444',       // Red 500
                    purple: '#8b5cf6',    // Violet 500
                    cyan: '#06b6d4',      // Cyan 500
                },
                text: {
                    primary: '#fafafa',   // Zinc 50
                    secondary: '#a1a1aa', // Zinc 400
                    muted: '#71717a',    // Zinc 500
                },
            },
            fontFamily: {
                sans: ['"Inter"', '"Outfit"', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            boxShadow: {
                'premium': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'glow-green': '0 0 20px rgba(16, 185, 129, 0.1)',
                'glow-blue': '0 0 20px rgba(59, 130, 246, 0.1)',
                'glow-purple': '0 0 20px rgba(139, 92, 246, 0.1)',
                'glass': 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
                '3xl': '24px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-in-right': 'slideInRight 0.5s ease-out',
                'slide-in-up': 'slideInUp 0.5s ease-out',
                'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
}
