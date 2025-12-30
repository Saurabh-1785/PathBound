/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary backgrounds - near black
                'pb-bg': {
                    primary: '#0A0A0F',
                    secondary: '#121218',
                    tertiary: '#1A1A24',
                    elevated: '#1E1E2A',
                },
                // Accent colors - purple/blue inspired by Stellar Lab
                'pb-accent': {
                    primary: '#6366F1',
                    secondary: '#8B5CF6',
                    muted: '#4F46E5',
                    glow: 'rgba(99, 102, 241, 0.15)',
                },
                // Text colors
                'pb-text': {
                    primary: '#FFFFFF',
                    secondary: '#A0A0B0',
                    muted: '#6B6B7B',
                    disabled: '#4A4A5A',
                },
                // Status colors
                'pb-status': {
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    pending: '#F59E0B',
                    executed: '#10B981',
                    expired: '#6B7280',
                },
                // Border colors
                'pb-border': {
                    subtle: 'rgba(255, 255, 255, 0.06)',
                    default: 'rgba(255, 255, 255, 0.1)',
                    focus: 'rgba(99, 102, 241, 0.5)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            boxShadow: {
                'glow-sm': '0 0 10px rgba(99, 102, 241, 0.15)',
                'glow-md': '0 0 20px rgba(99, 102, 241, 0.2)',
                'glow-lg': '0 0 30px rgba(99, 102, 241, 0.25)',
                'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
            },
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
                },
            },
        },
    },
    plugins: [],
}
