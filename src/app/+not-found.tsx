import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function NotFound() {
  const colors = useColors();
  const router = useRouter();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 48 }}>404</Text>
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 16, marginTop: 8 }}>
        Page not found
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go home"
        onPress={() => router.replace("/(tabs)")}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Go home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  btn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 32 },
});
