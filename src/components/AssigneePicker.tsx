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
  value: string | null;
  onChange: (id: string | null) => void;
}

export function AssigneePicker({ users, value, onChange }: Props) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const selected = users.find((u) => u.id === value) ?? null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selected ? `Assigned to ${selected.name}` : "Unassigned"}
        onPress={() => setOpen(true)}
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
          {selected ? (
            <>
              <Avatar user={selected} size={28} />
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                }}
              >
                {selected.name}
              </Text>
            </>
          ) : (
            <>
              <View style={[styles.unassigned, { borderColor: colors.border }]}>
                <Feather name="user" size={14} color={colors.mutedForeground} />
              </View>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                  fontSize: 15,
                }}
              >
                Unassigned
              </Text>
            </>
          )}
        </View>
        <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
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
            <Text
              style={[
                styles.sheetTitle,
                { color: colors.foreground, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Assign to
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Unassigned"
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
              style={({ pressed }) => [
                styles.row,
                { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.unassigned, { borderColor: colors.border }]}>
                <Feather name="user-x" size={14} color={colors.mutedForeground} />
              </View>
              <Text
                style={{
                  color: colors.foreground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  flex: 1,
                }}
              >
                Unassigned
              </Text>
              {value === null ? (
                <Feather name="check" size={18} color={colors.primary} />
              ) : null}
            </Pressable>
            <FlatList
              data={users}
              keyExtractor={(u) => u.id}
              renderItem={({ item: u }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={u.name}
                  accessibilityState={{ selected: value === u.id }}
                  onPress={() => {
                    onChange(u.id);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.border },
                  ]}
                >
                  <Avatar user={u} size={32} />
                  <Text
                    style={{
                      color: colors.foreground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 15,
                      flex: 1,
                    }}
                  >
                    {u.name}
                  </Text>
                  {value === u.id ? (
                    <Feather name="check" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
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
  unassigned: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
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
  },
  sheetTitle: {
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
