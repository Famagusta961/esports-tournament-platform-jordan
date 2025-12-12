import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    prefix: "",
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                success: {
                    DEFAULT: 'hsl(var(--success))',
                    foreground: 'hsl(var(--success-foreground))'
                },
                warning: {
                    DEFAULT: 'hsl(var(--warning))',
                    foreground: 'hsl(var(--warning-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                },
                cyan: {
                    400: '#22d3ee',
                    500: '#00d4ff',
                    600: '#00a8cc'
                },
                purple: {
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed'
                }
            },
            fontFamily: {
                display: ['Orbitron', 'sans-serif'],
                gaming: ['Rajdhani', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
                arabic: ['Noto Sans Arabic', 'sans-serif']
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'shimmer': {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' }
                },
                'glow-pulse': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite'
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-gradient': 'linear-gradient(135deg, hsl(240 15% 4%) 0%, hsl(263 30% 10%) 50%, hsl(240 15% 4%) 100%)',
                'card-gradient': 'linear-gradient(135deg, hsl(240 15% 8%) 0%, hsl(240 15% 6%) 100%)',
                'neon-gradient': 'linear-gradient(135deg, hsl(187 100% 42%) 0%, hsl(263 70% 50%) 100%)'
            }
        }
    },
    plugins: [
        require("tailwindcss-animate"),
        // RTL plugin for proper RTL support
        function({ addUtilities }: { addUtilities: any }) {
            const newUtilities = {
                '.rtl-flip': {
                    transform: 'scaleX(-1)'
                },
                '.rtl\:text-right': {
                    '@media [dir="rtl"]': { 'text-align': 'right' }
                },
                '.rtl\:text-left': {
                    '@media [dir="rtl"]': { 'text-align': 'left' }
                },
                '.rtl\:mr-auto': {
                    '@media [dir="rtl"]': { 'margin-right': 'auto' }
                },
                '.rtl\:ml-auto': {
                    '@media [dir="rtl"]': { 'margin-left': 'auto' }
                },
                '.rtl\:ml-4': {
                    '@media [dir="rtl"]': { 'margin-left': '1rem' }
                },
                '.rtl\:mr-4': {
                    '@media [dir="rtl"]': { 'margin-right': '1rem' }
                },
                '.rtl\:rotate-180': {
                    '@media [dir="rtl"]': { transform: 'rotate(180deg)' }
                }
            };
            addUtilities(newUtilities);
        }
    ],
} satisfies Config;
