import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusPill } from "@/components/StatusPill";
import { useColors } from "@/hooks/useColors";
import { Category, Task, User } from "@/types";

interface Props {
  task: Task;
  assignee: User | null;
  category: Category | null;
  inventoryCount: number;
  onPress: () => void;
  onToggleComplete: () => void;
  onLongPress?: () => void;
  isDragging?: boolean;
  draggable?: boolean;
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
  category,
  inventoryCount,
  onPress,
  onToggleComplete,
  onLongPress,
  isDragging,
  draggable,
}: Props) {
  const colors = useColors();
  const isDone = task.status === "done";
  const dueLabel = formatDue(task.dueDate);
  const overdue = task.dueDate ? task.dueDate < Date.now() && !isDone : false;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={250}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: isDragging ? colors.primary : colors.border,
          opacity: pressed && !isDragging ? 0.92 : 1,
          shadowOpacity: isDragging ? 0.18 : 0,
          shadowRadius: isDragging ? 14 : 0,
          shadowOffset: { width: 0, height: 6 },
          elevation: isDragging ? 6 : 0,
        },
        isDragging ? { transform: [{ scale: 1.02 }] } : null,
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
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {
                color: isDone ? colors.mutedForeground : colors.foreground,
                fontFamily: "Inter_600SemiBold",
                textDecorationLine: isDone ? "line-through" : "none",
                flex: 1,
              },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.recurrence !== "none" ? (
            <Feather name="repeat" size={13} color={colors.mutedForeground} />
          ) : null}
        </View>
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
          {category ? <CategoryBadge category={category} /> : null}
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
        {draggable ? (
          <Feather
            name="menu"
            size={14}
            color={colors.mutedForeground}
            style={{ opacity: 0.6 }}
          />
        ) : null}
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
    shadowColor: "#000",
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
