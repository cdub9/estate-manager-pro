import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

import { AssigneePicker } from "@/components/AssigneePicker";
import { Button } from "@/components/Button";
import { InventoryLinkPicker } from "@/components/InventoryLinkPicker";
import { PhotoGrid } from "@/components/PhotoGrid";
import { StatusSegmented } from "@/components/StatusSegmented";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";
import { TaskStatus } from "@/types";

const QUICK_DUE: { label: string; daysFromNow: number | null }[] = [
  { label: "None", daysFromNow: null },
  { label: "Today", daysFromNow: 0 },
  { label: "Tomorrow", daysFromNow: 1 },
  { label: "In 1 week", daysFromNow: 7 },
];

function dueDateAtDays(days: number | null): number | null {
  if (days === null) return null;
  const d = new Date();
  d.setHours(17, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export default function NewTaskScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { users, currentUser } = useAuth();
  const { items } = useInventory();
  const { createTask } = useTasks();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("open");
  const [assigneeId, setAssigneeId] = useState<string | null>(
    currentUser?.id ?? null,
  );
  const [photos, setPhotos] = useState<string[]>([]);
  const [inventoryIds, setInventoryIds] = useState<string[]>([]);
  const [dueDays, setDueDays] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!currentUser) return;
    if (!title.trim()) {
      setError("Give the task a title");
      return;
    }
    setSubmitting(true);
    try {
      await createTask({
        title,
        description,
        status,
        assigneeId,
        createdById: currentUser.id,
        dueDate: dueDateAtDays(dueDays),
        photos,
        inventoryIds,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create task");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
        gap: 16,
      }}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      <TextField
        label="Title"
        value={title}
        onChangeText={(v) => {
          setTitle(v);
          setError(null);
        }}
        placeholder="e.g. Service the tractor"
        error={error}
      />

      <TextField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Notes, instructions, parts needed…"
        multiline
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
        <AssigneePicker
          users={users}
          value={assigneeId}
          onChange={setAssigneeId}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
          Due date
        </Text>
        <View style={styles.chipRow}>
          {QUICK_DUE.map((opt) => {
            const active = dueDays === opt.daysFromNow;
            return (
              <Pressable
                key={opt.label}
                onPress={() => setDueDays(opt.daysFromNow)}
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
        </View>
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

      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <Button
          title="Create task"
          onPress={handleCreate}
          loading={submitting}
          icon={<Feather name="check" size={16} color="#fff" />}
          style={{ flex: 1 }}
        />
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 13 },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 8 },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
});
