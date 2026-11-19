import { View } from "react-native";

import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { PressableScale } from "@/components/ui/PressableScale";
import { CoinBadge } from "@/components/wardrobe/CoinBadge";
import { Nim } from "@/components/world/Nim";
import type { GearTier } from "@/game/gear";
import type { Look } from "@/game/wardrobe";
import { radius, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

export type CardStatus =
  | { kind: "wearing" }
  | { kind: "owned" }
  | { kind: "price"; price: number }
  | { kind: "locked"; camp: number };

type Props = {
  name: string;
  subtitle?: string;
  look: Look;
  tier: GearTier;
  status: CardStatus;
  selected: boolean;
  width: number;
  nimSize?: number;
  onPress: () => void;
};

export function ItemCard({ name, subtitle, look, tier, status, selected, width, nimSize = 100, onPress }: Props) {
  const { c } = useTheme();
  const locked = status.kind === "locked";

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${name}, ${statusLabel(status)}`}
      style={{ width }}
      contentStyle={{
        alignItems: "center",
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: c.surface,
        borderWidth: 2,
        borderColor: selected ? c.accent : "transparent",
      }}
    >
      <View style={{ opacity: locked ? 0.45 : 1 }}>
        <Nim tier={tier} size={nimSize} look={look} still />
      </View>
      <AppText variant="label" numberOfLines={1} style={{ marginTop: spacing.xs, textAlign: "center" }}>
        {name}
      </AppText>
      {subtitle && (
        <AppText variant="caption" color={c.textMuted} numberOfLines={1} style={{ textAlign: "center" }}>
          {subtitle}
        </AppText>
      )}
      <View style={{ marginTop: 4, minHeight: 20, justifyContent: "center" }}>
        <StatusRow status={status} />
      </View>
    </PressableScale>
  );
}

function StatusRow({ status }: { status: CardStatus }) {
  const { c } = useTheme();
  switch (status.kind) {
    case "price":
      return <CoinBadge amount={status.price} size="sm" />;
    case "locked":
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Glyph name="lock" size={12} color={c.textMuted} strokeWidth={2.2} />
          <AppText variant="caption" color={c.textMuted}>
            Camp {status.camp}
          </AppText>
        </View>
      );
    case "wearing":
      return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
          <Glyph name="check" size={13} color={c.accent} strokeWidth={2.6} />
          <AppText variant="caption" color={c.accent}>
            Wearing
          </AppText>
        </View>
      );
    case "owned":
      return (
        <AppText variant="caption" color={c.textMuted}>
          Owned
        </AppText>
      );
  }
}

function statusLabel(status: CardStatus): string {
  switch (status.kind) {
    case "price":
      return `${status.price} coins`;
    case "locked":
      return `unlocks at camp ${status.camp}`;
    case "wearing":
      return "wearing";
    case "owned":
      return "owned";
  }
}
