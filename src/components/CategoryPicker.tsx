import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CategoryBadge } from "@/components/CategoryBadge";
import { useColors } from "@/hooks/useColors";
import { Category } from "@/types";

interface Props {
  categories: Category[];
  value: string | null;
  onChange: (id: string | null) => void;
}

export function CategoryPicker({ categories, value, onChange }: Props) {
  const colors = useColors();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value) ?? null;

  const data: (Category | null)[] = [null, ...categories];

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selected ? `Category: ${selected.name}` : "No category"}
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
          {selected ? (
            <CategoryBadge category={selected} size="md" />
          ) : (
            <>
              <View style={[styles.emptyDot, { borderColor: colors.border }]} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                }}
              >
                No category
              </Text>
            </>
          )}
        </View>
        <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
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
            <Text
              style={[
                styles.sheetTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Category
            </Text>
            <FlatList
              data={data}
              keyExtractor={(c) => c?.id ?? "__none__"}
              style={{ maxHeight: 360 }}
              renderItem={({ item: c }) =>
                c === null ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="No category"
                    onPress={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.row,
                      { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={[styles.emptyDot, { borderColor: colors.border }]} />
                    <Text
                      style={{
                        color: colors.foreground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 15,
                        flex: 1,
                      }}
                    >
                      No category
                    </Text>
                    {value === null ? (
                      <Feather name="check" size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={c.name}
                    accessibilityState={{ selected: value === c.id }}
                    onPress={() => {
                      onChange(c.id);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.row,
                      { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: c.color,
                      }}
                    />
                    <Text
                      style={{
                        color: colors.foreground,
                        fontFamily: "Inter_500Medium",
                        fontSize: 15,
                        flex: 1,
                      }}
                    >
                      {c.name}
                    </Text>
                    {value === c.id ? (
                      <Feather name="check" size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                )
              }
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Manage categories"
              onPress={() => {
                setOpen(false);
                router.push("/categories");
              }}
              style={({ pressed }) => [
                styles.manageBtn,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Feather name="settings" size={14} color={colors.secondaryForeground} />
              <Text
                style={{
                  color: colors.secondaryForeground,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 13,
                }}
              >
                Manage categories
              </Text>
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
  emptyDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderStyle: "dashed",
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
    gap: 8,
  },
  sheetTitle: {
    fontSize: 15,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    marginTop: 4,
  },
});
