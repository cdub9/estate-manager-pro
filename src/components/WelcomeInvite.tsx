import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { EstateJoinCode } from "@/components/EstateJoinCode";
import { GoldFlourishDivider } from "@/components/Gradients";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onDone: () => void;
}

/**
 * Shown once, immediately after a user creates a brand-new estate.
 * Surfaces the join code with a share button so the owner invites their
 * team without having to discover it in Profile first.
 */
export function WelcomeInvite({ visible, onDone }: Props) {
  const colors = useColors();
  const { estateName } = useAuth();

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="home" size={44} color={colors.primary} />
          </View>

          <Text style={[styles.eyebrow, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
            YOUR ESTATE IS READY
          </Text>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Raleway_600SemiBold" }]}>
            {estateName ?? "Welcome"}
          </Text>

          <View style={{ alignSelf: "stretch", marginVertical: 18 }}>
            <GoldFlourishDivider />
          </View>

          <Text style={[styles.body, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Share your private join code so family and staff can join your estate. Everyone sees the same
            tasks and inventory.
          </Text>

          <View
            style={[
              styles.codeCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <EstateJoinCode />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to the app"
          onPress={onDone}
          style={({ pressed }) => [
            styles.doneBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 16 }}>Continue</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 96,
    paddingBottom: 48,
    justifyContent: "space-between",
  },
  content: {
    alignItems: "center",
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 24,
  },
  codeCard: {
    alignSelf: "stretch",
    padding: 18,
  },
  doneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
});
