import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Recurrence } from "@/types";

const OPTIONS: { value: Recurrence; label: string }[] = [
  { value: "none", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function recurrenceLabel(r: Recurrence): string {
  const found = OPTIONS.find((o) => o.value === r);
  return found ? found.label : "Never";
}

interface Props {
  value: Recurrence;
  onChange: (r: Recurrence) => void;
}

export function RecurrencePicker({ value, onChange }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.secondary,
                borderRadius: 999,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: active ? "#fff" : colors.secondaryForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
