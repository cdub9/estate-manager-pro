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
  value: string[];
  onChange: (ids: string[]) => void;
}

export function InventoryLinkPicker({ items, value, onChange }: Props) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const active = items.filter((i) => i.state === "active");
  const filtered = query.trim()
    ? active.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : active;

  const linkedItems = items.filter((i) => value.includes(i.id));

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          value.length === 0
            ? "No inventory linked"
            : `${value.length} inventory item${value.length !== 1 ? "s" : ""} linked`
        }
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
          {value.length === 0 ? (
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 15 }}>
              No inventory linked
            </Text>
          ) : (
            <View style={styles.chips}>
              {linkedItems.slice(0, 3).map((item) => (
                <View
                  key={item.id}
                  style={[styles.chip, { backgroundColor: colors.secondary, borderRadius: 99 }]}
                >
                  <Text
                    style={{
                      color: colors.secondaryForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
              {linkedItems.length > 3 && (
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 12 }}>
                  +{linkedItems.length - 3} more
                </Text>
              )}
            </View>
          )}
        </View>
        <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
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

            {filtered.length === 0 ? (
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14, padding: 8 }}>
                {active.length === 0 ? "No active inventory items." : "No results."}
              </Text>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(i) => i.id}
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => {
                  const selected = value.includes(item.id);
                  return (
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={item.name}
                      accessibilityState={{ checked: selected }}
                      onPress={() => toggle(item.id)}
                      style={({ pressed }) => [
                        styles.row,
                        { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            borderColor: selected ? colors.primary : colors.border,
                            backgroundColor: selected ? colors.primary : "transparent",
                          },
                        ]}
                      >
                        {selected && <Feather name="check" size={12} color="#fff" />}
                      </View>
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
                    </Pressable>
                  );
                }}
              />
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Done"
              onPress={() => setOpen(false)}
              style={({ pressed }) => [
                styles.doneBtn,
                { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Done</Text>
            </Pressable>
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtn: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
});
