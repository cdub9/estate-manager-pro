import { Feather } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

import { AssigneePicker } from "@/components/AssigneePicker";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { CategoryPicker } from "@/components/CategoryPicker";
import { DatePickerModal } from "@/components/DatePickerModal";
import { InventoryLinkPicker } from "@/components/InventoryLinkPicker";
import { PhotoGrid } from "@/components/PhotoGrid";
import { RecurrencePicker } from "@/components/RecurrencePicker";
import { StatusSegmented } from "@/components/StatusSegmented";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { Recurrence, TaskStatus } from "@/types";

const QUICK_DUE: { label: string; daysFromNow: number | null }[] = [
  { label: "None", daysFromNow: null },
  { label: "Today", daysFromNow: 0 },
  { label: "Tomorrow", daysFromNow: 1 },
  { label: "1 week", daysFromNow: 7 },
];

function dueDateAtDays(days: number | null): number | null {
  if (days === null) return null;
  const d = new Date();
  d.setHours(17, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function matchesQuickOption(
  due: number | null,
  daysFromNow: number | null,
): boolean {
  if (due === null && daysFromNow === null) return true;
  if (due === null || daysFromNow === null) return false;
  const expected = dueDateAtDays(daysFromNow);
  if (expected === null) return false;
  return startOfDay(due) === startOfDay(expected);
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, updateTask, deleteTask } = useTasks();
  const { users } = useAuth();
  const { items } = useInventory();
  const { categories } = useCategories();

  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "open");
  const [assigneeId, setAssigneeId] = useState<string | null>(task?.assigneeId ?? null);
  const [photos, setPhotos] = useState<string[]>(task?.photos ?? []);
  const [inventoryIds, setInventoryIds] = useState<string[]>(task?.inventoryIds ?? []);
  const [categoryId, setCategoryId] = useState<string | null>(task?.categoryId ?? null);
  const [recurrence, setRecurrence] = useState<Recurrence>(task?.recurrence ?? "none");
  const [dueDate, setDueDate] = useState<number | null>(task?.dueDate ?? null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setAssigneeId(task.assigneeId);
    setPhotos(task.photos);
    setInventoryIds(task.inventoryIds);
    setCategoryId(task.categoryId);
    setRecurrence(task.recurrence);
    setDueDate(task.dueDate);
  }, [task?.id]);

  const dirty = useMemo(() => {
    if (!task) return false;
    return (
      task.title !== title.trim() ||
      task.description !== description.trim() ||
      task.status !== status ||
      task.assigneeId !== assigneeId ||
      task.categoryId !== categoryId ||
      task.recurrence !== recurrence ||
      JSON.stringify(task.photos) !== JSON.stringify(photos) ||
      JSON.stringify(task.inventoryIds) !== JSON.stringify(inventoryIds) ||
      (task.dueDate ?? null) !== (dueDate ?? null)
    );
  }, [
    task,
    title,
    description,
    status,
    assigneeId,
    categoryId,
    recurrence,
    photos,
    inventoryIds,
    dueDate,
  ]);

  if (!task) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={28} color={colors.mutedForeground} />
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            marginTop: 12,
          }}
        >
          Task not found
        </Text>
        <Button
          title="Go back"
          onPress={() => router.back()}
          variant="secondary"
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }

  const creator = users.find((u) => u.id === task.createdById);

  async function save() {
    if (!task) return;
    if (!title.trim()) {
      Alert.alert("Title required");
      return;
    }
    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      status,
      assigneeId,
      photos,
      inventoryIds,
      categoryId,
      recurrence,
      dueDate,
    });
    router.back();
  }

  function confirmDelete() {
    Alert.alert("Delete task?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTask(task!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Task",
          headerRight: () => (
            <Pressable onPress={confirmDelete} hitSlop={10}>
              <Feather name="trash-2" size={20} color={colors.destructive} />
            </Pressable>
          ),
        }}
      />
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) + 80,
          gap: 16,
        }}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        <TextField label="Title" value={title} onChangeText={setTitle} />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          placeholder="Notes, instructions, parts needed…"
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Status
          </Text>
          <StatusSegmented value={status} onChange={setStatus} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Assigned to
          </Text>
          <AssigneePicker users={users} value={assigneeId} onChange={setAssigneeId} />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Category
          </Text>
          <CategoryPicker
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Due date
          </Text>
          <View style={styles.chipRow}>
            {QUICK_DUE.map((opt) => {
              const active = matchesQuickOption(dueDate, opt.daysFromNow);
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setDueDate(dueDateAtDays(opt.daysFromNow))}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: active ? colors.primary : colors.secondary,
                      borderRadius: 999,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? "#fff" : colors.secondaryForeground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
            {(() => {
              const isCustom =
                dueDate !== null &&
                !QUICK_DUE.some((o) => matchesQuickOption(dueDate, o.daysFromNow));
              return (
                <Pressable
                  onPress={() => setDatePickerOpen(true)}
                  style={({ pressed }) => [
                    styles.chip,
                    styles.calendarChip,
                    {
                      backgroundColor: isCustom ? colors.primary : colors.secondary,
                      borderRadius: 999,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Feather
                    name="calendar"
                    size={13}
                    color={isCustom ? "#fff" : colors.secondaryForeground}
                  />
                  <Text
                    style={{
                      color: isCustom ? "#fff" : colors.secondaryForeground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                    }}
                  >
                    {isCustom && dueDate !== null
                      ? formatDate(dueDate)
                      : "Pick date"}
                  </Text>
                </Pressable>
              );
            })()}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Repeats
          </Text>
          <RecurrencePicker value={recurrence} onChange={setRecurrence} />
          {recurrence !== "none" ? (
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 12,
              }}
            >
              A new task will be created automatically when this one is completed.
            </Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Linked equipment
          </Text>
          <InventoryLinkPicker
            items={items}
            value={inventoryIds}
            onChange={setInventoryIds}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
            Photos
          </Text>
          <PhotoGrid photos={photos} onChange={setPhotos} />
        </View>

        <View
          style={[
            styles.metaCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={styles.metaRow}>
            <Feather name="user" size={14} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
              }}
            >
              Created by
            </Text>
            <View style={{ flex: 1 }} />
            {creator ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Avatar user={creator} size={20} />
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                  }}
                >
                  {creator.name}
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                Unknown
              </Text>
            )}
          </View>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={14} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                fontSize: 13,
              }}
            >
              Created
            </Text>
            <View style={{ flex: 1 }} />
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_500Medium",
                fontSize: 13,
              }}
            >
              {formatDate(task.createdAt)}
            </Text>
          </View>
          {task.completedAt ? (
            <View style={styles.metaRow}>
              <Feather name="check-circle" size={14} color={colors.mutedForeground} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                }}
              >
                Completed
              </Text>
              <View style={{ flex: 1 }} />
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                }}
              >
                {formatDate(task.completedAt)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            title="Save changes"
            onPress={save}
            disabled={!dirty}
            icon={<Feather name="check" size={16} color="#fff" />}
            style={{ flex: 1 }}
          />
        </View>

        <DatePickerModal
          visible={datePickerOpen}
          value={dueDate}
          onClose={() => setDatePickerOpen(false)}
          onSelect={(ts) => setDueDate(ts)}
          onClear={() => setDueDate(null)}
        />
      </KeyboardAwareScrollViewCompat>
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 13 },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 8 },
  calendarChip: { flexDirection: "row", alignItems: "center", gap: 6 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  metaCard: {
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
