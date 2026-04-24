import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Category } from "@/types";

interface Props {
  category: Category;
  size?: "sm" | "md";
}

export function CategoryBadge({ category, size = "sm" }: Props) {
  const padH = size === "md" ? 10 : 8;
  const padV = size === "md" ? 5 : 3;
  const fontSize = size === "md" ? 12 : 11;
  const dot = size === "md" ? 8 : 6;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: hexWithAlpha(category.color, 0.14),
          paddingHorizontal: padH,
          paddingVertical: padV,
        },
      ]}
    >
      <View
        style={{
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          backgroundColor: category.color,
        }}
      />
      <Text
        numberOfLines={1}
        style={{
          color: category.color,
          fontFamily: "Inter_600SemiBold",
          fontSize,
        }}
      >
        {category.name}
      </Text>
    </View>
  );
}

function hexWithAlpha(hex: string, alpha: number): string {
  // Best-effort; falls back to original color if we can't parse.
  const m = hex.replace("#", "");
  if (m.length !== 6) return hex;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
});
