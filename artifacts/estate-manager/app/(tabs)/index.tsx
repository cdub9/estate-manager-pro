import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryBadge } from "@/components/CategoryBadge";
import { EmptyState } from "@/components/EmptyState";
import { TaskCard } from "@/components/TaskCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { Task, TaskStatus } from "@/types";

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
  const { tasks, toggleComplete, reorderTasks } = useTasks();
  const { users, currentUser } = useAuth();
  const { categories, getCategory } = useCategories();

  const [filter, setFilter] = useState<Filter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const counts = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "done").length;
    const mine = tasks.filter(
      (t) => t.assigneeId === currentUser?.id && t.status !== "done",
    ).length;
    return { open, mine, total: tasks.length };
  }, [tasks, currentUser]);

  const filtersActive =
    filter !== "all" || categoryFilter !== null || search.trim() !== "";

  const visible = useMemo(() => {
    let list = tasks;
    if (filter === "mine")
      list = list.filter((t) => t.assigneeId === currentUser?.id);
    if (filter === "open") list = list.filter((t) => t.status !== "done");
    if (filter === "done") list = list.filter((t) => t.status === "done");
    if (categoryFilter)
      list = list.filter((t) => t.categoryId === categoryFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    if (filtersActive) {
      const order: Record<TaskStatus, number> = {
        in_progress: 0,
        open: 1,
        done: 2,
      };
      return [...list].sort((a, b) => {
        if (a.status !== b.status) return order[a.status] - order[b.status];
        if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.createdAt - a.createdAt;
      });
    }
    // Manual order: keep storage order, push completed to bottom.
    const open: Task[] = [];
    const done: Task[] = [];
    for (const t of list) {
      (t.status === "done" ? done : open).push(t);
    }
    return [...open, ...done];
  }, [tasks, filter, categoryFilter, search, currentUser, filtersActive]);

  const dragEnabled = !filtersActive;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad =
    Platform.OS === "web" ? 84 + 16 : insets.bottom + 60 + 24;

  function renderItem({ item, drag, isActive }: RenderItemParams<Task>) {
    const assignee = users.find((u) => u.id === item.assigneeId) ?? null;
    const category = getCategory(item.categoryId) ?? null;
    return (
      <View style={{ marginBottom: 10 }}>
        <TaskCard
          task={item}
          assignee={assignee}
          category={category}
          inventoryCount={item.inventoryIds.length}
          onPress={() => router.push(`/task/${item.id}`)}
          onToggleComplete={() => toggleComplete(item.id)}
          onLongPress={
            dragEnabled
              ? () => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Medium,
                    ).catch(() => {});
                  }
                  drag();
                }
              : undefined
          }
          isDragging={isActive}
          draggable={dragEnabled}
        />
      </View>
    );
  }

  const Header = (
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

      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          <Pressable
            onPress={() => setCategoryFilter(null)}
            style={({ pressed }) => [
              styles.allCatChip,
              {
                backgroundColor:
                  categoryFilter === null ? colors.foreground : colors.secondary,
                borderRadius: 999,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={{
                color:
                  categoryFilter === null ? "#fff" : colors.secondaryForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 12,
              }}
            >
              All categories
            </Text>
          </Pressable>
          {categories.map((c) => {
            const active = categoryFilter === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoryFilter(active ? null : c.id)}
                style={({ pressed }) => [
                  styles.catChip,
                  {
                    backgroundColor: active ? c.color : colors.secondary,
                    borderRadius: 999,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: active ? "#fff" : c.color,
                  }}
                />
                <Text
                  style={{
                    color: active ? "#fff" : colors.secondaryForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 12,
                  }}
                >
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DraggableFlatList<Task>
        data={visible}
        keyExtractor={(t) => t.id}
        onDragEnd={({ data }) => {
          if (!dragEnabled) return;
          reorderTasks(data.map((t) => t.id));
        }}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: bottomPad,
          flexGrow: 1,
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
        activationDistance={Platform.OS === "web" ? 5 : 12}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
    gap: 14,
    marginHorizontal: -16,
    paddingHorizontal: 16,
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
  catRow: {
    gap: 8,
    paddingRight: 16,
  },
  allCatChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
});
