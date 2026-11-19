import { usePathname } from "expo-router";
import { TabList, TabSlot, TabTrigger, Tabs } from "expo-router/ui";
import { useState } from "react";

import { TabButton, TabIndicator, useTabBarMetrics } from "@/components/TabBar";

const TABS = [
  { name: "index", href: "/", label: "Today", icon: "peak" },
  { name: "habits", href: "/habits", label: "Habits", icon: "signpost" },
  { name: "outfit", href: "/outfit", label: "Outfit", icon: "scarf" },
  { name: "stats", href: "/stats", label: "Stats", icon: "log" },
] as const;

// below this width a tab can't fit icon + label
const COMPACT_TAB = 96;

export default function TabsLayout() {
  const pathname = usePathname();
  const { barStyle, itemWidth } = useTabBarMetrics(TABS.length);

  // Remember the last tab so the indicator stays put while a modal is open.
  const [active, setActive] = useState(0);
  const current = TABS.findIndex((t) => t.href === pathname);
  if (current !== -1 && current !== active) setActive(current);

  return (
    <Tabs>
      <TabSlot />
      <TabList style={barStyle}>
        <TabIndicator index={active} itemWidth={itemWidth} />
        {TABS.map((tab) => (
          <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
            <TabButton icon={tab.icon} label={tab.label} compact={itemWidth < COMPACT_TAB} />
          </TabTrigger>
        ))}
      </TabList>
    </Tabs>
  );
}
