// Gradient helpers for the Luxe redesign.
//
// `<EmeraldFill>` and `<GoldFill>` are positioned absolutely inside a
// parent View — typical usage:
//
//   <View style={[styles.btn, { overflow: 'hidden' }]}>
//     <EmeraldFill />
//     <Text>Save</Text>
//   </View>
//
// `<GoldHairlineRule>` renders a transparent → goldHair → transparent
// horizontal rule for use under headers and the tab bar.

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { EMERALD_GRADIENT, GOLD_GRADIENT } from "@/constants/colors";

export function EmeraldFill({ borderRadius }: { borderRadius?: number }) {
  return (
    <LinearGradient
      colors={EMERALD_GRADIENT as unknown as readonly [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={[StyleSheet.absoluteFillObject, borderRadius ? { borderRadius } : null]}
      pointerEvents="none"
    />
  );
}

export function GoldFill({ borderRadius }: { borderRadius?: number }) {
  return (
    <LinearGradient
      colors={GOLD_GRADIENT as unknown as readonly [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.7, y: 1 }}
      style={[StyleSheet.absoluteFillObject, borderRadius ? { borderRadius } : null]}
      pointerEvents="none"
    />
  );
}

/**
 * Thin horizontal rule that fades transparent → goldHair → transparent.
 * Used as the bottom border of headers and the top border of the tab bar.
 */
export function GoldHairlineRule({ height = 1 }: { height?: number }) {
  const colors = useColors();
  return (
    <LinearGradient
      colors={["transparent", colors.goldHair, "transparent"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{ height, width: "100%" }}
      pointerEvents="none"
    />
  );
}

/**
 * Decorative "hairline–diamond–hairline" flourish for section dividers
 * inside cards (Profile identity card).
 */
export function GoldFlourishDivider() {
  const colors = useColors();
  return (
    <View style={styles.flourish}>
      <View style={[styles.flourishLine, { backgroundColor: colors.goldHair }]} />
      <View style={[styles.flourishDiamond, { backgroundColor: colors.gold }]} />
      <View style={[styles.flourishLine, { backgroundColor: colors.goldHair }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  flourish: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 6,
  },
  flourishLine: {
    height: StyleSheet.hairlineWidth,
    flex: 1,
    maxWidth: 64,
  },
  flourishDiamond: {
    width: 4,
    height: 4,
    transform: [{ rotate: "45deg" }],
  },
});
