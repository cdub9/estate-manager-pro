import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { InventoryGuess } from "@/utils/identifyInventory";

interface Props {
  visible: boolean;
  results: InventoryGuess[];
  onConfirm: (selected: InventoryGuess[]) => void;
  onCancel: () => void;
}

interface Row {
  guess: InventoryGuess;
  selected: boolean;
  name: string;
}

/**
 * Review sheet shown when AI identification finds more than one item in a
 * photo. Every detected item is checked by default; the user can uncheck
 * false positives and edit names inline before adding them.
 */
export function IdentifyResultsSheet({ visible, results, onConfirm, onCancel }: Props) {
  const colors = useColors();
  const [rows, setRows] = useState<Row[]>([]);

  // Re-seed whenever a new set of results comes in.
  useEffect(() => {
    setRows(results.map((g) => ({ guess: g, selected: true, name: g.name })));
  }, [results]);

  function toggle(index: number) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, selected: !r.selected } : r)));
  }

  function rename(index: number, name: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, name } : r)));
  }

  const selectedCount = rows.filter((r) => r.selected && r.name.trim().length > 0).length;

  function handleConfirm() {
    const selected = rows
      .filter((r) => r.selected && r.name.trim().length > 0)
      .map((r) => ({ ...r.guess, name: r.name.trim() }));
    onConfirm(selected);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card, borderRadius: colors.radius }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {results.length} items found
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Uncheck any that aren't separate items. Tap a name to edit it.
          </Text>

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {rows.map((row, index) => (
              <View
                key={index}
                style={[styles.row, { borderBottomColor: colors.border }]}
              >
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: row.selected }}
                  accessibilityLabel={row.name || "Unnamed item"}
                  onPress={() => toggle(index)}
                  hitSlop={6}
                  style={({ pressed }) => [
                    styles.checkbox,
                    {
                      backgroundColor: row.selected ? colors.primary : "transparent",
                      borderColor: row.selected ? colors.primary : colors.border,
                      borderRadius: 6,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {row.selected && <Feather name="check" size={14} color="#fff" />}
                </Pressable>

                <View style={{ flex: 1 }}>
                  <TextInput
                    accessibilityLabel={`Item ${index + 1} name`}
                    value={row.name}
                    onChangeText={(t) => rename(index, t)}
                    placeholder="Item name"
                    placeholderTextColor={colors.mutedForeground}
                    style={[styles.nameInput, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
                  />
                  {row.guess.description.length > 0 && (
                    <Text
                      numberOfLines={2}
                      style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 }}
                    >
                      {row.guess.description}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={onCancel}
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
              accessibilityLabel={`Add ${selectedCount} items`}
              accessibilityState={{ disabled: selectedCount === 0 }}
              onPress={handleConfirm}
              disabled={selectedCount === 0}
              style={({ pressed }) => [
                styles.btn,
                {
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius,
                  opacity: selectedCount === 0 ? 0.5 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
                {selectedCount > 0 ? `Add ${selectedCount} item${selectedCount === 1 ? "" : "s"}` : "Add items"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  nameInput: {
    fontSize: 15,
    paddingVertical: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  btn: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
});
