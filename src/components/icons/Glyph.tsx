import Svg, { Path } from "react-native-svg";

// Original line icons on a 24×24 grid. One stroke weight, round joins.
const PATHS = {
  // navigation
  peak: "M3 19 L10 7 L13.5 13 L16 10 L21 19 Z",
  signpost:
    "M12 3 L12 21 M12 5.5 L18 5.5 L20.5 8 L18 10.5 L12 10.5 M12 12.5 L6 12.5 L3.5 15 L6 17.5 L12 17.5",
  log: "M5 19 L5 14 M10 19 L10 10 M15 19 L15 13 M20 19 L20 6",
  // status
  flame: "M12 3 C12 7 17 9 17 14 A5 5 0 0 1 7 14 C7 11.5 9 10.5 9.5 8 C10.5 9 11.5 8 12 3 Z",
  flag: "M6 21 L6 4 M6 4.5 L17 7.5 L6 11",
  tent: "M3 19 L12 5 L21 19 Z M12 19 L12 13",
  snow: "M12 3 L12 21 M4.2 7.5 L19.8 16.5 M19.8 7.5 L4.2 16.5",
  wind: "M3 9 H14 A2.5 2.5 0 1 0 11.5 6.5 M3 14 H18 A2.5 2.5 0 1 1 15.5 16.5",
  check: "M5 12.5 L10 17.5 L19 7",
  plus: "M12 5 V19 M5 12 H19",
  // attributes
  vigor: "M5 13 L12 6 L19 13 M5 19 L12 12 L19 19",
  focus: "M12 4 A8 8 0 1 0 12 20 A8 8 0 1 0 12 4 Z M12 10 A2 2 0 1 0 12 14 A2 2 0 1 0 12 10 Z",
  craft: "M12 3 L14 10 L21 12 L14 14 L12 21 L10 14 L3 12 L10 10 Z",
  calm: "M18 14.5 A7.5 7.5 0 1 1 9.5 6 A6 6 0 0 0 18 14.5 Z",
  // gear
  scarf: "M6 8 C6 4.5 18 4.5 18 8 C18 11.5 6 11.5 6 8 Z M10 10.4 L8.2 20 L13.4 18 L13 10.6",
  lantern: "M9 4 H15 M12 4 V7 M8 7 H16 V18 H8 Z M7 20 H17",
  axe: "M7 21 L15 5 M12 5 L19 4 L18 9 L14.5 7.5",
  cloak: "M12 4 L5 20 H19 Z M9.5 9 H14.5",
  pennant: "M6 21 V3 M6 4 L19 8 L6 12",
} as const;

export type GlyphName = keyof typeof PATHS;

type Props = { name: GlyphName; size?: number; color: string; strokeWidth?: number };

export function Glyph({ name, size = 20, color, strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={PATHS[name]}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
