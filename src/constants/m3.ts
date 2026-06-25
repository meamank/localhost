/**
 * M3 Design System Colors — JS constants
 *
 * Use these when you need raw hex values for style props that
 * don't accept classNames (tabBarActiveTintColor, headerStyle, etc.)
 *
 * For View/Text className styling, use the Tailwind classes from global.css
 * (e.g. bg-primary, text-on-surface, etc.)
 */

const m3 = {
  light: {
    // Surfaces
    background: "#F3FAF6",
    surface: "#F7FCFA",
    surfaceVariant: "#DCE5DE",
    surfaceContainer: "#E8F0EB",
    card: "#FFFFFF",

    // Primary (Sage Green)
    primary: "#1F6C50",
    onPrimary: "#FFFFFF",
    primaryContainer: "#C4F2DB",
    onPrimaryContainer: "#002114",

    // Secondary
    secondary: "#4C6357",
    onSecondary: "#FFFFFF",
    secondaryContainer: "#CEE9DB",

    // Tertiary
    tertiary: "#3F6555",

    // Text
    onBackground: "#191D1A",
    onSurface: "#191D1A",
    onSurfaceVariant: "#404944",

    // Outline / Borders
    outline: "#707973",
    outlineVariant: "#BFC9C2",

    // Status
    error: "#BA1A1A",
    success: "#1F6C50",
    warning: "#8F4F20",

    // Accent Palettes (Static)
    accentOrange: "#FFDBC6",
    accentOrangeOn: "#301400",
    accentOrangeBold: "#8F4F20",
    accentOrangeSurface: "#FAF6F2",

    accentBlue: "#C9E2FF",
    accentBlueOn: "#001D38",
    accentBlueBold: "#22588F",
    accentBlueSurface: "#F3F7FA",

    accentPurple: "#FFD8EC",
    accentPurpleOn: "#370B2C",
    accentPurpleBold: "#6C4FBB",
    accentPurpleSurface: "#F9F7FC",

    accentRose: "#FFE0E5",
    accentRoseOn: "#3B0812",
    accentRoseBold: "#984061",
    accentRoseSurface: "#FFF8F8",
  },
  dark: {
    // Surfaces
    background: "#0D1210",
    surface: "#151B18",
    surfaceVariant: "#404944",
    surfaceContainer: "#1D2320",
    card: "#1D2320",

    // Primary (Sage Green)
    primary: "#6EDBB1",
    onPrimary: "#003824",
    primaryContainer: "#005236",
    onPrimaryContainer: "#C4F2DB",

    // Secondary
    secondary: "#4E9A7E",
    onSecondary: "#1F362A",
    secondaryContainer: "#354C40",

    // Tertiary
    tertiary: "#8AC7AC",

    // Text
    onBackground: "#E1E3DF",
    onSurface: "#E1E3DF",
    onSurfaceVariant: "#BFC9C2",

    // Outline / Borders
    outline: "#8A938C",
    outlineVariant: "#404944",

    // Status
    error: "#FFB4AB",
    success: "#6EDBB1",
    warning: "#F5A873",

    // Accent Palettes (Static)
    accentOrange: "#FFDBC6",
    accentOrangeOn: "#301400",
    accentOrangeBold: "#8F4F20",
    accentOrangeSurface: "#FAF6F2",

    accentBlue: "#C9E2FF",
    accentBlueOn: "#001D38",
    accentBlueBold: "#22588F",
    accentBlueSurface: "#F3F7FA",

    accentPurple: "#FFD8EC",
    accentPurpleOn: "#370B2C",
    accentPurpleBold: "#6C4FBB",
    accentPurpleSurface: "#F9F7FC",

    accentRose: "#FFE0E5",
    accentRoseOn: "#3B0812",
    accentRoseBold: "#984061",
    accentRoseSurface: "#FFF8F8",
  },
} as const;

export default m3;
