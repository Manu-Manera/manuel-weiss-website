/**
 * Chakra UI Theme Configuration
 * Angepasstes Design-System für Manuel Weiss Bewerbungsmanager
 */

import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    colors: {
        brand: {
            50: '#f0f4ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#667eea',
            600: '#5a67d8',
            700: '#4c51bf',
            800: '#434190',
            900: '#3c366b',
        },
        success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
        },
        warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
        },
        error: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
        },
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
        }
    },
    
    fonts: {
        heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        mono: '"Fira Code", "JetBrains Mono", Consolas, monospace',
    },
    
    fontSizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
    },
    
    fontWeights: {
        hairline: 100,
        thin: 200,
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
    },
    
    lineHeights: {
        none: 1,
        shorter: 1.25,
        short: 1.375,
        base: 1.5,
        tall: 1.625,
        taller: 2,
    },
    
    letterSpacings: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
    },
    
    breakpoints: {
        base: '0em',
        sm: '30em',
        md: '48em',
        lg: '62em',
        xl: '80em',
        '2xl': '96em',
    },
    
    space: {
        px: '1px',
        0.5: '0.125rem',
        1: '0.25rem',
        1.5: '0.375rem',
        2: '0.5rem',
        2.5: '0.625rem',
        3: '0.75rem',
        3.5: '0.875rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        7: '1.75rem',
        8: '2rem',
        9: '2.25rem',
        10: '2.5rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        28: '7rem',
        32: '8rem',
        36: '9rem',
        40: '10rem',
        44: '11rem',
        48: '12rem',
        52: '13rem',
        56: '14rem',
        60: '15rem',
        64: '16rem',
        72: '18rem',
        80: '20rem',
        96: '24rem',
    },
    
    sizes: {
        max: 'max-content',
        min: 'min-content',
        full: '100%',
        '3xs': '14rem',
        '2xs': '16rem',
        xs: '20rem',
        sm: '24rem',
        md: '28rem',
        lg: '32rem',
        xl: '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
        container: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
        },
    },
    
    radii: {
        none: '0',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
    },
    
    shadows: {
        xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
        'dark-lg': 'rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 5px 10px, rgba(0, 0, 0, 0.4) 0px 15px 40px, rgba(0, 0, 0, 0.1) 0px 0px 0px 1px',
    },
    
    components: {
        Button: {
            baseStyle: {
                fontWeight: 'semibold',
                borderRadius: 'md',
                transition: 'all 0.2s',
                _focus: {
                    boxShadow: 'outline',
                },
            },
            sizes: {
                sm: {
                    fontSize: 'sm',
                    px: 3,
                    py: 1,
                    h: 8,
                    minW: 8,
                },
                md: {
                    fontSize: 'md',
                    px: 4,
                    py: 2,
                    h: 10,
                    minW: 10,
                },
                lg: {
                    fontSize: 'lg',
                    px: 6,
                    py: 3,
                    h: 12,
                    minW: 12,
                },
            },
            variants: {
                solid: {
                    bg: 'brand.500',
                    color: 'white',
                    _hover: {
                        bg: 'brand.600',
                        transform: 'translateY(-1px)',
                        boxShadow: 'lg',
                    },
                    _active: {
                        bg: 'brand.700',
                        transform: 'translateY(0)',
                    },
                },
                outline: {
                    border: '2px solid',
                    borderColor: 'brand.500',
                    color: 'brand.500',
                    _hover: {
                        bg: 'brand.50',
                        borderColor: 'brand.600',
                    },
                },
                ghost: {
                    color: 'brand.500',
                    _hover: {
                        bg: 'brand.50',
                    },
                },
                link: {
                    color: 'brand.500',
                    textDecoration: 'underline',
                    _hover: {
                        color: 'brand.600',
                    },
                },
            },
            defaultProps: {
                size: 'md',
                variant: 'solid',
                colorScheme: 'brand',
            },
        },
        
        Card: {
            baseStyle: {
                container: {
                    bg: 'white',
                    borderRadius: 'xl',
                    boxShadow: 'sm',
                    border: '1px solid',
                    borderColor: 'gray.200',
                    transition: 'all 0.3s',
                    _hover: {
                        boxShadow: 'md',
                        transform: 'translateY(-2px)',
                    },
                },
                header: {
                    px: 6,
                    py: 4,
                    borderBottom: '1px solid',
                    borderColor: 'gray.200',
                },
                body: {
                    px: 6,
                    py: 4,
                },
                footer: {
                    px: 6,
                    py: 4,
                    borderTop: '1px solid',
                    borderColor: 'gray.200',
                },
            },
            variants: {
                elevated: {
                    container: {
                        boxShadow: 'lg',
                        border: 'none',
                    },
                },
                filled: {
                    container: {
                        bg: 'gray.50',
                        border: 'none',
                    },
                },
                outline: {
                    container: {
                        border: '2px solid',
                        borderColor: 'gray.200',
                    },
                },
            },
            defaultProps: {
                variant: 'elevated',
            },
        },
        
        Input: {
            baseStyle: {
                field: {
                    borderRadius: 'md',
                    border: '2px solid',
                    borderColor: 'gray.300',
                    transition: 'all 0.2s',
                    _focus: {
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px brand.500',
                    },
                    _hover: {
                        borderColor: 'gray.400',
                    },
                },
            },
            variants: {
                filled: {
                    field: {
                        bg: 'gray.100',
                        border: 'none',
                        _focus: {
                            bg: 'white',
                            border: '2px solid',
                            borderColor: 'brand.500',
                        },
                    },
                },
                flushed: {
                    field: {
                        border: 'none',
                        borderBottom: '2px solid',
                        borderColor: 'gray.300',
                        borderRadius: 'none',
                        _focus: {
                            borderColor: 'brand.500',
                        },
                    },
                },
                unstyled: {
                    field: {
                        border: 'none',
                        bg: 'transparent',
                    },
                },
            },
            defaultProps: {
                variant: 'outline',
            },
        },
        
        Textarea: {
            baseStyle: {
                borderRadius: 'md',
                border: '2px solid',
                borderColor: 'gray.300',
                transition: 'all 0.2s',
                _focus: {
                    borderColor: 'brand.500',
                    boxShadow: '0 0 0 1px brand.500',
                },
                _hover: {
                    borderColor: 'gray.400',
                },
            },
        },
        
        Select: {
            baseStyle: {
                field: {
                    borderRadius: 'md',
                    border: '2px solid',
                    borderColor: 'gray.300',
                    transition: 'all 0.2s',
                    _focus: {
                        borderColor: 'brand.500',
                        boxShadow: '0 0 0 1px brand.500',
                    },
                    _hover: {
                        borderColor: 'gray.400',
                    },
                },
            },
        },
        
        Checkbox: {
            baseStyle: {
                control: {
                    borderRadius: 'sm',
                    border: '2px solid',
                    borderColor: 'gray.300',
                    transition: 'all 0.2s',
                    _checked: {
                        bg: 'brand.500',
                        borderColor: 'brand.500',
                        _hover: {
                            bg: 'brand.600',
                            borderColor: 'brand.600',
                        },
                    },
                    _focus: {
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
                },
            },
        },
        
        Radio: {
            baseStyle: {
                control: {
                    border: '2px solid',
                    borderColor: 'gray.300',
                    transition: 'all 0.2s',
                    _checked: {
                        bg: 'brand.500',
                        borderColor: 'brand.500',
                        _hover: {
                            bg: 'brand.600',
                            borderColor: 'brand.600',
                        },
                    },
                    _focus: {
                        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
                },
            },
        },
        
        Switch: {
            baseStyle: {
                track: {
                    bg: 'gray.300',
                    _checked: {
                        bg: 'brand.500',
                    },
                },
                thumb: {
                    bg: 'white',
                    _checked: {
                        bg: 'white',
                    },
                },
            },
        },
        
        Progress: {
            baseStyle: {
                track: {
                    bg: 'gray.200',
                    borderRadius: 'full',
                },
                filledTrack: {
                    bg: 'brand.500',
                    borderRadius: 'full',
                },
            },
        },
        
        Alert: {
            baseStyle: {
                container: {
                    borderRadius: 'md',
                    border: '1px solid',
                },
            },
            variants: {
                solid: {
                    container: {
                        bg: 'brand.500',
                        color: 'white',
                    },
                },
                'subtle': {
                    container: {
                        bg: 'brand.50',
                        color: 'brand.700',
                    },
                },
                'left-accent': {
                    container: {
                        borderLeft: '4px solid',
                        borderColor: 'brand.500',
                        bg: 'brand.50',
                    },
                },
                'top-accent': {
                    container: {
                        borderTop: '4px solid',
                        borderColor: 'brand.500',
                        bg: 'brand.50',
                    },
                },
            },
        },
        
        Badge: {
            baseStyle: {
                borderRadius: 'full',
                px: 2,
                py: 1,
                fontSize: 'xs',
                fontWeight: 'semibold',
            },
            variants: {
                solid: {
                    bg: 'brand.500',
                    color: 'white',
                },
                subtle: {
                    bg: 'brand.100',
                    color: 'brand.700',
                },
                outline: {
                    border: '1px solid',
                    borderColor: 'brand.500',
                    color: 'brand.500',
                },
            },
        },
        
        Modal: {
            baseStyle: {
                dialog: {
                    borderRadius: 'xl',
                    boxShadow: '2xl',
                },
                header: {
                    px: 6,
                    py: 4,
                    borderBottom: '1px solid',
                    borderColor: 'gray.200',
                },
                body: {
                    px: 6,
                    py: 4,
                },
                footer: {
                    px: 6,
                    py: 4,
                    borderTop: '1px solid',
                    borderColor: 'gray.200',
                },
            },
        },
        
        Drawer: {
            baseStyle: {
                dialog: {
                    borderRadius: 'xl',
                    boxShadow: '2xl',
                },
                header: {
                    px: 6,
                    py: 4,
                    borderBottom: '1px solid',
                    borderColor: 'gray.200',
                },
                body: {
                    px: 6,
                    py: 4,
                },
                footer: {
                    px: 6,
                    py: 4,
                    borderTop: '1px solid',
                    borderColor: 'gray.200',
                },
            },
        },
        
        Tabs: {
            baseStyle: {
                tab: {
                    fontWeight: 'semibold',
                    color: 'gray.600',
                    _selected: {
                        color: 'brand.500',
                        borderBottom: '2px solid',
                        borderColor: 'brand.500',
                    },
                    _hover: {
                        color: 'brand.400',
                    },
                },
                tablist: {
                    borderBottom: '1px solid',
                    borderColor: 'gray.200',
                },
                tabpanel: {
                    px: 0,
                    py: 4,
                },
            },
        },
        
        Accordion: {
            baseStyle: {
                container: {
                    border: '1px solid',
                    borderColor: 'gray.200',
                    borderRadius: 'md',
                    mb: 2,
                },
                button: {
                    px: 4,
                    py: 3,
                    fontWeight: 'semibold',
                    _hover: {
                        bg: 'gray.50',
                    },
                },
                panel: {
                    px: 4,
                    py: 3,
                    borderTop: '1px solid',
                    borderColor: 'gray.200',
                },
            },
        },
        
        Table: {
            baseStyle: {
                table: {
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                },
                th: {
                    bg: 'gray.50',
                    fontWeight: 'semibold',
                    color: 'gray.700',
                    borderBottom: '1px solid',
                    borderColor: 'gray.200',
                },
                td: {
                    borderBottom: '1px solid',
                    borderColor: 'gray.200',
                },
                tr: {
                    _hover: {
                        bg: 'gray.50',
                    },
                },
            },
        },
        
        Stat: {
            baseStyle: {
                container: {
                    bg: 'white',
                    borderRadius: 'lg',
                    p: 4,
                    boxShadow: 'sm',
                    border: '1px solid',
                    borderColor: 'gray.200',
                },
                label: {
                    fontSize: 'sm',
                    color: 'gray.600',
                    fontWeight: 'medium',
                },
                number: {
                    fontSize: '2xl',
                    fontWeight: 'bold',
                    color: 'gray.900',
                },
                helpText: {
                    fontSize: 'sm',
                    color: 'gray.500',
                },
            },
        },
    },
    
    styles: {
        global: {
            body: {
                bg: 'gray.50',
                color: 'gray.900',
                fontFamily: 'body',
                lineHeight: 'base',
            },
            '*': {
                borderColor: 'gray.200',
            },
            'html, body': {
                height: '100%',
            },
            '#__next': {
                height: '100%',
            },
        },
    },
    
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
    },
    
    direction: 'ltr',
    
    transition: {
        property: 'common',
        duration: 'normal',
        easing: 'ease-in-out',
    },
});

export default theme;
