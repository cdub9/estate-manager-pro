import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { Recurrence, Task, TaskStatus } from "@/types";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { users } = useAuth();
  const { tasks, updateTask, deleteTask } = useTasks();
  const { categories } = useCategories();
  const { items } = useInventory();

  const task = tasks.find((t) => t.id === id) ?? null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("open");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<number | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [inventoryIds, setInventoryIds] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<Recurrence>("none");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialTask = useRef<Task | null>(null);

  useEffect(() => {
    if (!task) return;
    // Only reset form when the task object identity changes (new task loaded)
    if (initialTask.current?.id === task.id) return;
    initialTask.current = task;
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setAssigneeId(task.assigneeId);
    setDueDate(task.dueDate);
    setPhotos(task.photos);
    setInventoryIds(task.inventoryIds);
    setCategoryId(task.categoryId);
    setRecurrence(task.recurrence);
  }, [task]);

  const isDirty = task !== null && (
    title !== task.title ||
    description !== task.description ||
    status !== task.status ||
    assigneeId !== task.assigneeId ||
    dueDate !== task.dueDate ||
    categoryId !== task.categoryId ||
    recurrence !== task.recurrence ||
    photos.length !== task.photos.length ||
    photos.some((p, i) => p !== task.photos[i]) ||
    inventoryIds.length !== task.inventoryIds.length ||
    inventoryIds.some((id, i) => id !== task.inventoryIds[i])
  );

  function handleBack() {
    if (isDirty) {
      Alert.alert("Discard changes?", "You have unsaved changes.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  }

  async function handleSave() {
    if (!task) return;
    if (!title.trim()) {
      Alert.alert("Required", "Task title cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        assigneeId,
        dueDate,
        photos,
        inventoryIds,
        categoryId,
        recurrence,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!task) return;
    Alert.alert("Delete task", `Delete "${task.title}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTask(task.id);
          router.back();
        },
      },
    ]);
  }

  if (!task) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Task not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
          Edit Task
        </Text>
        <View style={styles.headerRight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete task"
            onPress={handleDelete}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}
          >
            <Feather name="trash-2" size={20} color={colors.destructive} />
          </Pressable>
          <Button title="Save" onPress={handleSave} loading={saving} size="sm" disabled={!isDirty} />
        </View>
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
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Assignee</Text>
          <AssigneePicker users={users} value={assigneeId} onChange={setAssigneeId} />
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
            onAdd={(uri) => setPhotos((p) => [...p, uri])}
            onRemove={(uri) => setPhotos((p) => p.filter((x) => x !== uri))}
          />
        </View>

        {task.completedAt && (
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" }}>
            Completed {formatDate(task.completedAt)}
          </Text>
        )}
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
    flex: 1,
    marginHorizontal: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
