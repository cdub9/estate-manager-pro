import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { CategoryBadge } from "@/components/CategoryBadge";
import { CATEGORY_COLORS } from "@/constants/colors";
import { useCategories } from "@/contexts/CategoriesContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { Category } from "@/types";

export default function CategoriesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { tasks } = useTasks();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formColor, setFormColor] = useState(CATEGORY_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [formDirty, setFormDirty] = useState(false);

  const useCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of tasks) {
      if (t.categoryId) map[t.categoryId] = (map[t.categoryId] ?? 0) + 1;
    }
    return map;
  }, [tasks]);

  function openNew() {
    setEditing(null);
    setFormName("");
    setFormColor(CATEGORY_COLORS[0]);
    setFormDirty(false);
    setModalVisible(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setFormName(cat.name);
    setFormColor(cat.color);
    setFormDirty(false);
    setModalVisible(true);
  }

  function handleCloseModal() {
    if (formDirty) {
      Alert.alert("Discard changes?", "You have unsaved changes.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => setModalVisible(false) },
      ]);
    } else {
      setModalVisible(false);
    }
  }

  async function handleSave() {
    if (!formName.trim()) {
      Alert.alert("Required", "Category name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const result = await updateCategory(editing.id, { name: formName.trim(), color: formColor });
        if (!result.ok) {
          Alert.alert("Error", result.error ?? "Could not update category.");
          return;
        }
      } else {
        const result = await addCategory(formName.trim(), formColor);
        if (!result.ok) {
          Alert.alert("Error", result.error ?? "Could not create category.");
          return;
        }
      }
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(cat: Category) {
    const count = useCounts[cat.id] ?? 0;
    const msg = count > 0
      ? `"${cat.name}" is used by ${count} task${count !== 1 ? "s" : ""}. Tasks will have no category after deletion.`
      : `Delete "${cat.name}"?`;
    Alert.alert("Delete category", msg, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteCategory(cat.id),
      },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Categories
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New category"
          onPress={openNew}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary, borderRadius: 99, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        renderItem={({ item: cat }) => {
          const count = useCounts[cat.id] ?? 0;
          return (
            <View
              style={[
                styles.row,
                { backgroundColor: colors.card, borderRadius: colors.radius },
              ]}
            >
              <CategoryBadge category={cat} size="md" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15 }}>
                  {cat.name}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                  {count} task{count !== 1 ? "s" : ""}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${cat.name}`}
                onPress={() => openEdit(cat)}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}
              >
                <Feather name="edit-2" size={16} color={colors.mutedForeground} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Delete ${cat.name}`}
                onPress={() => confirmDelete(cat)}
                hitSlop={8}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}
              >
                <Feather name="trash-2" size={16} color={colors.destructive} />
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="tag" size={36} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 15, marginTop: 12 }}>
              No categories yet
            </Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 }}>
              Tap + to create one
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.backdrop} onPress={handleCloseModal}>
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
              {editing ? "Edit category" : "New category"}
            </Text>

            <TextInput
              accessibilityLabel="Category name"
              value={formName}
              onChangeText={(v) => { setFormName(v); setFormDirty(true); }}
              placeholder="Category name"
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              style={[
                styles.nameInput,
                {
                  backgroundColor: colors.secondary,
                  borderRadius: colors.radius,
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                },
              ]}
            />

            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13, marginTop: 4 }}>
              Color
            </Text>
            <View style={styles.colorGrid}>
              {CATEGORY_COLORS.map((c) => (
                <Pressable
                  key={c}
                  accessibilityRole="radio"
                  accessibilityLabel={`Color ${c}`}
                  accessibilityState={{ checked: formColor === c }}
                  onPress={() => { setFormColor(c); setFormDirty(true); }}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    formColor === c && styles.colorSwatchSelected,
                  ]}
                >
                  {formColor === c && <Feather name="check" size={14} color="#fff" />}
                </Pressable>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                onPress={handleCloseModal}
                style={({ pressed }) => [
                  styles.btn,
                  { backgroundColor: colors.secondary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={{ color: colors.secondaryForeground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={editing ? "Save changes" : "Create category"}
                onPress={handleSave}
                disabled={saving}
                style={({ pressed }) => [
                  styles.btn,
                  { flex: 1, backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed || saving ? 0.85 : 1 },
                ]}
              >
                <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                  {editing ? "Save" : "Create"}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  title: {
    fontSize: 22,
    flex: 1,
  },
  addBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
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
    padding: 20,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 16,
  },
  nameInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  colorGrid: {
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
  },
  colorSwatchSelected: {
    borderWidth: 2.5,
    borderColor: "#fff",
  },
  btn: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
});
