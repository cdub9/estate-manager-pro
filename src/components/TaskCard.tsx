import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { EmeraldFill } from "@/components/Gradients";
import { useColors } from "@/hooks/useColors";
import { Category, Task, User } from "@/types";

interface Props {
  task: Task;
  assignees: User[];
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
  d.setHours(0, 0, 0, 0);
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
  assignees,
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
    if (tone === "soon") return colors.goldDeep;
    return colors.mutedForeground;
  }

  // 3px category accent stripe — default gold when no category.
  const accentColor = category?.color ?? colors.gold;

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
          borderColor: isDragging ? colors.gold : colors.border,
          opacity: pressed && !isDragging ? 0.92 : isDone ? 0.62 : 1,
          shadowColor: "#1b2a23",
          shadowOpacity: isDragging ? 0.18 : 0.03,
          shadowRadius: isDragging ? 14 : 2,
          shadowOffset: { width: 0, height: isDragging ? 6 : 1 },
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
              fontSize: 16,
              lineHeight: 20,
              color: colors.foreground,
              fontFamily: "PlayfairDisplay_500Medium",
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
                    fontSize: 11.5,
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
                    fontSize: 11.5,
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
                      fontSize: 11.5,
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
                      fontSize: 11.5,
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
          <AssigneeStack assignees={assignees} />
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

function AssigneeStack({ assignees }: { assignees: User[] }) {
  const colors = useColors();
  if (assignees.length === 0) {
    return <Avatar user={null} size={25} fallbackLabel="—" />;
  }
  const visible = assignees.slice(0, 3);
  const overflow = assignees.length - visible.length;
  const totalWidth = 25 + (visible.length - 1) * 16 + (overflow > 0 ? 18 : 0);
  return (
    <View style={{ width: totalWidth, height: 25, position: "relative" }}>
      {visible.map((u, i) => (
        <View key={u.id} style={{ position: "absolute", left: i * 16 }}>
          <Avatar user={u} size={25} />
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={{
            position: "absolute",
            left: visible.length * 16,
            width: 25,
            height: 25,
            borderRadius: 12.5,
            backgroundColor: colors.secondary,
            borderWidth: 1,
            borderColor: colors.goldHair,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: colors.goldDeep,
              fontFamily: "Inter_600SemiBold",
              fontSize: 10,
            }}
          >
            +{overflow}
          </Text>
        </View>
      )}
    </View>
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
          {
            borderColor: colors.goldHair,
            backgroundColor: "transparent",
            overflow: "hidden",
          },
        ]}
      >
        <EmeraldFill borderRadius={11} />
        <Feather name="check" size={12} color={colors.onEmeraldIcon} />
      </View>
    );
  }
  if (status === "in_progress") {
    return (
      <View style={[styles.dot, { borderColor: colors.gold }]}>
        <View
          style={{
            width: 9,
            height: 9,
            borderRadius: 4.5,
            backgroundColor: colors.gold,
          }}
        />
      </View>
    );
  }
  return <View style={[styles.dot, { borderColor: colors.faint }]} />;
}

function MetaItem({ children }: { children: React.ReactNode }) {
  return <View style={styles.metaItem}>{children}</View>;
}

function Bullet({ colors }: { colors: ReturnType<typeof useColors> }) {
  return <View style={[styles.bullet, { backgroundColor: colors.faint }]} />;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    overflow: "hidden",
  },
  accent: {
    width: 3,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 14,
    gap: 12,
  },
  statusBtn: {
    paddingTop: 1,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
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
