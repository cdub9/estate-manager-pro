import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { MaintenanceDraft, MaintenanceForm } from "@/components/MaintenanceForm";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useMaintenance } from "@/contexts/MaintenanceContext";
import { useColors } from "@/hooks/useColors";
import { addInterval } from "@/utils/maintenance";

function todayNoon(): number {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.getTime();
}

export default function NewMaintenanceScreen() {
  const colors = useColors();
  const router = useRouter();
  const { currentUser, users } = useAuth();
  const { categories } = useCategories();
  const { items } = useInventory();
  const { createSchedule } = useMaintenance();

  const [draft, setDraft] = useState<MaintenanceDraft>({
    title: "",
    subject: "",
    inventoryId: null,
    intervalCount: "1",
    intervalUnit: "month",
    anchor: "completion",
    assigneeIds: currentUser ? [currentUser.id] : [],
    categoryId: null,
    nextDue: addInterval(todayNoon(), 1, "month"),
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  // Auto-derive "Next due" from the interval until the user picks a date manually.
  const dueTouched = useRef(false);

  function handleChange(patch: Partial<MaintenanceDraft>) {
    setDraft((d) => {
      const next = { ...d, ...patch };
      if (patch.nextDue !== undefined) dueTouched.current = true;
      if ((patch.intervalCount !== undefined || patch.intervalUnit !== undefined) && !dueTouched.current) {
        const count = Math.max(1, parseInt(next.intervalCount || "1", 10) || 1);
        next.nextDue = addInterval(todayNoon(), count, next.intervalUnit);
      }
      return next;
    });
  }

  const isDirty =
    draft.title.trim().length > 0 ||
    draft.subject.trim().length > 0 ||
    draft.inventoryId !== null ||
    draft.notes.trim().length > 0;

  function handleBack() {
    if (isDirty) {
      Alert.alert("Discard schedule?", "You have unsaved changes.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  }

  async function handleSave() {
    if (!draft.title.trim()) {
      Alert.alert("Required", "Add a task name (e.g. 'Replace HVAC filter').");
      return;
    }
    const count = Math.max(1, parseInt(draft.intervalCount || "1", 10) || 1);
    setSaving(true);
    try {
      await createSchedule({
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
          New Schedule
        </Text>
        <Button title="Save" onPress={handleSave} loading={saving} size="sm" />
      </View>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.container}
      >
        <MaintenanceForm
          draft={draft}
          onChange={handleChange}
          users={users}
          items={items}
          categories={categories}
        />
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
  },
  container: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
});
