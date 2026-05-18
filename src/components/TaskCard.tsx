import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
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

type DueTone = "today" | "soon" | "later" | "overdue";

function formatDue(due: number | null): { label: string; tone: DueTone } | null {
  if (!due) return null;
  const d = new Date(due);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 86400000;
  const diff = Math.round((d.getTime() - today.getTime()) / dayMs);
  if (diff < 0) {
    const n = Math.abs(diff);
    return { label: n === 1 ? "1d overdue" : `${n}d overdue`, tone: "overdue" };
  }
  if (diff === 0) return { label: "Today", tone: "today" };
  if (diff === 1) return { label: "Tomorrow", tone: "soon" };
  if (diff < 7) return { label: `In ${diff}d`, tone: "soon" };
  return {
    label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    tone: "later",
  };
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
  const due = formatDue(task.dueDate);

  function dueColor(tone: DueTone): string {
    if (tone === "today" || tone === "overdue") return colors.destructive;
    if (tone === "soon") return colors.accent;
    return colors.mutedForeground;
  }

  const accentColor = category?.color ?? "transparent";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={task.title}
      accessibilityState={{ checked: isDone }}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={250}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: isDragging ? colors.primary : colors.border,
          opacity: pressed && !isDragging ? 0.92 : isDone ? 0.62 : 1,
          shadowOpacity: isDragging ? 0.18 : 0,
          shadowRadius: isDragging ? 14 : 0,
          shadowOffset: { width: 0, height: 6 },
          elevation: isDragging ? 6 : 0,
        },
        isDragging ? { transform: [{ scale: 1.02 }] } : null,
      ]}
    >
      <View
        style={[
          styles.accent,
          {
            backgroundColor: accentColor,
            borderTopLeftRadius: colors.radius,
            borderBottomLeftRadius: colors.radius,
          },
        ]}
      />

      <View style={styles.body}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={`Mark ${isDone ? "incomplete" : "complete"}`}
          accessibilityState={{ checked: isDone }}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            onToggleComplete();
          }}
          hitSlop={10}
          style={styles.statusBtn}
        >
          <StatusIndicator status={task.status} colors={colors} />
        </Pressable>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: 15.5,
              lineHeight: 19,
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
              textDecorationLine: isDone ? "line-through" : "none",
            }}
            numberOfLines={1}
          >
            {task.title}
          </Text>

          <View style={styles.metaRow}>
            {due ? (
              <MetaItem>
                <Feather name="calendar" size={11} color={dueColor(due.tone)} />
                <Text
                  style={{
                    color: dueColor(due.tone),
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    marginLeft: 4,
                  }}
                >
                  {due.label}
                </Text>
              </MetaItem>
            ) : null}

            {category ? (
              <>
                {due ? <Bullet colors={colors} /> : null}
                <Text
                  style={{
                    color: category.color,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                  }}
                  numberOfLines={1}
                >
                  {category.name}
                </Text>
              </>
            ) : null}

            {inventoryCount > 0 ? (
              <>
                {due || category ? <Bullet colors={colors} /> : null}
                <MetaItem>
                  <Feather name="tool" size={11} color={colors.mutedForeground} />
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      marginLeft: 4,
                    }}
                  >
                    {inventoryCount}
                  </Text>
                </MetaItem>
              </>
            ) : null}

            {task.photos.length > 0 ? (
              <>
                {due || category || inventoryCount > 0 ? <Bullet colors={colors} /> : null}
                <MetaItem>
                  <Feather name="image" size={11} color={colors.mutedForeground} />
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      marginLeft: 4,
                    }}
                  >
                    {task.photos.length}
                  </Text>
                </MetaItem>
              </>
            ) : null}

            {task.recurrence !== "none" ? (
              <>
                {due || category || inventoryCount > 0 || task.photos.length > 0 ? (
                  <Bullet colors={colors} />
                ) : null}
                <Feather name="repeat" size={11} color={colors.mutedForeground} />
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.right}>
          <Avatar user={assignee} size={28} fallbackLabel="—" />
          {draggable ? (
            <Feather
              name="menu"
              size={14}
              color={colors.mutedForeground}
              style={{ opacity: 0.5 }}
            />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function StatusIndicator({
  status,
  colors,
}: {
  status: Task["status"];
  colors: ReturnType<typeof useColors>;
}) {
  if (status === "done") {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
      >
        <Feather name="check" size={13} color="#fff" />
      </View>
    );
  }
  if (status === "in_progress") {
    return (
      <View style={[styles.dot, { borderColor: colors.primary }]}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    );
  }
  return <View style={[styles.dot, { borderColor: colors.mutedForeground }]} />;
}

function MetaItem({ children }: { children: React.ReactNode }) {
  return <View style={styles.metaItem}>{children}</View>;
}

function Bullet({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View
      style={[styles.bullet, { backgroundColor: colors.bulletColor }]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    shadowColor: "#000",
    overflow: "hidden",
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
    gap: 12,
  },
  statusBtn: {
    paddingTop: 1,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
    rowGap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
  },
  right: {
    alignItems: "center",
    gap: 8,
  },
});
