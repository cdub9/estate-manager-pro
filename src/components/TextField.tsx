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
  /** Optional element rendered inside the input on the right (e.g. a show/hide toggle). */
  rightElement?: React.ReactNode;
}

export function TextField({ label, hint, error, multiline, rightElement, style, ...rest }: Props) {
  const colors = useColors();
  const accessibilityLabel = label ?? (rest.placeholder as string | undefined);
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
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={hint ?? undefined}
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
              paddingRight: rightElement ? 44 : 14,
            },
            style,
          ]}
          multiline={multiline}
          {...rest}
        />
        {rightElement ? (
          <View style={styles.rightElement}>{rightElement}</View>
        ) : null}
      </View>
      {error ? (
        <Text
          style={[
            styles.helper,
            { color: colors.destructive, fontFamily: "Inter_400Regular" },
          ]}
          accessibilityRole="alert"
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
  inputRow: { position: "relative" },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  rightElement: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  helper: { fontSize: 12 },
});
