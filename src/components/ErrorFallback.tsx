import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  error: Error;
  onReset: () => void;
}

export function ErrorFallback({ error, onReset }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Feather name="alert-triangle" size={40} color={colors.destructive} />
      <Text style={[styles.heading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        Something went wrong
      </Text>
      <Text style={[styles.message, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
        {error.message}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Try again"
        onPress={onReset}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  heading: {
    fontSize: 20,
    marginTop: 8,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
  },
});
