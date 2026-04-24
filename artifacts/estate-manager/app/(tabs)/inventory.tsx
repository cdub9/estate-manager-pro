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
import { InventoryCard } from "@/components/InventoryCard";
import { useInventory } from "@/contexts/InventoryContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";

export default function InventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items } = useInventory();
  const { tasks } = useTasks();

  const [search, setSearch] = useState("");

  const taskCountByItem = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tasks) {
      for (const id of t.inventoryIds) {
        map[id] = (map[id] ?? 0) + 1;
      }
    }
    return map;
  }, [tasks]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items;
    if (q) {
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.vendor.toLowerCase().includes(q) ||
          it.partNumber.toLowerCase().includes(q) ||
          it.location.toLowerCase().includes(q) ||
          it.description.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [items, search]);

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
              {items.length} {items.length === 1 ? "item" : "items"} cataloged
            </Text>
            <Text
              style={[
                styles.h1,
                { color: colors.foreground, fontFamily: "Inter_700Bold" },
              ]}
            >
              Equipment
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/inventory/new")}
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
            placeholder="Search by name, vendor, part #, location"
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
      </View>

      <FlatList
        data={visible}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: bottomPad,
          gap: 10,
          flexGrow: 1,
        }}
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
            title={
              items.length === 0
                ? "No equipment yet"
                : "No items match your search"
            }
            description={
              items.length === 0
                ? "Catalog your first piece of machinery or tooling. You can link items to tasks later."
                : "Try a different keyword."
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
});
