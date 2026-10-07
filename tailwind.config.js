/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0f',
                panel: '#15151f',
                primary: '#8b5cf6',
                secondary: '#a78bfa',
            },
            animation: {
                'float-up': 'floatUp 3s ease-out forwards',
                'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                floatUp: {
                    '0%': { transform: 'translateY(0) scale(0.5)', opacity: '0' },
                    '10%': { transform: 'translateY(-20px) scale(1.2)', opacity: '1' },
                    '20%': { transform: 'translateY(-40px) scale(1)', opacity: '1' },
                    '100%': { transform: 'translateY(-200px) scale(1)', opacity: '0' },
                }
            }
        },
    },
    plugins: [],
}
