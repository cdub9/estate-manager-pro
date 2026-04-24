import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { TextField } from "@/components/TextField";
import {
  CATEGORY_COLORS,
  useCategories,
} from "@/contexts/CategoriesContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { Category } from "@/types";

export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, createCategory, updateCategory, deleteCategory } =
    useCategories();
  const { tasks, removeCategoryFromAll } = useTasks();

  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setName("");
    setColor(
      CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
    );
    setError(null);
    setCreating(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setColor(cat.color);
    setError(null);
    setCreating(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateCategory(editing.id, { name, color });
      } else {
        await createCategory(name, color);
      }
      setCreating(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(cat: Category) {
    const inUse = tasks.filter((t) => t.categoryId === cat.id).length;
    Alert.alert(
      `Delete "${cat.name}"?`,
      inUse > 0
        ? `${inUse} task${inUse === 1 ? "" : "s"} will be uncategorized.`
        : "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await removeCategoryFromAll(cat.id);
            await deleteCategory(cat.id);
          },
        },
      ],
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 24,
          gap: 8,
          flexGrow: 1,
        }}
        renderItem={({ item }) => {
          const inUse = tasks.filter((t) => t.categoryId === item.id).length;
          return (
            <Pressable
              onPress={() => openEdit(item)}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: item.color,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 15,
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {inUse} {inUse === 1 ? "task" : "tasks"}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync().catch(() => {});
                  }
                  confirmDelete(item);
                }}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconBtn,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </Pressable>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="tag"
            title="No categories yet"
            description="Group tasks by area, priority, or anything you like — by category."
          />
        }
      />

      <View
        style={[
          styles.fabWrap,
          {
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 16,
          },
        ]}
      >
        <Button
          title="Add category"
          onPress={openCreate}
          icon={<Feather name="plus" size={16} color="#fff" />}
          fullWidth
          size="lg"
        />
      </View>

      <Modal
        visible={creating}
        transparent
        animationType="fade"
        onRequestClose={() => setCreating(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setCreating(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                borderRadius: colors.radius,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 17,
              }}
            >
              {editing ? "Edit category" : "New category"}
            </Text>
            <TextField
              label="Name"
              value={name}
              onChangeText={(v) => {
                setName(v);
                setError(null);
              }}
              placeholder="e.g. Maintenance"
              autoCapitalize="words"
              error={error}
              autoFocus
            />
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                Color
              </Text>
              <View style={styles.colorRow}>
                {CATEGORY_COLORS.map((c) => {
                  const active = c === color;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setColor(c)}
                      style={({ pressed }) => [
                        styles.colorSwatch,
                        {
                          backgroundColor: c,
                          borderColor: active ? colors.foreground : "transparent",
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      {active ? (
                        <Feather name="check" size={16} color="#fff" />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.actions}>
              <Button
                title="Cancel"
                onPress={() => setCreating(false)}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <Button
                title={editing ? "Save" : "Create"}
                onPress={save}
                loading={saving}
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderWidth: 1,
  },
  iconBtn: {
    padding: 6,
  },
  fabWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 460,
    padding: 20,
    gap: 16,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
});
