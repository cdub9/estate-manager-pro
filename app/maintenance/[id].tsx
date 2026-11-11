import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { MaintenanceDraft, MaintenanceForm } from "@/components/MaintenanceForm";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useMaintenance } from "@/contexts/MaintenanceContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { MaintenanceSchedule } from "@/types";
import { formatDate } from "@/utils/dates";
import { dueState, formatDueLabel } from "@/utils/maintenance";

function toDraft(s: MaintenanceSchedule): MaintenanceDraft {
  return {
    title: s.title,
    subject: s.subject,
    inventoryId: s.inventoryId,
    intervalCount: String(s.intervalCount),
    intervalUnit: s.intervalUnit,
    anchor: s.anchor,
    assigneeIds: s.assigneeIds,
    categoryId: s.categoryId,
    nextDue: s.nextDue,
    notes: s.notes,
  };
}

export default function MaintenanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { users } = useAuth();
  const { categories } = useCategories();
  const { items } = useInventory();
  const { getScheduleById, updateSchedule, markServiced, deleteSchedule } = useMaintenance();
  const { createTask } = useTasks();

  const schedule = getScheduleById(id ?? "");

  const [draft, setDraft] = useState<MaintenanceDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const seededId = useRef<string | null>(null);

  useEffect(() => {
    if (!schedule) return;
    if (seededId.current === schedule.id) return;
    seededId.current = schedule.id;
    setDraft(toDraft(schedule));
  }, [schedule]);

  function handleChange(patch: Partial<MaintenanceDraft>) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  const isDirty =
    !!schedule &&
    !!draft &&
    (draft.title !== schedule.title ||
      draft.subject !== schedule.subject ||
      draft.inventoryId !== schedule.inventoryId ||
      (parseInt(draft.intervalCount || "1", 10) || 1) !== schedule.intervalCount ||
      draft.intervalUnit !== schedule.intervalUnit ||
      draft.anchor !== schedule.anchor ||
      draft.nextDue !== schedule.nextDue ||
      draft.notes !== schedule.notes ||
      draft.categoryId !== schedule.categoryId ||
      JSON.stringify(draft.assigneeIds) !== JSON.stringify(schedule.assigneeIds));

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
    if (!schedule || !draft) return;
    if (!draft.title.trim()) {
      Alert.alert("Required", "Task name cannot be empty.");
      return;
    }
    const count = Math.max(1, parseInt(draft.intervalCount || "1", 10) || 1);
    setSaving(true);
    try {
      await updateSchedule(schedule.id, {
        title: draft.title.trim(),
        subject: draft.subject.trim(),
        inventoryId: draft.inventoryId,
        intervalUnit: draft.intervalUnit,
        intervalCount: count,
        anchor: draft.anchor,
        assigneeIds: draft.assigneeIds,
        categoryId: draft.categoryId,
        nextDue: draft.nextDue,
        notes: draft.notes.trim(),
      });
      router.back();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save.";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  }

  function handleMarkServiced() {
    if (!schedule) return;
    Alert.alert("Log service", `Mark "${schedule.title}" as serviced today and roll the next due date forward?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark serviced",
        onPress: async () => {
          await markServiced(schedule.id);
          router.back();
        },
      },
    ]);
  }

  async function handleCreateTask() {
    if (!schedule) return;
    try {
      await createTask({
        title: schedule.title,
        description: schedule.notes,
        assigneeIds: schedule.assigneeIds,
        dueDate: schedule.nextDue,
        inventoryIds: schedule.inventoryId ? [schedule.inventoryId] : [],
        categoryId: schedule.categoryId,
      });
      Alert.alert("Task created", "Added to your task list for this maintenance.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create task.";
      Alert.alert("Error", msg);
    }
  }

  function handleTogglePause() {
    if (!schedule) return;
    updateSchedule(schedule.id, { active: !schedule.active });
  }

  function handleDelete() {
    if (!schedule) return;
    Alert.alert("Delete schedule", `Delete "${schedule.title}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteSchedule(schedule.id);
          router.back();
        },
      },
    ]);
  }

  if (!schedule || !draft) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Schedule not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const state = dueState(schedule.nextDue);
  const bannerColor = !schedule.active
    ? colors.mutedForeground
    : state === "overdue"
    ? colors.destructive
    : state === "due_soon"
    ? colors.goldDeep
    : colors.success;

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
        <Text
          style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          numberOfLines={1}
        >
          {schedule.title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete schedule"
          onPress={handleDelete}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4, marginRight: 32 })}
        >
          <Feather name="trash-2" size={20} color={colors.destructive} />
        </Pressable>
        <Button title="Save" onPress={handleSave} loading={saving} size="sm" disabled={!isDirty} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.container}
      >
        {/* Status banner */}
        <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: bannerColor, fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
              {schedule.active ? formatDueLabel(schedule.nextDue) : "Paused"}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12.5, marginTop: 2 }}>
              Next due {formatDate(schedule.nextDue)}
              {schedule.lastCompletedAt ? `  ·  Last serviced ${formatDate(schedule.lastCompletedAt)}` : "  ·  Never serviced"}
            </Text>
          </View>
        </View>

        {/* Primary actions */}
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mark serviced"
            onPress={handleMarkServiced}
            style={({ pressed }) => [
              styles.serviceBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="check-circle" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Mark serviced</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create a task for this maintenance"
            onPress={handleCreateTask}
            style={({ pressed }) => [
              styles.taskBtn,
              { borderColor: colors.goldHair, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="plus" size={16} color={colors.goldDeep} />
            <Text style={{ color: colors.goldDeep, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Create task</Text>
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.borderSoft }]} />

        <MaintenanceForm
          draft={draft}
          onChange={handleChange}
          users={users}
          items={items}
          categories={categories}
        />

        {/* Pause / resume */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={schedule.active ? "Pause this schedule" : "Resume this schedule"}
          onPress={handleTogglePause}
          style={({ pressed }) => [
            styles.pauseBtn,
            { borderColor: colors.mutedForeground, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name={schedule.active ? "pause-circle" : "play-circle"} size={15} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
            {schedule.active ? "Pause schedule" : "Resume schedule"}
          </Text>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
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
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  serviceBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
  },
  taskBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderWidth: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  pauseBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 8,
  },
});
