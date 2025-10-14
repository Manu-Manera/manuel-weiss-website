import { extendTheme } from '@chakra-ui/react';

/**
 * Zentrales Chakra UI Theme für Manuel Weiss Platform
 * Konsistente Design-Sprache über alle Komponenten
 */
export const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e6f3ff',
      100: '#b3d9ff',
      200: '#80bfff',
      300: '#4da6ff',
      400: '#1a8cff',
      500: '#0066ff',    // Primary
      600: '#0052cc',
      700: '#003d99',
      800: '#002966',
      900: '#001433',
    },
    secondary: {
      50: '#e6f9ff',
      100: '#b3f0ff',
      200: '#80e7ff',
      300: '#4ddfff',
      400: '#1ad6ff',
      500: '#00d9ff',    // Secondary
      600: '#00aec7',
      700: '#008299',
      800: '#005666',
      900: '#002933',
    },
    accent: {
      50: '#ffe6f3',
      100: '#ffb3d9',
      200: '#ff80bf',
      300: '#ff4da6',
      400: '#ff1a8c',
      500: '#ff006e',    // Accent
      600: '#cc0058',
      700: '#990042',
      800: '#66002c',
      900: '#330016',
    },
    success: {
      50: '#e6fdf0',
      100: '#b3f5d1',
      200: '#80edb2',
      300: '#4de593',
      400: '#1add74',
      500: '#00f593',    // Success
      600: '#00c475',
      700: '#009357',
      800: '#006239',
      900: '#00311c',
    },
    warning: {
      50: '#fff9e6',
      100: '#ffedb3',
      200: '#ffe180',
      300: '#ffd54d',
      400: '#ffc91a',
      500: '#ffb800',    // Warning
      600: '#cc9300',
      700: '#996e00',
      800: '#664900',
      900: '#332400',
    },
    danger: {
      50: '#ffe6e6',
      100: '#ffb3b3',
      200: '#ff8080',
      300: '#ff4d4d',
      400: '#ff1a1a',
      500: '#ff3838',    // Danger
      600: '#cc2d2d',
      700: '#992222',
      800: '#661717',
      900: '#330b0b',
    },
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
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
  breakpoints: {
    base: '0px',
    sm: '480px',
    md: '768px',
    lg: '992px',
    xl: '1280px',
    '2xl': '1536px',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
        _focus: {
          boxShadow: 'outline',
        },
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
          _active: {
            bg: 'brand.700',
          },
        },
        outline: {
          border: '2px solid',
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
        ghost: {
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
        },
      },
      sizes: {
        sm: {
          px: 3,
          py: 2,
          fontSize: 'sm',
        },
        md: {
          px: 4,
          py: 3,
          fontSize: 'md',
        },
        lg: {
          px: 6,
          py: 4,
          fontSize: 'lg',
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md',
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'sm',
          border: '1px solid',
          borderColor: 'gray.200',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'lg',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.900',
      },
      '*': {
        borderColor: 'gray.200',
      },
    },
  },
});

export default theme;
