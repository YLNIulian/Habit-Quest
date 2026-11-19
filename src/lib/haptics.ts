import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Haptics never block or throw into the UI; web is a silent no-op.
function run(fire: () => Promise<void>) {
  if (Platform.OS === "web") return;
  fire().catch(() => {});
}

export const haptic = {
  /** Picking between options. */
  select: () => run(() => Haptics.selectionAsync()),
  /** Undoing, dismissing. */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** A step climbed. */
  step: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Arriving at a camp. */
  heavy: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
