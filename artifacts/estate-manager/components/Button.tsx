import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

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

  const bg =
    variant === "primary"
      ? colors.primary
      : variant === "destructive"
        ? colors.destructive
        : variant === "secondary"
          ? colors.secondary
          : "transparent";
  const fg =
    variant === "primary" || variant === "destructive"
      ? "#ffffff"
      : variant === "secondary"
        ? colors.secondaryForeground
        : colors.primary;

  const padV = size === "lg" ? 16 : size === "sm" ? 8 : 12;
  const padH = size === "lg" ? 22 : size === "sm" ? 12 : 16;
  const fontSize = size === "lg" ? 17 : size === "sm" ? 13 : 15;

  return (
    <Pressable
      testID={testID}
      onPress={() => {
        if (disabled || loading) return;
        if (Platform.OS !== "web") {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress();
      }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: colors.radius,
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? "stretch" : "auto",
          borderWidth: variant === "ghost" ? 0 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
});
