// src/constants/iconColors.ts
const iconColors = {
  light: {
    primary: "#0d0d00",
    secondary: "#5d5d5d",
    tertiary: "#8f8f8f",
    danger: "#e02e2a",
    background: "#ffffff",
    backgroundSecondary: "#e8e8e8",
    backgroundTertiary: "#f3f3f3",
    card: "#ffffff",
    border: "#e5e7eb",
    borderSubtle: "#f3f4f6",
    accent: "#0285ff",
    success: "#008635",
    warning: "#e25507",
  },
  dark: {
    primary: "#ffffff",
    secondary: "#cdcdcd",
    tertiary: "#afafaf",
    danger: "#ff8583",
    background: "#212121",
    backgroundSecondary: "#303030",
    backgroundTertiary: "#414141",
    card: "#1f2937",
    border: "#374151",
    borderSubtle: "#1f2937",
    accent: "#0285ff",
    success: "#40c977",
    warning: "#ff9e6c",
  },
} as const;

export default iconColors;
