import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string | null;
  multiline?: boolean;
}

export function TextField({ label, hint, error, multiline, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text
          style={[
            styles.label,
            { color: colors.foreground, fontFamily: "Inter_500Medium" },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.border,
            borderRadius: colors.radius,
            color: colors.foreground,
            fontFamily: "Inter_400Regular",
            minHeight: multiline ? 100 : 48,
            textAlignVertical: multiline ? "top" : "center",
            paddingTop: multiline ? 12 : 0,
          },
          style,
        ]}
        multiline={multiline}
        {...rest}
      />
      {error ? (
        <Text
          style={[
            styles.helper,
            { color: colors.destructive, fontFamily: "Inter_400Regular" },
          ]}
        >
          {error}
        </Text>
      ) : hint ? (
        <Text
          style={[
            styles.helper,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 13 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  helper: { fontSize: 12 },
});
