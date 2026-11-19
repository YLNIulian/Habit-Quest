import { useState } from "react";
import { View, useWindowDimensions } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { CoinBadge } from "@/components/wardrobe/CoinBadge";
import { ItemCard, type CardStatus } from "@/components/wardrobe/ItemCard";
import { Contours } from "@/components/world/Contours";
import { Nim } from "@/components/world/Nim";
import { tierForLevel } from "@/game/gear";
import {
  COINS_DAILY_QUEST,
  COINS_PER_CAMP,
  COINS_PER_HABIT,
  COINS_STREAK_WEEK,
  COINS_WEEKLY_QUEST,
} from "@/game/rules";
import {
  OUTFITS,
  SLOTS,
  getItem,
  isOwned,
  isWearingOutfit,
  itemsFor,
  lookWithOutfit,
  outfitCamp,
  outfitCost,
  type Look,
  type Outfit,
  type Slot,
  type WardrobeItem,
} from "@/game/wardrobe";
import { useCoins } from "@/hooks/useCoins";
import { useJourney } from "@/hooks/useJourney";
import { haptic } from "@/lib/haptics";
import { useWardrobeStore } from "@/store/useWardrobeStore";
import { layout, radius, spacing } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";

type Tab = "outfits" | Slot;
type Selection = { kind: "item"; id: string } | { kind: "outfit"; id: string } | null;

const GAP = spacing.sm;

export default function OutfitScreen() {
  const { c } = useTheme();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, layout.maxWidth) - layout.screenPadding * 2;

  const { player } = useJourney();
  const { balance } = useCoins();
  const owned = useWardrobeStore((s) => s.owned);
  const look = useWardrobeStore((s) => s.look);
  const buyItem = useWardrobeStore((s) => s.buyItem);
  const buyOutfit = useWardrobeStore((s) => s.buyOutfit);
  const equip = useWardrobeStore((s) => s.equip);
  const wearOutfit = useWardrobeStore((s) => s.wearOutfit);

  const [tab, setTab] = useState<Tab>("outfits");
  const [selection, setSelection] = useState<Selection>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tier = tierForLevel(player.level);
  const camp = player.level;

  const selectedItem = selection?.kind === "item" ? getItem(selection.id) : undefined;
  const selectedOutfit = selection?.kind === "outfit" ? OUTFITS.find((o) => o.id === selection.id) : undefined;

  // what the big nim shows: current look + whatever is being tried on
  const preview: Look = selectedItem
    ? { ...look, [selectedItem.slot]: selectedItem.id }
    : selectedOutfit
      ? lookWithOutfit(look, selectedOutfit)
      : look;

  const select = (next: Selection) => {
    haptic.select();
    setMessage(null);
    setSelection(next);
  };

  const run = async (action: () => Promise<string>) => {
    setBusy(true);
    const result = await action();
    setBusy(false);
    if (result === "ok") {
      haptic.success();
      setSelection(null);
      setMessage(null);
    } else {
      haptic.tap();
      setMessage(
        result === "too-poor"
          ? "Not enough coins yet."
          : result === "locked"
            ? "Climb a bit higher to unlock this."
            : "Something went wrong, try again.",
      );
    }
  };

  const itemStatus = (item: WardrobeItem): CardStatus => {
    if (isOwned(item.id, owned)) return look[item.slot] === item.id ? { kind: "wearing" } : { kind: "owned" };
    if ((item.camp ?? 1) > camp) return { kind: "locked", camp: item.camp ?? 1 };
    return { kind: "price", price: item.price };
  };

  const outfitStatus = (outfit: Outfit): CardStatus => {
    const { price } = outfitCost(outfit, owned);
    if (price === 0) return isWearingOutfit(look, outfit) ? { kind: "wearing" } : { kind: "owned" };
    const need = outfitCamp(outfit);
    if (need > camp) return { kind: "locked", camp: need };
    return { kind: "price", price };
  };

  const columns = tab === "outfits" ? 2 : 3;
  const cardWidth = (contentWidth - GAP * (columns - 1)) / columns;

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
        <View>
          <AppText variant="title">Outfit</AppText>
          <AppText variant="label" color={c.textMuted} style={{ marginTop: 2 }}>
            Dress Nim for the climb
          </AppText>
        </View>
        <CoinBadge amount={balance} />
      </View>

      {/* Fitting room */}
      <View
        style={{
          marginTop: spacing.lg,
          height: 240,
          borderRadius: radius.lg,
          backgroundColor: c.surface,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: spacing.lg,
        }}
      >
        <Contours size={320} color={c.border} style={{ position: "absolute", left: -90, top: -110 }} />
        <View style={{ position: "absolute", bottom: spacing.lg - 2, width: 120, height: 14, borderRadius: 7, backgroundColor: c.track }} />
        <Nim tier={tier} size={190} look={preview} />
      </View>

      <ActionBar
        item={selectedItem}
        outfit={selectedOutfit}
        status={selectedItem ? itemStatus(selectedItem) : selectedOutfit ? outfitStatus(selectedOutfit) : null}
        balance={balance}
        busy={busy}
        onBuy={() =>
          run(() =>
            selectedItem
              ? buyItem(selectedItem.id, balance, camp)
              : selectedOutfit
                ? buyOutfit(selectedOutfit, balance, camp)
                : Promise.resolve("ok"),
          )
        }
        onWear={() => {
          if (selectedItem) equip(selectedItem.slot, selectedItem.id);
          if (selectedOutfit) wearOutfit(selectedOutfit);
          haptic.success();
          setSelection(null);
        }}
        onCancel={() => select(null)}
      />
      {message && (
        <AppText variant="caption" color={c.accent} style={{ marginTop: spacing.sm, textAlign: "center" }}>
          {message}
        </AppText>
      )}

      <View
        accessibilityRole="tablist"
        style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.xl }}
      >
        <Chip label="Outfits" selected={tab === "outfits"} onPress={() => setTab("outfits")} />
        {SLOTS.map(({ slot, label }) => (
          <Chip key={slot} label={label} selected={tab === slot} onPress={() => setTab(slot)} />
        ))}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP, marginTop: spacing.lg }}>
        {tab === "outfits"
          ? OUTFITS.map((outfit) => (
              <ItemCard
                key={outfit.id}
                name={outfit.name}
                subtitle={outfit.description}
                look={lookWithOutfit(look, outfit)}
                tier={tier}
                status={outfitStatus(outfit)}
                selected={selectedOutfit?.id === outfit.id}
                width={cardWidth}
                nimSize={110}
                onPress={() => select({ kind: "outfit", id: outfit.id })}
              />
            ))
          : itemsFor(tab).map((item) => (
              <ItemCard
                key={item.id}
                name={item.name}
                look={{ ...look, [item.slot]: item.id }}
                tier={tier}
                status={itemStatus(item)}
                selected={selectedItem?.id === item.id}
                width={cardWidth}
                onPress={() => select({ kind: "item", id: item.id })}
              />
            ))}
      </View>

      <View style={{ marginTop: spacing.xxl, gap: 4 }}>
        <AppText variant="heading">Earning coins</AppText>
        <AppText variant="label" color={c.textMuted}>
          {COINS_PER_HABIT} for every habit you finish, {COINS_DAILY_QUEST} more when the whole day is done,{" "}
          {COINS_WEEKLY_QUEST} for the weekly expedition, {COINS_STREAK_WEEK} for every 7 days in a row and{" "}
          {COINS_PER_CAMP} for each new camp.
        </AppText>
      </View>
    </Screen>
  );
}

type ActionBarProps = {
  item?: WardrobeItem;
  outfit?: Outfit;
  status: CardStatus | null;
  balance: number;
  busy: boolean;
  onBuy: () => void;
  onWear: () => void;
  onCancel: () => void;
};

function ActionBar({ item, outfit, status, balance, busy, onBuy, onWear, onCancel }: ActionBarProps) {
  const { c } = useTheme();
  const name = item?.name ?? outfit?.name;

  if (!status || !name) {
    return (
      <AppText variant="label" color={c.textMuted} style={{ marginTop: spacing.md, textAlign: "center" }}>
        Tap anything below to try it on.
      </AppText>
    );
  }

  let main: React.ReactNode;
  if (status.kind === "wearing") {
    main = (
      <AppText variant="label" color={c.textMuted} style={{ flex: 1, textAlign: "center" }}>
        Nim is already wearing this
      </AppText>
    );
  } else if (status.kind === "owned") {
    main = <Button label="Wear it" onPress={onWear} style={{ flex: 1 }} />;
  } else if (status.kind === "locked") {
    main = (
      <AppText variant="label" color={c.textMuted} style={{ flex: 1, textAlign: "center" }}>
        Unlocks at camp {status.camp}
      </AppText>
    );
  } else if (status.price > balance) {
    main = (
      <AppText variant="label" color={c.textMuted} style={{ flex: 1, textAlign: "center" }}>
        {status.price - balance} more coins needed
      </AppText>
    );
  } else {
    main = (
      <Button
        label={busy ? "Buying..." : `Buy for ${status.price}`}
        onPress={() => {
          if (!busy) onBuy();
        }}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <View style={{ marginTop: spacing.md }}>
      <AppText variant="heading" style={{ textAlign: "center" }}>
        {name}
      </AppText>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.sm, minHeight: 52 }}>
        <Button label="Cancel" variant="ghost" onPress={onCancel} />
        {main}
      </View>
    </View>
  );
}
