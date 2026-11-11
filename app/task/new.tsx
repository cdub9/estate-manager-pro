import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AssigneePicker } from "@/components/AssigneePicker";
import { Button } from "@/components/Button";
import { CategoryPicker } from "@/components/CategoryPicker";
import { DatePickerModal } from "@/components/DatePickerModal";
import { InventoryLinkPicker } from "@/components/InventoryLinkPicker";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { PhotoGrid } from "@/components/PhotoGrid";
import { RecurrencePicker } from "@/components/RecurrencePicker";
import { StatusSegmented } from "@/components/StatusSegmented";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/utils/dates";
import { Recurrence, TaskStatus } from "@/types";

export default function NewTaskScreen() {
  const colors = useColors();
  const router = useRouter();
  const { currentUser, users } = useAuth();
  const { createTask } = useTasks();
  const { categories } = useCategories();
  const { items } = useInventory();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("open");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(currentUser ? [currentUser.id] : []);
  const [dueDate, setDueDate] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [inventoryIds, setInventoryIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty =
    title.trim().length > 0 ||
    description.trim().length > 0 ||
    dueDate !== null ||
    photos.length > 0 ||
    inventoryIds.length > 0 ||
    categoryId !== null;

  function handleBack() {
    if (isDirty) {
      Alert.alert("Discard task?", "You have unsaved changes.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert("Required", "Task title cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        assigneeIds,
        dueDate,
        photos,
        inventoryIds,
        categoryId,
        recurrence,
      });
      router.back();
    } catch (err) {
      console.error("Task save failed:", err);
      Alert.alert("Couldn't save task", "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          onPress={handleBack}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>Cancel</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          New Task
        </Text>
        <Button title="Save" onPress={handleSave} loading={saving} size="sm" />
      </View>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.container}
      >
        <TextField
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Task title"
          autoFocus
        />

        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Add details…"
          multiline
          numberOfLines={3}
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Status</Text>
          <StatusSegmented value={status} onChange={setStatus} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Assignees</Text>
          <AssigneePicker users={users} value={assigneeIds} onChange={setAssigneeIds} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Due date</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={dueDate ? `Due date: ${formatDate(dueDate)}` : "Set due date"}
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => [
              styles.dateField,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Feather name="calendar" size={16} color={colors.mutedForeground} />
            <Text
              style={{
                color: dueDate ? colors.foreground : colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                flex: 1,
              }}
            >
              {dueDate ? formatDate(dueDate) : "No due date"}
            </Text>
            {dueDate && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear due date"
                onPress={() => setDueDate(null)}
                hitSlop={8}
              >
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Recurrence</Text>
          <RecurrencePicker value={recurrence} onChange={setRecurrence} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Category</Text>
          <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Inventory</Text>
          <InventoryLinkPicker items={items} value={inventoryIds} onChange={setInventoryIds} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Photos</Text>
          <PhotoGrid
            photos={photos}
            onAdd={(uris) => setPhotos((p) => [...p, ...uris])}
            onRemove={(uri) => setPhotos((p) => p.filter((x) => x !== uri))}
          />
        </View>
      </KeyboardAwareScrollViewCompat>

      <DatePickerModal
        visible={showDatePicker}
        value={dueDate}
        onConfirm={(ts) => { setDueDate(ts); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />
    </>
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
  headerTitle: {
    fontSize: 16,
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
  },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 48,
    gap: 10,
  },
});
