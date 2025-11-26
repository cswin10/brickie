// Brickie Theme Tokens
export const colors = {
  // Primary - Brick Red
  brick: {
    50: "#FDF6F3",
    100: "#FAE8E1",
    200: "#F5CFC2",
    300: "#EBA893",
    400: "#E07D5F",
    500: "#B9452C", // Main brand color
    600: "#A34730",
    700: "#863A28",
    800: "#6E3224",
    900: "#5C2C21",
  },

  // Neutral - Warm Greys
  warm: {
    50: "#FDFCFB",
    100: "#F9F6F3",
    200: "#F4F1EE", // Background
    300: "#E8DFD7",
    400: "#D4C5B8",
    500: "#B8A393",
    600: "#998272",
    700: "#7D6A5B",
    800: "#655549",
    900: "#544740",
  },

  // Text colors
  text: {
    primary: "#1C1C1C", // Charcoal
    secondary: "#544740",
    muted: "#998272",
    inverse: "#FFFFFF",
  },

  // Semantic colors
  success: {
    light: "#D1FAE5",
    main: "#10B981",
    dark: "#059669",
  },
  warning: {
    light: "#FEF3C7",
    main: "#F59E0B",
    dark: "#D97706",
  },
  error: {
    light: "#FEE2E2",
    main: "#EF4444",
    dark: "#DC2626",
  },

  // Background colors
  background: {
    primary: "#FDFCFB",
    secondary: "#F4F1EE",
    card: "#FFFFFF",
  },

  // Border colors
  border: {
    light: "#E8DFD7",
    default: "#D4C5B8",
    dark: "#B8A393",
  },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
};

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

// Export as single theme object
export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
};

export type Theme = typeof theme;
