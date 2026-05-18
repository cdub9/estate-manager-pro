import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { User } from "@/types";
import { avatarColor, initials } from "@/utils/avatarColors";

interface Props {
  user: Pick<User, "name" | "colorIndex"> | null;
  size?: number;
  fallbackLabel?: string;
}

export function Avatar({ user, size = 36, fallbackLabel = "?" }: Props) {
  const colors = useColors();
  const bg = user ? avatarColor(user.colorIndex) : colors.mutedForeground;
  const label = user ? initials(user.name) : fallbackLabel;
  return (
    <View
      accessibilityLabel={user ? user.name : undefined}
      style={[
        styles.wrap,
        {
          backgroundColor: bg,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: size * 0.38,
          fontFamily: "Inter_600SemiBold",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
