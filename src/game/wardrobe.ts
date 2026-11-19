import { OUTFIT_DISCOUNT } from "@/game/rules";

export type Slot = "head" | "coat" | "scarf" | "cape" | "hand";

// what nim is wearing: one item id per slot
export type Look = Record<Slot, string>;

export interface WardrobeItem {
  id: string;
  slot: Slot;
  name: string;
  price: number;
  // camp you need to reach before you can buy it
  camp?: number;
}

export interface Outfit {
  id: string;
  name: string;
  description: string;
  items: string[];
}

export const SLOTS: { slot: Slot; label: string }[] = [
  { slot: "head", label: "Head" },
  { slot: "coat", label: "Coat" },
  { slot: "scarf", label: "Scarf" },
  { slot: "cape", label: "Back" },
  { slot: "hand", label: "Hand" },
];

// price 0 = everyone has it from the start
export const ITEMS: WardrobeItem[] = [
  { id: "hood", slot: "head", name: "Pom-pom hood", price: 0 },
  { id: "flower-crown", slot: "head", name: "Flower crown", price: 120 },
  { id: "goggles", slot: "head", name: "Aviator goggles", price: 140 },
  { id: "ranger-hood", slot: "head", name: "Ranger hood", price: 150 },
  { id: "wizard-hat", slot: "head", name: "Wizard hat", price: 200 },
  { id: "antlers", slot: "head", name: "Antler crown", price: 220, camp: 8 },
  { id: "knight-helm", slot: "head", name: "Knight helm", price: 250, camp: 5 },
  { id: "summit-crown", slot: "head", name: "Summit crown", price: 600, camp: 25 },

  { id: "coat-red", slot: "coat", name: "Ember red", price: 0 },
  { id: "coat-green", slot: "coat", name: "Forest green", price: 60 },
  { id: "coat-blue", slot: "coat", name: "Glacier blue", price: 60 },
  { id: "coat-purple", slot: "coat", name: "Twilight purple", price: 80 },
  { id: "coat-white", slot: "coat", name: "Snow white", price: 80 },
  { id: "coat-black", slot: "coat", name: "Night black", price: 100 },

  { id: "scarf-yellow", slot: "scarf", name: "Sun yellow", price: 0 },
  { id: "scarf-red", slot: "scarf", name: "Berry red", price: 40 },
  { id: "scarf-blue", slot: "scarf", name: "Lake blue", price: 40 },
  { id: "scarf-green", slot: "scarf", name: "Moss green", price: 40 },
  { id: "scarf-pink", slot: "scarf", name: "Blossom pink", price: 40 },
  { id: "scarf-white", slot: "scarf", name: "Snow white", price: 50 },

  { id: "cape-none", slot: "cape", name: "Nothing", price: 0 },
  { id: "cape-red", slot: "cape", name: "Red cape", price: 100 },
  { id: "cape-blue", slot: "cape", name: "Blue cape", price: 100 },
  { id: "cape-green", slot: "cape", name: "Green cape", price: 100 },
  { id: "cape-purple", slot: "cape", name: "Purple cape", price: 120 },
  { id: "wings", slot: "cape", name: "Feather wings", price: 450, camp: 15 },

  { id: "hand-none", slot: "hand", name: "Nothing", price: 0 },
  { id: "bow", slot: "hand", name: "Hunter's bow", price: 160 },
  { id: "oak-staff", slot: "hand", name: "Oak staff", price: 150 },
  { id: "crystal-staff", slot: "hand", name: "Crystal staff", price: 180 },
  { id: "sword", slot: "hand", name: "Trail sword", price: 180, camp: 5 },
];

export const OUTFITS: Outfit[] = [
  {
    id: "ranger",
    name: "Ranger",
    description: "Hood up, bow ready",
    items: ["ranger-hood", "coat-green", "scarf-yellow", "cape-none", "bow"],
  },
  {
    id: "mage",
    name: "Mage",
    description: "For the long study nights",
    items: ["wizard-hat", "coat-purple", "scarf-yellow", "cape-purple", "crystal-staff"],
  },
  {
    id: "knight",
    name: "Knight",
    description: "Shining on the ridge",
    items: ["knight-helm", "coat-white", "scarf-red", "cape-blue", "sword"],
  },
  {
    id: "druid",
    name: "Druid",
    description: "Friend of every pine",
    items: ["antlers", "coat-green", "scarf-green", "cape-green", "oak-staff"],
  },
];

export const DEFAULT_LOOK: Look = {
  head: "hood",
  coat: "coat-red",
  scarf: "scarf-yellow",
  cape: "cape-none",
  hand: "hand-none",
};

const byId = new Map(ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): WardrobeItem | undefined {
  return byId.get(id);
}

export function itemsFor(slot: Slot): WardrobeItem[] {
  return ITEMS.filter((i) => i.slot === slot);
}

export function isOwned(id: string, owned: Record<string, number>): boolean {
  return getItem(id)?.price === 0 || id in owned;
}

// price per piece when bought as part of an outfit
export function outfitPiecePrice(item: WardrobeItem): number {
  return Math.round((item.price * OUTFIT_DISCOUNT) / 5) * 5;
}

// pieces you still need to buy, and what they cost together
export function outfitCost(outfit: Outfit, owned: Record<string, number>) {
  const missing = outfit.items
    .map((id) => getItem(id))
    .filter((i): i is WardrobeItem => !!i && !isOwned(i.id, owned));
  return { missing, price: missing.reduce((sum, i) => sum + outfitPiecePrice(i), 0) };
}

export function outfitCamp(outfit: Outfit): number {
  return Math.max(1, ...outfit.items.map((id) => getItem(id)?.camp ?? 1));
}

export function lookWithOutfit(look: Look, outfit: Outfit): Look {
  const next = { ...look };
  for (const id of outfit.items) {
    const item = getItem(id);
    if (item) next[item.slot] = id;
  }
  return next;
}

export function isWearingOutfit(look: Look, outfit: Outfit): boolean {
  return outfit.items.every((id) => {
    const item = getItem(id);
    return item ? look[item.slot] === id : true;
  });
}

// makes sure a saved look only uses known items
export function sanitizeLook(value: unknown): Look {
  const look = { ...DEFAULT_LOOK };
  if (value && typeof value === "object") {
    for (const { slot } of SLOTS) {
      const id = (value as Record<string, unknown>)[slot];
      if (typeof id === "string" && getItem(id)?.slot === slot) look[slot] = id;
    }
  }
  return look;
}
