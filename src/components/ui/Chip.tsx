import { AppText } from "@/components/ui/AppText";
import { PressableScale } from "@/components/ui/PressableScale";
import { radius, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

type Props = { label: string; selected: boolean; onPress: () => void };

/** Single-choice pill used for small option sets. */
export function Chip({ label, selected, onPress }: Props) {
  const { c } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      contentStyle={{
        minHeight: 44,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        justifyContent: "center",
        borderWidth: 1,
        borderColor: selected ? c.accent : c.border,
        backgroundColor: selected ? c.accentSoft : "transparent",
      }}
    >
      <AppText variant="label" color={selected ? c.accent : c.textMuted}>
        {label}
      </AppText>
    </PressableScale>
  );
}
