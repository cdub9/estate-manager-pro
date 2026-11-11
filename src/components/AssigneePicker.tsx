import { Feather } from "@expo/vector-icons";
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

import { Avatar } from "@/components/Avatar";
import { useColors } from "@/hooks/useColors";
import { User } from "@/types";

interface Props {
  users: User[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function AssigneePicker({ users, value, onChange }: Props) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(value);

  function openModal() {
    setDraft(value);
    setOpen(true);
  }

  function toggleUser(id: string) {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleDone() {
    onChange(draft);
    setOpen(false);
  }

  function handleClearAll() {
    setDraft([]);
  }

  const selectedUsers = users.filter((u) => value.includes(u.id));

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          selectedUsers.length === 0
            ? "Unassigned"
            : selectedUsers.length === 1
            ? `Assigned to ${selectedUsers[0].name}`
            : `Assigned to ${selectedUsers.length} people`
        }
        onPress={openModal}
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
          {selectedUsers.length === 0 ? (
            <>
              <View style={[styles.unassigned, { borderColor: colors.border }]}>
                <Feather name="user" size={14} color={colors.mutedForeground} />
              </View>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 15 }}>
                Unassigned
              </Text>
            </>
          ) : selectedUsers.length === 1 ? (
            <>
              <Avatar user={selectedUsers[0]} size={28} />
              <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15 }}>
                {selectedUsers[0].name}
              </Text>
            </>
          ) : (
            <>
              <AvatarStack users={selectedUsers} />
              <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15 }}>
                {selectedUsers.length} people
              </Text>
            </>
          )}
        </View>
        <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={handleDone}>
        <Pressable style={styles.backdrop} onPress={handleDone}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: colors.card, borderRadius: colors.radius },
              Platform.OS === "web" ? { maxWidth: 420 } : {},
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                Assign to
              </Text>
              {draft.length > 0 && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear all assignees"
                  onPress={handleClearAll}
                  hitSlop={8}
                >
                  <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13 }}>
                    Clear all
                  </Text>
                </Pressable>
              )}
            </View>

            <FlatList
              data={users}
              keyExtractor={(u) => u.id}
              renderItem={({ item: u }) => {
                const selected = draft.includes(u.id);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityLabel={u.name}
                    accessibilityState={{ checked: selected }}
                    onPress={() => toggleUser(u.id)}
                    style={({ pressed }) => [
                      styles.row,
                      { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <Avatar user={u} size={32} />
                    <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 }}>
                      {u.name}
                    </Text>
                    {selected ? (
                      <Feather name="check" size={18} color={colors.primary} />
                    ) : (
                      <View style={[styles.emptyCheck, { borderColor: colors.border }]} />
                    )}
                  </Pressable>
                );
              }}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Done"
              onPress={handleDone}
              style={({ pressed }) => [
                styles.doneBtn,
                { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}>
                Done
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function AvatarStack({ users }: { users: User[] }) {
  const visible = users.slice(0, 3);
  return (
    <View style={styles.stack}>
      {visible.map((u, i) => (
        <View key={u.id} style={[styles.stackItem, { left: i * 18 }]}>
          <Avatar user={u} size={28} />
        </View>
      ))}
    </View>
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
  },
  stack: {
    flexDirection: "row",
    position: "relative",
    height: 28,
    width: 28 + 18 * 2,
  },
  stackItem: {
    position: "absolute",
  },
  unassigned: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
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
    gap: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sheetTitle: {
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  doneBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
});
