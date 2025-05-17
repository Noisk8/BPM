import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

// Configuración para el modo claro/oscuro
const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

// Colores cyberpunk para el tema
const colors = {
  // Colores de BPM (conservamos pero con tonos más cyberpunk)
  bpm: {
    blue: "#00FFFF",    // 70-90 BPM - Cyan neón
    green: "#39FF14",   // 90-100 BPM - Verde neón
    yellow: "#FFFF00",  // 100-110 BPM - Amarillo neón
    orange: "#FF9500",  // 110-120 BPM - Naranja neón
    red: "#FF0050",     // 120-130 BPM - Rojo neón
    purple: "#BF00FF"   // 130-140 BPM - Púrpura neón
  },
  // Colores principales del tema cyberpunk
  cyberpunk: {
    50: "#E6FFFA",
    100: "#B3F5FF",
    200: "#80EEFF",
    300: "#4DE6FF",
    400: "#1ADFFF",
    500: "#00CFFF", // Color principal - Cyan neón
    600: "#00A3CC",
    700: "#007799",
    800: "#004C66",
    900: "#002233",
  },
  neonPink: {
    50: "#FFE6F5",
    100: "#FFB3E6",
    200: "#FF80D6",
    300: "#FF4DC7",
    400: "#FF1AB8",
    500: "#FF00AA", // Color secundario - Rosa neón
    600: "#CC0088",
    700: "#990066",
    800: "#660044",
    900: "#330022",
  },
};

// Estilos específicos para modo oscuro y claro
const styles = {
  global: (props: any) => ({
    body: {
      bg: props.colorMode === "dark" ? "#121212" : "#f0f0f0",
      color: props.colorMode === "dark" ? "#e0e0e0" : "#202020",
      backgroundImage: props.colorMode === "dark" 
        ? "linear-gradient(to bottom, #121212, #1a1a1a)" 
        : "linear-gradient(to bottom, #f0f0f0, #e0e0e0)",
      transition: "background-color 0.3s ease, color 0.3s ease",
    },
  }),
};

// Componentes con estilo personalizado
const components = {
  Button: {
    baseStyle: (props: any) => ({
      fontWeight: "bold",
      borderRadius: "md",
      _focus: {
        boxShadow: props.colorMode === "dark" 
          ? "0 0 0 3px rgba(0, 207, 255, 0.6)" 
          : "0 0 0 3px rgba(0, 207, 255, 0.4)",
      },
    }),
    variants: {
      solid: (props: any) => ({
        bg: props.colorMode === "dark" ? "cyberpunk.500" : "cyberpunk.400",
        color: "white",
        _hover: {
          bg: props.colorMode === "dark" ? "cyberpunk.600" : "cyberpunk.500",
          boxShadow: "0 0 15px rgba(0, 207, 255, 0.7)",
          transform: "translateY(-2px)",
          transition: "all 0.2s ease",
        },
      }),
      outline: (props: any) => ({
        borderColor: props.colorMode === "dark" ? "cyberpunk.500" : "cyberpunk.400",
        color: props.colorMode === "dark" ? "cyberpunk.500" : "cyberpunk.400",
        _hover: {
          bg: "transparent",
          borderColor: props.colorMode === "dark" ? "cyberpunk.400" : "cyberpunk.300",
          boxShadow: "0 0 10px rgba(0, 207, 255, 0.5)",
          color: props.colorMode === "dark" ? "cyberpunk.400" : "cyberpunk.300",
        },
      }),
      ghost: (props: any) => ({
        _hover: {
          bg: props.colorMode === "dark" ? "whiteAlpha.200" : "blackAlpha.100",
        },
      }),
    },
  },
  Card: {
    baseStyle: (props: any) => ({
      container: {
        bg: props.colorMode === "dark" ? "#1e1e1e" : "white",
        borderWidth: "1px",
        borderColor: props.colorMode === "dark" ? "#333" : "#ddd",
        boxShadow: props.colorMode === "dark" 
          ? "0 4px 12px rgba(0, 207, 255, 0.1)" 
          : "0 4px 12px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        _hover: {
          boxShadow: props.colorMode === "dark" 
            ? "0 6px 16px rgba(0, 207, 255, 0.15)" 
            : "0 6px 16px rgba(0, 0, 0, 0.08)",
          transform: "translateY(-2px)",
        },
      },
    }),
  },
  Input: {
    variants: {
      outline: (props: any) => ({
        field: {
          borderColor: props.colorMode === "dark" ? "whiteAlpha.300" : "blackAlpha.200",
          bg: props.colorMode === "dark" ? "whiteAlpha.50" : "white",
          _hover: {
            borderColor: props.colorMode === "dark" ? "cyberpunk.500" : "cyberpunk.400",
          },
          _focus: {
            borderColor: props.colorMode === "dark" ? "cyberpunk.500" : "cyberpunk.400",
            boxShadow: `0 0 0 1px ${props.colorMode === "dark" ? "#00CFFF" : "#00CFFF"}`,
          },
        },
      }),
    },
  },
  Tabs: {
    variants: {
      line: (props: any) => ({
        tab: {
          _selected: {
            color: props.colorMode === "dark" ? "cyberpunk.500" : "cyberpunk.600",
            borderColor: props.colorMode === "dark" ? "cyberpunk.500" : "cyberpunk.600",
          },
          _active: {
            bg: props.colorMode === "dark" ? "whiteAlpha.100" : "blackAlpha.100",
          },
        },
      }),
    },
  },
};

// Crear y exportar el tema
const theme = extendTheme({ config, colors, styles, components });

export default theme;
