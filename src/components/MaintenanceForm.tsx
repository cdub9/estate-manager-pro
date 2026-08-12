import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AssigneePicker } from "@/components/AssigneePicker";
import { CategoryPicker } from "@/components/CategoryPicker";
import { DatePickerModal } from "@/components/DatePickerModal";
import { InventorySelect } from "@/components/InventorySelect";
import { TextField } from "@/components/TextField";
import { useColors } from "@/hooks/useColors";
import {
  Category,
  InventoryItem,
  MaintenanceAnchor,
  MaintenanceIntervalUnit,
  User,
} from "@/types";
import { formatDate } from "@/utils/dates";

export interface MaintenanceDraft {
  title: string;
  subject: string;
  inventoryId: string | null;
  intervalCount: string; // kept as text for the numeric input
  intervalUnit: MaintenanceIntervalUnit;
  anchor: MaintenanceAnchor;
  assigneeIds: string[];
  categoryId: string | null;
  nextDue: number;
  notes: string;
}

const UNITS: { value: MaintenanceIntervalUnit; label: string }[] = [
  { value: "day", label: "Days" },
  { value: "week", label: "Weeks" },
  { value: "month", label: "Months" },
  { value: "year", label: "Years" },
];

const ANCHORS: { value: MaintenanceAnchor; label: string; hint: string }[] = [
  { value: "completion", label: "From completion", hint: "Next due is measured from when you last log it as serviced." },
  { value: "calendar", label: "Fixed calendar", hint: "Next due advances on a fixed schedule regardless of when it's done." },
];

interface Props {
  draft: MaintenanceDraft;
  onChange: (patch: Partial<MaintenanceDraft>) => void;
  users: User[];
  items: InventoryItem[];
  categories: Category[];
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked: active }}
      onPress={onPress}
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
        {label}
      </Text>
    </Pressable>
  );
}

export function MaintenanceForm({ draft, onChange, users, items, categories }: Props) {
  const colors = useColors();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const anchorHint = ANCHORS.find((a) => a.value === draft.anchor)?.hint ?? "";

  return (
    <>
      <TextField
        label="Task"
        value={draft.title}
        onChangeText={(t) => onChange({ title: t })}
        placeholder="e.g. Replace HVAC filter, Mow the lawn"
      />

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Applies to
        </Text>
        <InventorySelect
          items={items}
          value={draft.inventoryId}
          onChange={(id) => onChange({ inventoryId: id })}
        />
        {draft.inventoryId === null && (
          <TextField
            label=""
            value={draft.subject}
            onChangeText={(t) => onChange({ subject: t })}
            placeholder="Or name what this covers, e.g. 'Front lawn'"
          />
        )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Repeat every
        </Text>
        <View style={styles.intervalRow}>
          <TextInput
            accessibilityLabel="Interval count"
            value={draft.intervalCount}
            onChangeText={(t) => onChange({ intervalCount: t.replace(/[^0-9]/g, "") })}
            keyboardType="number-pad"
            maxLength={4}
            style={[
              styles.countInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
              },
            ]}
          />
          <View style={styles.chipWrap}>
            {UNITS.map((u) => (
              <Chip
                key={u.value}
                label={u.label}
                active={draft.intervalUnit === u.value}
                onPress={() => onChange({ intervalUnit: u.value })}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Schedule basis
        </Text>
        <View style={styles.chipWrap}>
          {ANCHORS.map((a) => (
            <Chip
              key={a.value}
              label={a.label}
              active={draft.anchor === a.value}
              onPress={() => onChange({ anchor: a.value })}
            />
          ))}
        </View>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 }}>
          {anchorHint}
        </Text>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          Next due
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Next due: ${formatDate(draft.nextDue)}`}
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
          <Text style={{ color: colors.foreground, fontFamily: "Inter_400Regular", fontSize: 15, flex: 1 }}>
            {formatDate(draft.nextDue)}
          </Text>
        </Pressable>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Assignees</Text>
        <AssigneePicker users={users} value={draft.assigneeIds} onChange={(ids) => onChange({ assigneeIds: ids })} />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Category</Text>
        <CategoryPicker categories={categories} value={draft.categoryId} onChange={(id) => onChange({ categoryId: id })} />
      </View>

      <TextField
        label="Notes"
        value={draft.notes}
        onChangeText={(t) => onChange({ notes: t })}
        placeholder="Parts, steps, or details…"
        multiline
        numberOfLines={3}
      />

      <DatePickerModal
        visible={showDatePicker}
        value={draft.nextDue}
        onConfirm={(ts) => { onChange({ nextDue: ts }); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countInput: {
    width: 64,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: "center",
    minHeight: 48,
  },
  chipWrap: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    flex: 1,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
