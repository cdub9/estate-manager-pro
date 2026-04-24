import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { StatusPill } from "@/components/StatusPill";
import { useColors } from "@/hooks/useColors";
import { Task, User } from "@/types";

interface Props {
  task: Task;
  assignee: User | null;
  inventoryCount: number;
  onPress: () => void;
  onToggleComplete: () => void;
}

function formatDue(due: number | null): string | null {
  if (!due) return null;
  const d = new Date(due);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 86400000;
  const diff = Math.round((d.getTime() - today.getTime()) / dayMs);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff === -1) return "1 day overdue";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff < 7) return `Due in ${diff} days`;
  return `Due ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function TaskCard({
  task,
  assignee,
  inventoryCount,
  onPress,
  onToggleComplete,
}: Props) {
  const colors = useColors();
  const isDone = task.status === "done";
  const dueLabel = formatDue(task.dueDate);
  const overdue = task.dueDate ? task.dueDate < Date.now() && !isDone : false;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          onToggleComplete();
        }}
        hitSlop={10}
        style={[
          styles.checkbox,
          {
            borderColor: isDone ? colors.primary : colors.border,
            backgroundColor: isDone ? colors.primary : "transparent",
          },
        ]}
      >
        {isDone ? <Feather name="check" size={14} color="#fff" /> : null}
      </Pressable>

      <View style={{ flex: 1, gap: 8 }}>
        <Text
          style={[
            styles.title,
            {
              color: isDone ? colors.mutedForeground : colors.foreground,
              fontFamily: "Inter_600SemiBold",
              textDecorationLine: isDone ? "line-through" : "none",
            },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.description ? (
          <Text
            numberOfLines={2}
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {task.description}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <StatusPill status={task.status} />
          {dueLabel ? (
            <View style={styles.metaItem}>
              <Feather
                name="calendar"
                size={12}
                color={overdue ? colors.destructive : colors.mutedForeground}
              />
              <Text
                style={{
                  color: overdue ? colors.destructive : colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
              >
                {dueLabel}
              </Text>
            </View>
          ) : null}
          {inventoryCount > 0 ? (
            <View style={styles.metaItem}>
              <Feather name="package" size={12} color={colors.mutedForeground} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
              >
                {inventoryCount}
              </Text>
            </View>
          ) : null}
          {task.photos.length > 0 ? (
            <View style={styles.metaItem}>
              <Feather name="image" size={12} color={colors.mutedForeground} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
              >
                {task.photos.length}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={{ alignItems: "flex-end", gap: 8 }}>
        {task.photos[0] ? (
          <Image
            source={{ uri: task.photos[0] }}
            style={[styles.thumb, { borderRadius: colors.radius - 4 }]}
            contentFit="cover"
          />
        ) : null}
        <Avatar user={assignee} size={28} fallbackLabel="—" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 12,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  thumb: {
    width: 56,
    height: 56,
  },
});
