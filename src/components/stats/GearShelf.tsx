import { View } from "react-native";

import { Glyph, type GlyphName } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { GEAR, type GearTier } from "@/game/gear";
import { useTheme } from "@/theme/useTheme";

const ICON: Record<GearTier, GlyphName> = { 1: "scarf", 2: "lantern", 3: "axe", 4: "cloak", 5: "pennant" };
const TOKEN = 54;

/** Rewards: gear Nim has earned, and what waits at higher camps. */
export function GearShelf({ level }: { level: number }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      {GEAR.map((gear) => {
        const owned = level >= gear.camp;
        return (
          <View
            key={gear.tier}
            accessible
            accessibilityLabel={owned ? `${gear.name}, earned` : `${gear.name}, unlocks at camp ${gear.camp}`}
            style={{ alignItems: "center", width: TOKEN + 10 }}
          >
            <GearToken tier={gear.tier} owned={owned} />
            <AppText
              variant="caption"
              color={owned ? c.text : c.textMuted}
              numberOfLines={2}
              style={{ marginTop: 6, textAlign: "center" }}
            >
              {owned ? gear.name : `Camp ${gear.camp}`}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

/** One piece of gear as a round token: gold ring when earned, dashed when still locked. */
export function GearToken({ tier, owned, size = TOKEN }: { tier: GearTier; owned: boolean; size?: number }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: owned ? c.surface : "transparent",
        borderWidth: 2,
        borderColor: owned ? c.sun : c.track,
        borderStyle: owned ? "solid" : "dashed",
      }}
    >
      <Glyph name={ICON[tier]} size={size * 0.46} color={owned ? c.text : c.textMuted} />
    </View>
  );
}
