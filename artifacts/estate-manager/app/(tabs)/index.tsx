import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { TaskCard } from "@/components/TaskCard";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { TaskStatus } from "@/types";

type Filter = "all" | "mine" | "open" | "done";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mine", label: "Mine" },
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
];

export default function TasksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tasks, toggleComplete } = useTasks();
  const { users, currentUser } = useAuth();

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done").length;
    const mine = tasks.filter(
      (t) => t.assigneeId === currentUser?.id && t.status !== "done",
    ).length;
    return { open, mine, total: tasks.length };
  }, [tasks, currentUser]);

  const visible = useMemo(() => {
    let list = tasks;
    if (filter === "mine") list = list.filter((t) => t.assigneeId === currentUser?.id);
    if (filter === "open") list = list.filter((t) => t.status !== "done");
    if (filter === "done") list = list.filter((t) => t.status === "done");
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    const order: Record<TaskStatus, number> = { in_progress: 0, open: 1, done: 2 };
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return order[a.status] - order[b.status];
      if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return b.createdAt - a.createdAt;
    });
  }, [tasks, filter, search, currentUser]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad =
    Platform.OS === "web" ? 84 + 16 : insets.bottom + 60 + 24;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
              }}
            >
              {counts.open} open · {counts.mine} for you
            </Text>
            <Text
              style={[
                styles.h1,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              Tasks
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/task/new")}
            style={({ pressed }) => [
              styles.addBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            hitSlop={6}
          >
            <Feather name="plus" size={20} color="#fff" />
          </Pressable>
        </View>

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks"
            placeholderTextColor={colors.mutedForeground}
            style={{
              flex: 1,
              color: colors.foreground,
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              paddingVertical: Platform.OS === "web" ? 8 : 0,
            }}
          />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f.value === filter;
            return (
              <Pressable
                key={f.value}
                onPress={() => setFilter(f.value)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.secondary,
                    borderRadius: 999,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? "#fff" : colors.secondaryForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                    letterSpacing: 0.3,
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: bottomPad,
          gap: 10,
          flexGrow: 1,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        renderItem={({ item }) => {
          const assignee = users.find((u) => u.id === item.assigneeId) ?? null;
          return (
            <TaskCard
              task={item}
              assignee={assignee}
              inventoryCount={item.inventoryIds.length}
              onPress={() => router.push(`/task/${item.id}`)}
              onToggleComplete={() => toggleComplete(item.id)}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="check-square"
            title={
              tasks.length === 0
                ? "No tasks yet"
                : "Nothing matches that filter"
            }
            description={
              tasks.length === 0
                ? "Create your first task to start coordinating work around the estate."
                : "Try a different filter or clear your search."
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  h1: {
    fontSize: 32,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
});
