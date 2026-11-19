import { router, useLocalSearchParams } from "expo-router";
import { useState, type ReactNode } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BLAZE_COLORS, BLAZE_SHAPES, Blaze } from "@/components/blaze/Blaze";
import { Glyph } from "@/components/icons/Glyph";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PressableScale } from "@/components/ui/PressableScale";
import { HABITS } from "@/data/mock";
import {
  ATTRIBUTES,
  ATTRIBUTE_HINT,
  ATTRIBUTE_LABEL,
  WEEKDAY_INITIAL,
  WEEKDAY_SHORT,
} from "@/lib/habits";
import { haptic } from "@/lib/haptics";
import { layout, radius, spacing, type as typeScale } from "@/theme/tokens";
import { useTheme } from "@/theme/useTheme";
import type { Attribute, BlazeColor, BlazeShape, Weekday } from "@/types";

const WEEKDAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
const COLOR_NAME: Record<BlazeColor, string> = { red: "Red", yellow: "Yellow", blue: "Blue" };

// UI only: nothing is saved yet. "Save habit" just closes the sheet.
export default function HabitFormScreen() {
  const { c, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = HABITS.find((h) => h.id === id);

  const [name, setName] = useState(editing?.name ?? "");
  const [shape, setShape] = useState<BlazeShape>(editing?.shape ?? "band");
  const [color, setColor] = useState<BlazeColor>(editing?.color ?? "red");
  const [attribute, setAttribute] = useState<Attribute>(editing?.attribute ?? "vigor");
  const [daily, setDaily] = useState(editing ? editing.frequency.kind === "daily" : true);
  const [days, setDays] = useState<Weekday[]>(
    editing?.frequency.kind === "weekly" ? editing.frequency.days : [0, 2, 4],
  );

  const pick = <T,>(set: (value: T) => void, value: T) => {
    haptic.select();
    set(value);
  };
  const toggleDay = (day: Weekday) => {
    haptic.select();
    setDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day]));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        width: "100%",
        maxWidth: layout.maxWidth,
        alignSelf: "center",
        padding: layout.screenPadding,
        paddingBottom: insets.bottom + spacing.xxl,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <AppText variant="title">{editing ? "Edit habit" : "New habit"}</AppText>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          hitSlop={12}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <AppText variant="label" color={c.textMuted}>
            Cancel
          </AppText>
        </Pressable>
      </View>

      {/* Live preview: the marker as it will appear on the route. */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg, marginTop: spacing.xl }}>
        <Blaze
          shape={shape}
          color={color}
          size={84}
          style={{ transform: [{ rotate: "-4deg" }], boxShadow: shadow.card }}
        />
        <View style={{ flex: 1 }}>
          <AppText variant="heading" numberOfLines={2}>
            {name.trim() || "Your new habit"}
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Glyph name={attribute} size={14} color={c.textMuted} strokeWidth={2.2} />
            <AppText variant="label" color={c.textMuted}>
              Trains {ATTRIBUTE_LABEL[attribute]}
            </AppText>
          </View>
        </View>
      </View>

      <Field label="Name">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Drink water"
          placeholderTextColor={c.textMuted}
          selectionColor={c.accent}
          returnKeyType="done"
          accessibilityLabel="Habit name"
          style={[
            typeScale.body,
            {
              // lineHeight clips text inside inputs on iOS.
              lineHeight: undefined,
              color: c.text,
              backgroundColor: c.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: c.border,
              paddingHorizontal: spacing.lg,
              height: 52,
            },
          ]}
        />
      </Field>

      <Field label="Marker">
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {BLAZE_SHAPES.map((value) => {
            const selected = value === shape;
            return (
              <PressableScale
                key={value}
                onPress={() => pick(setShape, value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`${value} marker`}
                contentStyle={{
                  padding: 5,
                  borderRadius: 19,
                  borderWidth: 2,
                  borderColor: selected ? c.text : "transparent",
                }}
              >
                <Blaze shape={value} color={color} size={48} />
              </PressableScale>
            );
          })}
        </View>
      </Field>

      <Field label="Paint">
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {BLAZE_COLORS.map((value) => {
            const selected = value === color;
            return (
              <PressableScale
                key={value}
                onPress={() => pick(setColor, value)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={COLOR_NAME[value]}
                style={{ flex: 1 }}
                contentStyle={{
                  height: 48,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: c.surface,
                  borderWidth: 2,
                  borderColor: selected ? c.text : "transparent",
                }}
              >
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: c.blaze[value] }} />
                <AppText variant="label">{COLOR_NAME[value]}</AppText>
              </PressableScale>
            );
          })}
        </View>
      </Field>

      <Field label="Trains">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
          {ATTRIBUTES.map((value) => (
            <Chip
              key={value}
              label={ATTRIBUTE_LABEL[value]}
              selected={value === attribute}
              onPress={() => pick(setAttribute, value)}
            />
          ))}
        </View>
        <AppText variant="caption" color={c.textMuted} style={{ marginTop: spacing.sm }}>
          {ATTRIBUTE_HINT[attribute]}
        </AppText>
      </Field>

      <Field label="How often">
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Chip label="Every day" selected={daily} onPress={() => pick(setDaily, true)} />
          <Chip label="Chosen days" selected={!daily} onPress={() => pick(setDaily, false)} />
        </View>
        {!daily && (
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: spacing.lg }}>
            {WEEKDAYS.map((day) => {
              const selected = days.includes(day);
              return (
                <PressableScale
                  key={day}
                  onPress={() => toggleDay(day)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={WEEKDAY_SHORT[day]}
                  contentStyle={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selected ? c.accent : c.surface,
                  }}
                >
                  <AppText variant="label" color={selected ? c.onAccent : c.textMuted}>
                    {WEEKDAY_INITIAL[day]}
                  </AppText>
                </PressableScale>
              );
            })}
          </View>
        )}
      </Field>

      <Button
        label="Save habit"
        style={{ marginTop: spacing.xxl }}
        onPress={() => {
          haptic.success();
          router.back();
        }}
      />
      <AppText variant="caption" color={c.textMuted} style={{ marginTop: spacing.md, textAlign: "center" }}>
        Preview only. Saving arrives with local storage.
      </AppText>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={{ marginTop: spacing.xl }}>
      <AppText variant="label" color={c.textMuted} style={{ marginBottom: spacing.sm }}>
        {label}
      </AppText>
      {children}
    </View>
  );
}
