import { useEffect, useId, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, Line, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { Nim } from "@/components/world/Nim";
import type { GearTier } from "@/game/gear";
import type { Look } from "@/game/wardrobe";
import { nimColors } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

const W = 300;
const H = 170;
const GROUND = 150;
const NIM = 72;

type Props = { width: number; tier: GearTier; look: Look; cold?: boolean };

// morning camp: nim stepping out of the tent
export function TentScene({ width, tier, look, cold = false }: Props) {
  const { c } = useTheme();
  const s = c.scene;
  const k = width / W;
  const sky = `tentsky${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [hop, setHop] = useState(0);

  // a little stretch after waking up
  useEffect(() => {
    const t = setTimeout(() => setHop(1), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ width, height: H * k }}>
      <Svg width={width} height={H * k} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <LinearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.skyTop} />
            <Stop offset="0.9" stopColor={s.skyBottom} />
          </LinearGradient>
        </Defs>
        <Rect width={W} height={H} fill={`url(#${sky})`} />

        {/* sun coming up behind the ridge */}
        <Circle cx={238} cy={112} r={36} fill={s.orb} opacity={0.12} />
        <Circle cx={238} cy={112} r={20} fill={s.orb} />
        <Path d="M0 120 L50 92 L92 110 L150 78 L205 104 L250 88 L300 108 L300 170 L0 170 Z" fill={s.ridgeMid} />
        <Path d="M0 138 L40 124 L95 134 L160 120 L220 132 L300 122 L300 170 L0 170 Z" fill={s.ridgeNear} />

        {/* pines */}
        <Path d="M30 150 L42 112 L54 150 Z" fill={s.pine} />
        <Path d="M262 150 L274 118 L286 150 Z" fill={s.pine} />
        <Path d="M246 150 L254 128 L262 150 Z" fill={s.pine} />

        <Path d={`M0 ${GROUND} L${W} ${GROUND} L${W} ${H} L0 ${H} Z`} fill={c.bg} />

        {/* guy lines */}
        <Line x1={150} y1={52} x2={66} y2={GROUND} stroke={c.textMuted} strokeWidth={0.8} opacity={0.6} />
        <Line x1={150} y1={52} x2={234} y2={GROUND} stroke={c.textMuted} strokeWidth={0.8} opacity={0.6} />

        {/* tent */}
        <Path d={`M84 ${GROUND} L150 50 L216 ${GROUND} Z`} fill={nimColors.scarf} />
        <Path d={`M150 50 L216 ${GROUND} L150 ${GROUND} Z`} fill={nimColors.scarfShade} />
        <Path d={`M122 ${GROUND} L150 90 L178 ${GROUND} Z`} fill={nimColors.ink} />
        {/* door flaps tied back */}
        <Path d={`M150 90 L122 ${GROUND} L110 ${GROUND} Z`} fill={nimColors.scarfShade} />
        <Path d={`M150 90 L178 ${GROUND} L190 ${GROUND} Z`} fill={nimColors.scarf} />
        <Line x1={150} y1={50} x2={150} y2={40} stroke={nimColors.ink} strokeWidth={1.4} />
        <Path d="M150 40 L160 43 L150 46 Z" fill={c.accent} />
      </Svg>

      <View style={{ position: "absolute", left: (150 - NIM * 0.4) * k, top: (GROUND - NIM * 0.96) * k }}>
        <Nim tier={tier} size={NIM * k} look={look} hop={hop} cold={cold} />
      </View>
    </View>
  );
}
