import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { TaskStatus } from "@/types";

const OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

interface Props {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

export function StatusSegmented({ value, onChange }: Props) {
  const colors = useColors();
  return (
    <View
      accessibilityRole="radiogroup"
      style={[
        styles.wrap,
        { backgroundColor: colors.secondary, borderRadius: colors.radius },
      ]}
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            accessibilityRole="radio"
            accessibilityLabel={opt.label}
            accessibilityState={{ checked: active }}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor: active ? colors.card : "transparent",
                borderRadius: colors.radius - 2,
                borderWidth: active ? 1 : 0,
                borderColor: active ? colors.goldHair : "transparent",
                opacity: pressed ? 0.85 : 1,
                shadowOpacity: active ? 0.08 : 0,
              },
            ]}
          >
            <Text
              style={{
                color: active ? colors.primary : colors.mutedForeground,
                fontFamily: active ? "Inter_600SemiBold" : "Inter_500Medium",
                fontSize: 13,
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
  wrap: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    shadowColor: "#000",
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
});
