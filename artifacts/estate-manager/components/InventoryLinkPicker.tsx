import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function openItem(id: string) {
    setOpen(false);
    router.push(`/inventory/${id}`);
  }

  const selected = items.filter((it) => value.includes(it.id));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.partNumber.toLowerCase().includes(q) ||
        it.location.toLowerCase().includes(q) ||
        it.vendor.toLowerCase().includes(q),
    );
  }, [items, query]);

  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  }

  return (
    <>
      <Pressable
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
        <View style={{ flex: 1 }}>
          {selected.length === 0 ? (
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 15,
              }}
            >
              No equipment linked
            </Text>
          ) : (
            <View style={styles.chips}>
              {selected.map((it) => (
                <View
                  key={it.id}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.secondary },
                  ]}
                >
                  <Feather
                    name="package"
                    size={12}
                    color={colors.secondaryForeground}
                  />
                  <Text
                    style={{
                      color: colors.secondaryForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                    }}
                  >
                    {it.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                ...(Platform.OS === "web"
                  ? { maxWidth: 480, alignSelf: "center", borderRadius: 24, marginBottom: 24 }
                  : {}),
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 17,
                }}
              >
                Link equipment
              </Text>
              <Pressable
                onPress={() => setOpen(false)}
                hitSlop={10}
                style={[
                  styles.closeBtn,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Feather name="x" size={16} color={colors.secondaryForeground} />
              </Pressable>
            </View>
            <View
              style={[
                styles.search,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Feather name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search inventory"
                placeholderTextColor={colors.mutedForeground}
                style={{
                  flex: 1,
                  color: colors.foreground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                }}
              />
            </View>
            {items.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: "center" }}>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                  }}
                >
                  No inventory items yet. Add one in the Inventory tab.
                </Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(it) => it.id}
                style={{ maxHeight: 360 }}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: colors.border,
                    }}
                  />
                )}
                renderItem={({ item }) => {
                  const checked = value.includes(item.id);
                  return (
                    <View style={styles.row}>
                      <Pressable
                        onPress={() => toggle(item.id)}
                        hitSlop={6}
                        style={({ pressed }) => [
                          styles.checkbox,
                          {
                            borderColor: checked ? colors.primary : colors.border,
                            backgroundColor: checked
                              ? colors.primary
                              : "transparent",
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        {checked ? (
                          <Feather name="check" size={14} color="#fff" />
                        ) : null}
                      </Pressable>
                      <Pressable
                        onPress={() => toggle(item.id)}
                        style={({ pressed }) => [
                          { flex: 1, opacity: pressed ? 0.7 : 1 },
                        ]}
                      >
                        <Text
                          style={{
                            color: colors.foreground,
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 15,
                          }}
                        >
                          {item.name}
                        </Text>
                        {item.partNumber || item.location ? (
                          <Text
                            style={{
                              color: colors.mutedForeground,
                              fontFamily: "Inter_400Regular",
                              fontSize: 12,
                              marginTop: 2,
                            }}
                            numberOfLines={1}
                          >
                            {[item.partNumber, item.location]
                              .filter(Boolean)
                              .join(" · ")}
                          </Text>
                        ) : null}
                      </Pressable>
                      <Pressable
                        onPress={() => openItem(item.id)}
                        hitSlop={8}
                        style={({ pressed }) => [
                          styles.openBtn,
                          {
                            backgroundColor: colors.secondary,
                            opacity: pressed ? 0.7 : 1,
                          },
                        ]}
                      >
                        <Feather
                          name="external-link"
                          size={14}
                          color={colors.secondaryForeground}
                        />
                        <Text
                          style={{
                            color: colors.secondaryForeground,
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 12,
                          }}
                        >
                          View
                        </Text>
                      </Pressable>
                    </View>
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
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
    gap: 10,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 6,
    paddingBottom: 6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  openBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
});
