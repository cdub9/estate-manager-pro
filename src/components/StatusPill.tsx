import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { TaskStatus } from "@/types";

const LABELS: Record<TaskStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  done: "Done",
};

export function StatusPill({ status }: { status: TaskStatus }) {
  const colors = useColors();
  const palette: Record<TaskStatus, { bg: string; fg: string }> = {
    open: { bg: colors.secondary, fg: colors.secondaryForeground },
    in_progress: { bg: colors.statusInProgressBg, fg: colors.statusInProgressFg },
    done: { bg: colors.statusDoneBg, fg: colors.statusDoneFg },
  };
  const { bg, fg } = palette[status];
  return (
    <View
      accessibilityLabel={LABELS[status]}
      style={[styles.pill, { backgroundColor: bg }]}
    >
      <Text style={[styles.text, { color: fg, fontFamily: "Inter_600SemiBold" }]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
