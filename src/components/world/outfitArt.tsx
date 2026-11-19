// Drawings for the outfit shop. Same 80x100 grid as Nim.
import { Circle, Ellipse, G, Line, Path, Rect } from "react-native-svg";

import { nimColors as n } from "@/theme/tokens";

type Paint = { main: string; shade: string };

const WOOD = "#8A5A33";
const GOLD = "#F7B924";
const GOLD_DARK = "#C98A0E";
const LEAF = "#5FA84A";

export const COAT_PAINT: Record<string, Paint> = {
  "coat-red": { main: n.coat, shade: n.coatShade },
  "coat-green": { main: "#4E8A3E", shade: "#3C6E2F" },
  "coat-blue": { main: "#3F7FD9", shade: "#2E63B3" },
  "coat-purple": { main: "#7B4FC9", shade: "#5E3BA3" },
  "coat-white": { main: "#E3E9F4", shade: "#BCC6D8" },
  "coat-black": { main: "#2E3650", shade: "#1F2538" },
};

export const SCARF_PAINT: Record<string, Paint> = {
  "scarf-yellow": { main: n.scarf, shade: n.scarfShade },
  "scarf-red": { main: "#E8432D", shade: "#C2321F" },
  "scarf-blue": { main: "#4A8BE8", shade: "#2E63B3" },
  "scarf-green": { main: "#5FA84A", shade: "#468A36" },
  "scarf-pink": { main: "#F28AB2", shade: "#D9668F" },
  "scarf-white": { main: "#F6F8FC", shade: "#CDD5E3" },
};

const CAPE_COLOR: Record<string, string> = {
  "cape-red": "#B92E1C",
  "cape-blue": "#2A5BAA",
  "cape-green": "#3A6A2D",
  "cape-purple": "#5A3799",
};

// some hats change the hood colour under them
export const HOOD_PAINT: Record<string, Paint | undefined> = {
  "ranger-hood": { main: "#4E7A3A", shade: "#3A5E2B" },
  "knight-helm": { main: "#C9D3E6", shade: "#98A4BB" },
};

// behind everything
export function BackLayer({ id }: { id: string }) {
  if (id === "wings") {
    const wing = (
      <>
        <Path
          d="M30 50 C16 38 3 40 3 54 C8 53 11 57 7 62 C13 62 16 65 13 70 C21 68 28 62 32 56 Z"
          fill="#F6F8FC"
          stroke="#CDD5E3"
          strokeWidth={1}
        />
        <Path d="M27 52 C18 47 10 48 8 54" stroke="#CDD5E3" strokeWidth={1} fill="none" />
      </>
    );
    return (
      <>
        {wing}
        <G transform="translate(80 0) scale(-1 1)">{wing}</G>
      </>
    );
  }
  const color = CAPE_COLOR[id];
  if (!color) return null;
  return (
    <>
      <Path d="M27 44 C12 58 8 80 11 94 L40 91 L40 44 Z" fill={color} />
      <Path d="M53 44 C68 58 72 80 69 94 L40 91 L40 44 Z" fill={color} />
      <Path d="M53 44 C68 58 72 80 69 94 L58 93 C62 78 60 60 53 44 Z" fill="#000" opacity={0.15} />
    </>
  );
}

// held in the left mitten, drawn before the arm so the mitten covers the grip
export function HandItem({ id }: { id: string }) {
  switch (id) {
    case "bow":
      return (
        <>
          <Line x1={19} y1={50} x2={19} y2={94} stroke="#F6F8FC" strokeWidth={0.8} />
          <Path d="M19 50 C8 60 8 84 19 94" stroke={WOOD} strokeWidth={2.8} strokeLinecap="round" fill="none" />
        </>
      );
    case "oak-staff":
      return (
        <>
          <Line x1={21} y1={95} x2={16} y2={36} stroke={WOOD} strokeWidth={3} strokeLinecap="round" />
          <Path d="M16 36 C12 32 12 28 15 26 C16 30 18 32 16 36 Z" fill={LEAF} />
          <Path d="M16 36 C20 31 22 29 25 30 C23 33 20 35 16 36 Z" fill={LEAF} />
          <Circle cx={15.5} cy={37} r={2.2} fill={WOOD} />
        </>
      );
    case "crystal-staff":
      return (
        <>
          <Line x1={21} y1={95} x2={16.5} y2={42} stroke={WOOD} strokeWidth={3} strokeLinecap="round" />
          <Circle cx={16.5} cy={35} r={8} fill="#A06BFF" opacity={0.22} />
          <Path d="M16.5 27 L21 35 L16.5 43 L12 35 Z" fill="#A06BFF" />
          <Path d="M16.5 27 L21 35 L16.5 35 Z" fill="#D6C2FF" />
        </>
      );
    case "sword":
      return (
        <>
          <Line x1={21} y1={68} x2={15} y2={40} stroke={n.metal} strokeWidth={3.4} strokeLinecap="round" />
          <Line x1={21} y1={68} x2={15} y2={40} stroke="#FFFFFF" strokeWidth={1} opacity={0.6} />
          <Line x1={16} y1={69} x2={26} y2={67} stroke={GOLD_DARK} strokeWidth={2.6} strokeLinecap="round" />
          <Line x1={21.3} y1={70} x2={22.5} y2={76} stroke={WOOD} strokeWidth={2.6} strokeLinecap="round" />
        </>
      );
    default:
      return null;
  }
}

// on top of the head, drawn last
export function HeadTop({ id }: { id: string }) {
  switch (id) {
    case "hood":
      return <Circle cx={40} cy={7} r={4.6} fill={n.fur} />;
    case "goggles":
      return (
        <>
          <Circle cx={40} cy={7} r={4.6} fill={n.fur} />
          <Rect x={19} y={14} width={42} height={4.5} rx={2.2} fill={WOOD} />
          <Circle cx={32} cy={16} r={5} fill={GOLD_DARK} />
          <Circle cx={32} cy={16} r={3.4} fill="#7FC4F5" />
          <Circle cx={48} cy={16} r={5} fill={GOLD_DARK} />
          <Circle cx={48} cy={16} r={3.4} fill="#7FC4F5" />
          <Circle cx={30.8} cy={14.8} r={1} fill="#FFFFFF" />
          <Circle cx={46.8} cy={14.8} r={1} fill="#FFFFFF" />
        </>
      );
    case "ranger-hood":
      return (
        <>
          <Path d="M32 10 C35 4 42 0 50 1 C47 4 46 8 47 12 Z" fill="#4E7A3A" />
          <Path d="M47 7 C51 3 56 3 58 5 C55 8 51 9 47 7 Z" fill={LEAF} />
        </>
      );
    case "wizard-hat":
      return (
        <>
          <Ellipse cx={40} cy={15} rx={27} ry={5.5} fill="#5E3BA3" />
          <Path d="M25 14 C30 9 34 3 40 1.5 C45 0.5 50 2 53 6 C50 5.5 47.5 6.5 46.5 8.5 L55 14 Z" fill="#7B4FC9" />
          <Rect x={26} y={10.5} width={28} height={3.6} fill={GOLD} />
          <Path d="M38 6 L39 8 L41 8 L39.5 9.3 L40 11.2 L38 10 L36 11.2 L36.5 9.3 L35 8 L37 8 Z" fill={GOLD} />
        </>
      );
    case "knight-helm":
      return (
        <>
          <Path d="M40 8 C40 2 46 -0.5 53 1.5 C47 3 44 5.5 44 9 Z" fill="#E8432D" />
          <Rect x={38.5} y={6} width={3} height={12} rx={1.5} fill="#98A4BB" />
          <Circle cx={24} cy={30} r={1.4} fill="#98A4BB" />
          <Circle cx={56} cy={30} r={1.4} fill="#98A4BB" />
        </>
      );
    case "flower-crown":
      return (
        <>
          <Path d="M22 15 C30 10 50 10 58 15" stroke={LEAF} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          {[
            [25, 14, "#F28AB2"],
            [32, 11.2, "#F6F8FC"],
            [40, 10.2, "#F28AB2"],
            [48, 11.2, "#F6F8FC"],
            [55, 14, "#F28AB2"],
          ].map(([x, y, color]) => (
            <G key={`${x}`}>
              <Circle cx={x as number} cy={y as number} r={3.2} fill={color as string} />
              <Circle cx={x as number} cy={y as number} r={1.2} fill={GOLD} />
            </G>
          ))}
        </>
      );
    case "antlers":
      return (
        <>
          <Path d="M31 12 L26 3 M27.5 6 L21 4.5 M29 9 L24 9.5" stroke={WOOD} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <Path d="M49 12 L54 3 M52.5 6 L59 4.5 M51 9 L56 9.5" stroke={WOOD} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          <Path d="M33 11 C35 7 38 7 40 9 C38 11 35 12 33 11 Z" fill={LEAF} />
          <Path d="M47 11 C45 7 42 7 40 9 C42 11 45 12 47 11 Z" fill={LEAF} />
        </>
      );
    case "summit-crown":
      return (
        <>
          <Path d="M28 14 L28 5 L33.5 9 L40 1.5 L46.5 9 L52 5 L52 14 Z" fill={GOLD} />
          <Path d="M40 1.5 L46.5 9 L52 5 L52 14 L40 14 Z" fill={GOLD_DARK} opacity={0.4} />
          <Circle cx={40} cy={10} r={1.8} fill="#E8432D" />
          <Circle cx={33} cy={11} r={1.3} fill="#4A8BE8" />
          <Circle cx={47} cy={11} r={1.3} fill="#4A8BE8" />
        </>
      );
    default:
      return null;
  }
}
