import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { InventoryItem } from "@/types";

interface Props {
  items: InventoryItem[];
  value: string | null;
  onChange: (id: string | null) => void;
}

/** Optional single-select inventory picker (for linking one asset). */
export function InventorySelect({ items, value, onChange }: Props) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const active = items.filter((i) => i.state === "active");
  const filtered = query.trim()
    ? active.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : active;

  const selected = items.find((i) => i.id === value) ?? null;

  function pick(id: string | null) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selected ? `Linked to ${selected.name}` : "No inventory linked"}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <View style={styles.fieldInner}>
          <Feather name="package" size={16} color={colors.mutedForeground} />
          <Text
            style={{
              color: selected ? colors.foreground : colors.mutedForeground,
              fontFamily: selected ? "Inter_500Medium" : "Inter_400Regular",
              fontSize: 15,
              flex: 1,
            }}
            numberOfLines={1}
          >
            {selected ? selected.name : "No inventory linked"}
          </Text>
        </View>
        {selected ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear inventory link"
            onPress={() => onChange(null)}
            hitSlop={8}
          >
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        ) : (
          <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
        )}
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                ...(Platform.OS === "web" ? { maxWidth: 420 } : {}),
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              Link inventory
            </Text>

            <TextInput
              accessibilityLabel="Search inventory"
              value={query}
              onChangeText={setQuery}
              placeholder="Search…"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.search,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: colors.radius,
                  color: colors.foreground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="No inventory link"
              onPress={() => pick(null)}
              style={({ pressed }) => [
                styles.row,
                { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.border },
              ]}
            >
              <Feather name="slash" size={16} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 }}>
                None (free-text subject)
              </Text>
              {value === null && <Feather name="check" size={18} color={colors.primary} />}
            </Pressable>

            {filtered.length === 0 ? (
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14, padding: 8 }}>
                {active.length === 0 ? "No active inventory items." : "No results."}
              </Text>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(i) => i.id}
                style={{ maxHeight: 300 }}
                renderItem={({ item }) => {
                  const isSelected = value === item.id;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => pick(item.id)}
                      style={({ pressed }) => [
                        styles.row,
                        { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.border },
                      ]}
                    >
                      <Feather name="package" size={16} color={colors.mutedForeground} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15 }}>
                          {item.name}
                        </Text>
                        {item.location ? (
                          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                            {item.location}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected && <Feather name="check" size={18} color={colors.primary} />}
                    </Pressable>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
  },
  fieldInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    padding: 16,
    gap: 10,
  },
  sheetTitle: {
    fontSize: 15,
  },
  search: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
