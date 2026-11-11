import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { MaintenanceSchedule } from "@/types";
import { dueState, formatDueLabel, formatInterval } from "@/utils/maintenance";

interface Props {
  schedule: MaintenanceSchedule;
  /** Resolved label for the asset/subject this covers (inventory name or free text). */
  assetLabel: string;
  onPress: () => void;
}

export function MaintenanceCard({ schedule, assetLabel, onPress }: Props) {
  const colors = useColors();
  const paused = !schedule.active;
  const state = dueState(schedule.nextDue);

  const badgeColor = paused
    ? colors.mutedForeground
    : state === "overdue"
    ? colors.destructive
    : state === "due_soon"
    ? colors.goldDeep
    : colors.mutedForeground;

  const badgeText = paused ? "Paused" : formatDueLabel(schedule.nextDue);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${schedule.title}, ${badgeText}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: colors.secondary, borderColor: colors.goldHair },
          ]}
        >
          <Feather name="tool" size={16} color={colors.goldDeep} />
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 15 }}
          numberOfLines={1}
        >
          {schedule.title}
        </Text>
        {assetLabel ? (
          <Text
            style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: 1 }}
            numberOfLines={1}
          >
            {assetLabel}
          </Text>
        ) : null}
        <Text style={{ color: colors.faint, fontFamily: "Inter_400Regular", fontSize: 11.5, marginTop: 3 }}>
          {formatInterval(schedule.intervalCount, schedule.intervalUnit)}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={{ color: badgeColor, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>
          {badgeText}
        </Text>
        <Feather name="chevron-right" size={16} color={colors.faint} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  iconWrap: {
    justifyContent: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
