import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";

import { EmeraldFill } from "@/components/Gradients";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

/**
 * Displays the estate's private join code with a share button.
 * Self-contained (reads `estateJoinCode` / `estateName` from auth context)
 * so it can be dropped into the Profile card or the post-registration
 * welcome prompt. Renders nothing if there is no join code.
 */
export function EstateJoinCode() {
  const colors = useColors();
  const { estateJoinCode, estateName } = useAuth();

  if (!estateJoinCode) return null;

  async function handleShareCode() {
    await Share.share({
      message: `Join ${estateName ?? "my estate"} on Estate Manager Pro with code: ${estateJoinCode}`,
    });
  }

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11.5, marginBottom: 2 }}>
          Private join code
        </Text>
        <Text style={{ color: colors.primary, fontFamily: "Raleway_700Bold", fontSize: 24, letterSpacing: 5 }}>
          {estateJoinCode}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Share join code"
        onPress={handleShareCode}
        style={({ pressed }) => [
          styles.copyBtn,
          {
            borderRadius: colors.radius - 4,
            borderWidth: 1,
            borderColor: colors.goldHair,
            opacity: pressed ? 0.85 : 1,
            overflow: "hidden",
          },
        ]}
      >
        <EmeraldFill borderRadius={colors.radius - 4} />
        <Feather name="share-2" size={14} color={colors.onEmeraldIcon} />
        <Text style={{ color: colors.onEmerald, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>Invite</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
