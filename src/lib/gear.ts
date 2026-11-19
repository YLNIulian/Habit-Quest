// Nim's gear is the visible reward for reaching camps.
export type GearTier = 1 | 2 | 3 | 4 | 5;

export const GEAR: { tier: GearTier; camp: number; name: string }[] = [
  { tier: 1, camp: 1, name: "Scarf" },
  { tier: 2, camp: 5, name: "Lantern" },
  { tier: 3, camp: 10, name: "Ice axe" },
  { tier: 4, camp: 20, name: "Storm cloak" },
  { tier: 5, camp: 30, name: "Summit pennant" },
];

export const GEAR_CAMPS = GEAR.map((g) => g.camp);

export function tierForLevel(level: number): GearTier {
  let tier: GearTier = 1;
  for (const g of GEAR) if (level >= g.camp) tier = g.tier;
  return tier;
}

/** Gear unlocked exactly at this camp, if any. */
export function gearUnlockedAt(level: number) {
  return GEAR.find((g) => g.camp === level);
}
