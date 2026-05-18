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
import { InventoryCard } from "@/components/InventoryCard";
import { useInventory } from "@/contexts/InventoryContext";
import { useColors } from "@/hooks/useColors";

export default function InventoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { items, archivedItems, archivedMode, showArchived, showActive } = useInventory();

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
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Inventory
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New inventory item"
          onPress={() => router.push("/inventory/new")}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary, borderRadius: 99, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={[styles.searchRow, { backgroundColor: colors.background }]}>
        <View style={[styles.searchWrap, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
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
              backgroundColor: !archivedMode ? colors.primary : colors.secondary,
              borderRadius: 99,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={{
              color: !archivedMode ? "#fff" : colors.secondaryForeground,
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
              backgroundColor: archivedMode ? colors.primary : colors.secondary,
              borderRadius: 99,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={{
              color: archivedMode ? "#fff" : colors.secondaryForeground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 12,
            }}
          >
            Archived {archivedItems.length > 0 ? `(${archivedItems.length})` : ""}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <InventoryCard item={item} onPress={() => router.push(`/inventory/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="package"
            title={query ? "No matching items" : archivedMode ? "No archived items" : "No inventory yet"}
            subtitle={
              query
                ? "Try adjusting your search"
                : archivedMode
                ? "Archived items appear here"
                : "Tap + to add your first item"
            }
          />
        }
      />
    </View>
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
  toggleRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  list: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
});
