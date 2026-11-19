// Uphill design tokens: the single source for colour, space, shape, type and motion.
import type { BlazeColor } from "@/types";

export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export type Scheme = "dark" | "light";

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceSunken: string;
  border: string;
  track: string;
  text: string;
  textMuted: string;
  /** Blaze red: the one action/progress accent. */
  accent: string;
  accentSoft: string;
  onAccent: string;
  /** Warmth, camps, light. */
  sun: string;
  /** Text-safe version of sun for small type. */
  sunText: string;
  /** Cold and weather. */
  cold: string;
  coldSoft: string;
  /** Trail-marker paints. */
  blaze: Record<BlazeColor, string>;
  /** The mountain scene. `bg` is used for the nearest ground so UI and world join. */
  scene: {
    skyTop: string;
    skyBottom: string;
    orb: string;
    star: string;
    ridgeFar: string;
    ridgeMid: string;
    ridgeNear: string;
    snow: string;
    cloud: string;
    trail: string;
    /** Colour ridges fade into at their base. */
    haze: string;
    /** Pines standing on the nearest ground. */
    pine: string;
    /** Veil drawn over the sky in a blizzard. */
    storm: string;
  };
}

const dark: ThemeColors = {
  bg: "#0A1022",
  surface: "#131C36",
  surfaceSunken: "#0E1630",
  border: alpha("#DCE6FF", 0.1),
  track: "#1F2A4A",
  text: "#EEF2FF",
  textMuted: "#8A94B5",
  accent: "#FF5B45",
  accentSoft: alpha("#FF5B45", 0.16),
  onAccent: "#1D0703",
  sun: "#FFC857",
  sunText: "#FFC857",
  cold: "#5B9BFF",
  coldSoft: alpha("#5B9BFF", 0.14),
  blaze: { red: "#F0452F", yellow: "#F7B924", blue: "#2F6FE0" },
  scene: {
    skyTop: "#060A1C",
    skyBottom: "#22357A",
    orb: "#F4EFD8",
    star: "#FFFFFF",
    ridgeFar: "#2A3F86",
    ridgeMid: "#1B2A60",
    ridgeNear: "#111B42",
    snow: "#C8D6FA",
    cloud: alpha("#8FA6E8", 0.22),
    trail: alpha("#EEF2FF", 0.42),
    haze: "#3A4F9C",
    pine: "#060B1A",
    storm: alpha("#04060F", 0.5),
  },
};

const light: ThemeColors = {
  bg: "#F3F5F9",
  surface: "#FFFFFF",
  surfaceSunken: "#E7ECF3",
  border: alpha("#14213A", 0.1),
  track: "#DAE1EC",
  text: "#14213A",
  textMuted: "#5E6B85",
  accent: "#E2412B",
  accentSoft: alpha("#E2412B", 0.1),
  onAccent: "#FFFFFF",
  sun: "#F2B01E",
  sunText: "#A86C00",
  cold: "#2563D9",
  coldSoft: alpha("#2563D9", 0.09),
  blaze: { red: "#E2412B", yellow: "#F2B01E", blue: "#2563D9" },
  scene: {
    skyTop: "#7DB4EE",
    skyBottom: "#FCE6C4",
    orb: "#FFE08A",
    star: "#FFFFFF",
    ridgeFar: "#B9CDEC",
    ridgeMid: "#86A2D2",
    ridgeNear: "#4B689F",
    snow: "#FFFFFF",
    cloud: alpha("#FFFFFF", 0.75),
    trail: alpha("#14213A", 0.4),
    haze: "#DCE6F5",
    pine: "#2C4474",
    storm: alpha("#3C4E78", 0.55),
  },
};

export const palette: Record<Scheme, ThemeColors> = { dark, light };

/** Nim wears the same clothes day and night. */
export const nimColors = {
  coat: "#E8432D",
  coatShade: "#C2321F",
  scarf: "#F7B924",
  scarfShade: "#DB9A0C",
  fur: "#F6F8FC",
  face: "#FFDDBF",
  ink: "#15203C",
  pack: "#2F6FE0",
  cloak: "#1F4FB0",
  metal: "#C9D3E6",
  lamp: "#FFD772",
};

/** White plate every blaze is painted on, in both themes. */
export const blazePlate = "#F8FAFD";

export const shadows: Record<Scheme, { card: string; float: string }> = {
  dark: {
    card: "0px 8px 24px rgba(0,0,0,0.3)",
    float: "0px 12px 32px rgba(0,0,0,0.55)",
  },
  light: {
    card: "0px 6px 20px rgba(20,33,58,0.07)",
    float: "0px 10px 28px rgba(20,33,58,0.16)",
  },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

// Two families: Big Shoulders shouts the number, Instrument Sans explains it.
// Pick the weight through fontFamily, never fontWeight.
export const fonts = {
  displayBold: "BigShoulders_700Bold",
  displayBlack: "BigShoulders_900Black",
  regular: "InstrumentSans_400Regular",
  medium: "InstrumentSans_500Medium",
  semibold: "InstrumentSans_600SemiBold",
} as const;

export const type = {
  /** Altitude, camp numbers in big moments. */
  mega: { fontFamily: fonts.displayBlack, fontSize: 112, lineHeight: 104, letterSpacing: 0 },
  numeral: { fontFamily: fonts.displayBlack, fontSize: 72, lineHeight: 68, letterSpacing: 0 },
  title: { fontFamily: fonts.displayBlack, fontSize: 40, lineHeight: 40, letterSpacing: 0.2 },
  figure: { fontFamily: fonts.displayBold, fontSize: 30, lineHeight: 30, letterSpacing: 0.2 },
  heading: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
} as const;

export type TypeVariant = keyof typeof type;

// Motion: everything a finger causes uses one of these springs.
export const springs = {
  /** Fast, tight: press in / release. */
  press: { damping: 20, stiffness: 380, mass: 0.6 },
  /** Calm, no bounce: bars and indicators settling. */
  settle: { damping: 18, stiffness: 150, mass: 1 },
  /** Bouncy: a step climbed, Nim hopping, a flag unfurling. */
  burst: { damping: 9, stiffness: 190, mass: 0.9 },
} as const;

/** Layout constants shared across screens. */
export const layout = {
  maxWidth: 480,
  screenPadding: spacing.xl,
  tabBarHeight: 64,
  /** Bottom padding screens need so content clears the floating tab bar. */
  tabBarClearance: 64 + 12 + 28,
} as const;
