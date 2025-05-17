import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Configuración para el modo de color
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Colores personalizados para el sistema BPM
const colors = {
  // Colores para los rangos de BPM según la memoria del usuario
  bpmBlue: {
    50: '#e3f2fd',
    100: '#bbdefb',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  bpmGreen: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  bpmYellow: {
    50: '#fffde7',
    100: '#fff9c4',
    500: '#ffeb3b',
    600: '#fdd835',
    700: '#fbc02d',
    800: '#f9a825',
    900: '#f57f17',
  },
  bpmOrange: {
    50: '#fff3e0',
    100: '#ffe0b2',
    500: '#ff9800',
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  bpmRed: {
    50: '#ffebee',
    100: '#ffcdd2',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  bpmPurple: {
    50: '#f3e5f5',
    100: '#e1bee7',
    500: '#9c27b0',
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
  },
  // Colores para el tema cyberpunk
  cyberpunk: {
    50: '#e0f7fa',
    100: '#b2ebf2',
    200: '#80deea',
    300: '#4dd0e1',
    400: '#26c6da',
    500: '#00bcd4',
    600: '#00acc1',
    700: '#0097a7',
    800: '#00838f',
    900: '#006064',
  },
  neonPink: {
    50: '#fce4ec',
    100: '#f8bbd0',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#e91e63',
    600: '#d81b60',
    700: '#c2185b',
    800: '#ad1457',
    900: '#880e4f',
  },
};

// Estilos globales para mejorar la accesibilidad
const styles = {
  global: (props: { colorMode: 'light' | 'dark' }) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      lineHeight: 'tall',
      transition: 'background-color 0.2s, color 0.2s',
    },
    // Mejoras de accesibilidad para enlaces
    a: {
      color: props.colorMode === 'dark' ? 'blue.300' : 'blue.600',
      _hover: {
        textDecoration: 'underline',
      },
    },
    // Mejoras para el contraste en textos
    'h1, h2, h3, h4, h5, h6': {
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      fontWeight: 'bold',
    },
    // Estilos para el efecto cyberpunk
    '.cyberpunk-grid': {
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 
          props.colorMode === 'dark' 
            ? 'linear-gradient(to right, rgba(0,188,212,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,188,212,0.05) 1px, transparent 1px)'
            : 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        pointerEvents: 'none',
      },
    },
    '.scan-effect': {
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: props.colorMode === 'dark' ? 'rgba(0,188,212,0.5)' : 'rgba(0,188,212,0.3)',
        boxShadow: props.colorMode === 'dark' ? '0 0 10px rgba(0,188,212,0.5)' : '0 0 5px rgba(0,188,212,0.3)',
        animation: 'scan 4s linear infinite',
        opacity: 0.7,
      },
      '@keyframes scan': {
        '0%': {
          top: '0%',
        },
        '100%': {
          top: '100%',
        },
      },
    },
    '.cyberpunk-glitch': {
      position: 'relative',
      '&::before, &::after': {
        content: 'attr(data-text)',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      },
      '&::before': {
        left: '2px',
        textShadow: '-1px 0 rgba(255,30,99,0.7)',
        animation: 'glitch-anim-1 2s infinite linear alternate-reverse',
      },
      '&::after': {
        left: '-2px',
        textShadow: '1px 0 rgba(0,188,212,0.7)',
        animation: 'glitch-anim-2 3s infinite linear alternate-reverse',
      },
      '@keyframes glitch-anim-1': {
        '0%, 100%': { clipPath: 'inset(50% 0 50% 0)' },
        '25%': { clipPath: 'inset(0% 0 70% 0)' },
        '50%': { clipPath: 'inset(25% 0 50% 0)' },
        '75%': { clipPath: 'inset(75% 0 0% 0)' },
      },
      '@keyframes glitch-anim-2': {
        '0%, 100%': { clipPath: 'inset(30% 0 40% 0)' },
        '25%': { clipPath: 'inset(60% 0 10% 0)' },
        '50%': { clipPath: 'inset(10% 0 60% 0)' },
        '75%': { clipPath: 'inset(40% 0 30% 0)' },
      },
    },
    '.terminal-text': {
      fontFamily: 'monospace',
      letterSpacing: '0.05em',
      animation: 'typing 3.5s steps(40, end)',
      '@keyframes typing': {
        from: { width: '0' },
        to: { width: '100%' },
      },
    },
  }),
};

// Componentes con estilos personalizados para mejorar la accesibilidad
const components = {
  Button: {
    baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
      fontWeight: 'medium',
      borderRadius: 'md',
      _focus: {
        boxShadow: props.colorMode === 'dark' ? '0 0 0 3px rgba(0,188,212,0.6)' : '0 0 0 3px rgba(66,153,225,0.6)',
      },
    }),
  },
  Heading: {
    baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    }),
  },
  Input: {
    baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
      field: {
        _focus: {
          borderColor: props.colorMode === 'dark' ? 'cyberpunk.500' : 'blue.500',
          boxShadow: props.colorMode === 'dark' ? '0 0 0 1px rgba(0,188,212,0.6)' : '0 0 0 1px rgba(66,153,225,0.6)',
        },
      },
    }),
  },
  Link: {
    baseStyle: (props: { colorMode: 'light' | 'dark' }) => ({
      color: props.colorMode === 'dark' ? 'blue.300' : 'blue.600',
      _hover: {
        textDecoration: 'underline',
      },
      _focus: {
        boxShadow: props.colorMode === 'dark' ? '0 0 0 3px rgba(0,188,212,0.6)' : '0 0 0 3px rgba(66,153,225,0.6)',
        outline: 'none',
      },
    }),
  },
  // Personalización para mejorar la accesibilidad en tablas
  Table: {
    variants: {
      simple: (props: { colorMode: 'light' | 'dark' }) => ({
        th: {
          borderBottom: '1px',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
          color: props.colorMode === 'dark' ? 'gray.100' : 'gray.700',
          fontWeight: 'bold',
        },
        td: {
          borderBottom: '1px',
          borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
        },
        tbody: {
          tr: {
            _hover: {
              bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.50',
            },
          },
        },
      }),
    },
  },
};

// Creamos y exportamos el tema extendido
const theme = extendTheme({
  config,
  colors,
  styles,
  components,
  fonts: {
    heading: '"Montserrat", sans-serif',
    body: '"Open Sans", sans-serif',
  },
});

export default theme;
