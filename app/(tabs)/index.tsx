import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { EmptyState } from "@/components/EmptyState";
import { TaskCard } from "@/components/TaskCard";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { Task } from "@/types";

type FilterMode = "all" | "mine" | "done";

export default function TasksScreen() {
  const colors = useColors();
  const router = useRouter();
  const { currentUser, users } = useAuth();
  const { tasks, loading, error, refresh, updateTask, reorderTasks } = useTasks();
  const { getCategory } = useCategories();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const filtersActive = query.trim().length > 0 || filter !== "all";

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => a.order - b.order);
  }, [tasks]);

  const filtered = useMemo(() => {
    let result = sorted;
    if (filter === "all") result = result.filter((t) => t.status !== "done");
    if (filter === "mine") result = result.filter((t) => currentUser !== null && t.assigneeIds.includes(currentUser.id) && t.status !== "done");
    if (filter === "done") result = result.filter((t) => t.status === "done");
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    return result;
  }, [sorted, filter, query, currentUser]);

  const mineCount = useMemo(
    () => tasks.filter((t) => currentUser !== null && t.assigneeIds.includes(currentUser.id) && t.status !== "done").length,
    [tasks, currentUser]
  );

  const handleDragEnd = useCallback(
    ({ data }: { data: Task[] }) => {
      reorderTasks(data.map((t) => t.id));
    },
    [reorderTasks]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Task>) => {
      const assignees = users.filter((u) => item.assigneeIds.includes(u.id));
      const category = getCategory(item.categoryId ?? null) ?? null;
      return (
        <ScaleDecorator>
          <TaskCard
            task={item}
            assignees={assignees}
            category={category}
            inventoryCount={item.inventoryIds.length}
            onPress={() => router.push(`/task/${item.id}`)}
            onToggleComplete={() =>
              updateTask(item.id, { status: item.status === "done" ? "open" : "done" })
            }
            onLongPress={filtersActive ? undefined : drag}
            isDragging={isActive}
            draggable={!filtersActive}
          />
        </ScaleDecorator>
      );
    },
    [users, getCategory, updateTask, router, filtersActive]
  );

  const FILTERS: { value: FilterMode; label: string }[] = [
    { value: "all", label: "All" },
    { value: "mine", label: filter === "mine" && mineCount > 0 ? `Mine (${mineCount})` : "Mine" },
    { value: "done", label: "Completed" },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Tasks</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New task"
          onPress={() => router.push("/task/new")}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary, borderRadius: 99, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.searchWrap,
            { backgroundColor: colors.secondary, borderRadius: colors.radius },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Search tasks"
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks…"
            placeholderTextColor={colors.mutedForeground}
            returnKeyType="search"
            style={[styles.searchInput, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}
          />
          {query.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setQuery("")}
              hitSlop={8}
            >
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>

      <View
        style={[styles.filterRow, { backgroundColor: colors.background }]}
        accessibilityRole="radiogroup"
        accessibilityLabel="Filter tasks"
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <Pressable
              key={f.value}
              accessibilityRole="radio"
              accessibilityLabel={f.label}
              accessibilityState={{ checked: active }}
              onPress={() => setFilter(f.value)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: active ? colors.primary : colors.secondary,
                  borderRadius: 99,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? "#fff" : colors.secondaryForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 12,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {filtersActive && (
        <View style={[styles.dragDisabledBanner, { backgroundColor: colors.secondary }]}>
          <Feather name="info" size={13} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
            Clear filters to reorder tasks
          </Text>
        </View>
      )}

      {!loading && error ? (
        <View style={styles.errorState}>
          <Feather name="wifi-off" size={32} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 15, textAlign: "center" }}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading tasks"
            onPress={refresh}
            style={({ pressed }) => [
              styles.retryBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <DraggableFlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          onDragEnd={handleDragEnd}
          activationDistance={filtersActive ? 99999 : 10}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="check-square"
              title={filtersActive ? "No matching tasks" : "No tasks yet"}
              description={filtersActive ? "Try adjusting your search or filters" : "Tap + to create your first task"}
            />
          }
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 28,
  },
  addBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dragDisabledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  list: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 4,
  },
});
