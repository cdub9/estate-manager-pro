import * as Haptics from "expo-haptics";
import React from "react";
import {
  AccessibilityState,
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { EmeraldFill } from "@/components/Gradients";
import { useColors } from "@/hooks/useColors";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  fullWidth,
  style,
  icon,
  testID,
}: Props) {
  const colors = useColors();

  // Primary uses an emerald gradient; others stay solid.
  const isPrimary = variant === "primary";
  const solidBg =
    variant === "destructive"
      ? colors.destructive
      : variant === "secondary"
        ? colors.secondary
        : variant === "ghost"
          ? "transparent"
          : undefined;
  const fg = isPrimary
    ? colors.onEmerald
    : variant === "destructive"
      ? colors.destructiveForeground
      : variant === "secondary"
        ? colors.secondaryForeground
        : colors.primary;

  const padV = size === "lg" ? 16 : size === "sm" ? 8 : 12;
  const padH = size === "lg" ? 22 : size === "sm" ? 12 : 16;
  const fontSize = size === "lg" ? 16 : size === "sm" ? 12.5 : 14;

  const isDisabled = disabled || loading;
  const accessibilityState: AccessibilityState = { disabled: isDisabled };
  const borderRadius = colors.radius;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={accessibilityState}
      onPress={() => {
        if (isDisabled) return;
        if (Platform.OS !== "web") {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress();
      }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: solidBg,
          borderRadius,
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: isDisabled ? 0.45 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? "stretch" : "auto",
          overflow: "hidden",
          // Primary buttons get a goldHair ring + soft shadow.
          borderWidth: isPrimary ? 1 : 0,
          borderColor: isPrimary ? colors.goldHair : "transparent",
          ...(isPrimary
            ? {
                shadowColor: "#0b2c22",
                shadowOpacity: 0.18,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 3,
              }
            : null),
        },
        style,
      ]}
    >
      {isPrimary ? <EmeraldFill borderRadius={borderRadius} /> : null}
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator
            color={fg}
            accessibilityLiveRegion="polite"
            accessibilityLabel="Loading"
          />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.label,
                {
                  color: fg,
                  fontSize,
                  fontFamily: "Inter_600SemiBold",
                  marginLeft: icon ? 8 : 0,
                },
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
});
