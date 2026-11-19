import { create } from "zustand";

import * as wardrobeRepo from "@/database/repositories/wardrobeRepository";
import {
  DEFAULT_LOOK,
  getItem,
  isOwned,
  lookWithOutfit,
  outfitCamp,
  outfitCost,
  outfitPiecePrice,
  type Look,
  type Outfit,
  type Slot,
} from "@/game/wardrobe";

export type BuyResult = "ok" | "too-poor" | "locked" | "error";

interface WardrobeState {
  owned: Record<string, number>;
  look: Look;

  load: () => Promise<void>;
  // balance and camp are passed in so the store doesn't depend on the game state
  buyItem: (id: string, balance: number, camp: number) => Promise<BuyResult>;
  buyOutfit: (outfit: Outfit, balance: number, camp: number) => Promise<BuyResult>;
  equip: (slot: Slot, id: string) => void;
  wearOutfit: (outfit: Outfit) => void;
  reset: () => Promise<void>;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => {
  const setLook = (look: Look) => {
    set({ look });
    wardrobeRepo.saveLook(look).catch(() => {});
  };

  return {
    owned: {},
    look: DEFAULT_LOOK,

    load: async () => {
      const [owned, look] = await Promise.all([wardrobeRepo.fetchPurchases(), wardrobeRepo.fetchLook()]);
      // only keep things that are actually owned
      const safe = { ...look };
      for (const slot of Object.keys(safe) as Slot[]) {
        if (!isOwned(safe[slot], owned)) safe[slot] = DEFAULT_LOOK[slot];
      }
      set({ owned, look: safe });
    },

    buyItem: async (id, balance, camp) => {
      const item = getItem(id);
      if (!item || isOwned(id, get().owned)) return "ok";
      if ((item.camp ?? 1) > camp) return "locked";
      if (item.price > balance) return "too-poor";
      try {
        await wardrobeRepo.insertPurchases([{ id, price: item.price }]);
      } catch {
        return "error";
      }
      set((s) => ({ owned: { ...s.owned, [id]: item.price } }));
      setLook({ ...get().look, [item.slot]: id });
      return "ok";
    },

    buyOutfit: async (outfit, balance, camp) => {
      if (outfitCamp(outfit) > camp) return "locked";
      const { missing, price } = outfitCost(outfit, get().owned);
      if (price > balance) return "too-poor";
      const rows = missing.map((i) => ({ id: i.id, price: outfitPiecePrice(i) }));
      try {
        if (rows.length > 0) await wardrobeRepo.insertPurchases(rows);
      } catch {
        return "error";
      }
      set((s) => ({ owned: { ...s.owned, ...Object.fromEntries(rows.map((r) => [r.id, r.price])) } }));
      setLook(lookWithOutfit(get().look, outfit));
      return "ok";
    },

    equip: (slot, id) => {
      if (!isOwned(id, get().owned) || getItem(id)?.slot !== slot) return;
      setLook({ ...get().look, [slot]: id });
    },

    wearOutfit: (outfit) => {
      if (!outfit.items.every((id) => isOwned(id, get().owned))) return;
      setLook(lookWithOutfit(get().look, outfit));
    },

    reset: async () => {
      await wardrobeRepo.clearPurchases();
      setLook(DEFAULT_LOOK);
      set({ owned: {} });
    },
  };
});
