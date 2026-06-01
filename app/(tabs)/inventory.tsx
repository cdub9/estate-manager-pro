import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { EmeraldFill, GoldHairlineRule } from "@/components/Gradients";
import { InventoryCard } from "@/components/InventoryCard";
import { useInventory } from "@/contexts/InventoryContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";

export default function InventoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { items, archivedItems, archivedMode, loading, error, refresh, showArchived, showActive } = useInventory();
  const { tasks } = useTasks();

  const taskCountByItem = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tasks) {
      for (const id of t.inventoryIds) {
        map[id] = (map[id] ?? 0) + 1;
      }
    }
    return map;
  }, [tasks]);

  const [query, setQuery] = useState("");

  const list = archivedMode ? archivedItems : items;
  const filtered = useMemo(() => {
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q) ||
        i.vendor.toLowerCase().includes(q)
    );
  }, [list, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
            ESTATE
          </Text>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_600SemiBold" }]}>
            Inventory
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New inventory item"
          onPress={() => router.push("/inventory/new")}
          style={({ pressed }) => [
            styles.addBtn,
            {
              borderRadius: 99,
              borderWidth: 1,
              borderColor: colors.goldHair,
              opacity: pressed ? 0.85 : 1,
              overflow: "hidden",
              shadowColor: "#0b2c22",
              shadowOpacity: 0.18,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            },
          ]}
        >
          <EmeraldFill borderRadius={99} />
          <Feather name="plus" size={20} color={colors.onEmeraldIcon} />
        </Pressable>
      </View>
      <GoldHairlineRule />

      <View style={[styles.searchRow, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: colors.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            accessibilityLabel="Search inventory"
            value={query}
            onChangeText={setQuery}
            placeholder="Search inventory…"
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

      <View style={[styles.toggleRow, { backgroundColor: colors.background }]}>
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel="View active items"
          accessibilityState={{ checked: !archivedMode }}
          onPress={showActive}
          style={({ pressed }) => [
            styles.toggleChip,
            {
              backgroundColor: "transparent",
              borderRadius: 99,
              borderWidth: 1,
              borderColor: !archivedMode ? colors.goldHair : colors.border,
              opacity: pressed ? 0.85 : 1,
              overflow: "hidden",
            },
          ]}
        >
          {!archivedMode ? <EmeraldFill borderRadius={99} /> : null}
          <Text
            style={{
              color: !archivedMode ? colors.onEmerald : colors.secondaryForeground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
            }}
          >
            Active
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel="View archived items"
          accessibilityState={{ checked: archivedMode }}
          onPress={showArchived}
          style={({ pressed }) => [
            styles.toggleChip,
            {
              backgroundColor: "transparent",
              borderRadius: 99,
              borderWidth: 1,
              borderColor: archivedMode ? colors.goldHair : colors.border,
              opacity: pressed ? 0.85 : 1,
              overflow: "hidden",
            },
          ]}
        >
          {archivedMode ? <EmeraldFill borderRadius={99} /> : null}
          <Text
            style={{
              color: archivedMode ? colors.onEmerald : colors.secondaryForeground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
            }}
          >
            Archived {archivedItems.length > 0 ? `(${archivedItems.length})` : ""}
          </Text>
        </Pressable>
      </View>

      {!loading && error ? (
        <View style={styles.errorState}>
          <Feather name="wifi-off" size={32} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 15, textAlign: "center" }}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading inventory"
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
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <InventoryCard
              item={item}
              taskCount={taskCountByItem[item.id] ?? 0}
              onPress={() => router.push(`/inventory/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="package"
              title={query ? "No matching items" : archivedMode ? "No archived items" : "No inventory yet"}
              description={
                query
                  ? "Try adjusting your search"
                  : archivedMode
                  ? "Archived items appear here"
                  : "Tap + to add your first item"
              }
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 10.5,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    letterSpacing: 0.2,
  },
  addBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    paddingHorizontal: 20,
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
  toggleRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 20,
    gap: 9,
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
