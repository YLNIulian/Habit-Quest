import { useJourney } from "@/hooks/useJourney";
import { useUi } from "@/store/ui";
import { useWardrobeStore } from "@/store/useWardrobeStore";

// coins you can spend right now
export function useCoins(): { balance: number; earned: number; spent: number } {
  const { coinsEarned } = useJourney();
  const devBonusCoins = useUi((s) => s.devBonusCoins);
  const owned = useWardrobeStore((s) => s.owned);
  const spent = Object.values(owned).reduce((sum, price) => sum + price, 0);
  const earned = coinsEarned + devBonusCoins;
  return { balance: earned - spent, earned, spent };
}
