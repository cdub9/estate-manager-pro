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

import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { SinglePhotoPicker } from "@/components/SinglePhotoPicker";
import { TextField } from "@/components/TextField";
import { useInventory } from "@/contexts/InventoryContext";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/utils/dates";
import { InventoryItem } from "@/types";

type ConfirmAction = "archive" | "unarchive" | null;

export default function InventoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const { getItemById, updateItem, archiveItem, unarchiveItem, deleteItem } = useInventory();

  const item = getItemById(id ?? "");

  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const initialItem = useRef<InventoryItem | null>(null);

  useEffect(() => {
    if (!item) return;
    if (initialItem.current?.id === item.id) return;
    initialItem.current = item;
    setName(item.name);
    setVendor(item.vendor);
    setPartNumber(item.partNumber);
    setLocation(item.location);
    setDescription(item.description);
    setPhoto(item.photo);
  }, [item]);

  const isDirty = item !== undefined && (
    name !== item.name ||
    vendor !== item.vendor ||
    partNumber !== item.partNumber ||
    location !== item.location ||
    description !== item.description ||
    photo !== item.photo
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
    if (!item) return;
    if (!name.trim()) {
      Alert.alert("Required", "Item name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await updateItem(item.id, {
        name: name.trim(),
        vendor: vendor.trim(),
        partNumber: partNumber.trim(),
        location: location.trim(),
        description: description.trim(),
        photo,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!item) return;
    Alert.alert("Delete item", `Delete "${item.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteItem(item.id);
          router.back();
        },
      },
    ]);
  }

  function handleConfirmAction() {
    if (!item || !confirmAction) return;
    if (confirmAction === "archive") {
      archiveItem(item.id);
    } else {
      unarchiveItem(item.id);
    }
    setConfirmAction(null);
    router.back();
  }

  useEffect(() => {
    if (confirmAction === null) return;
    const isArchive = confirmAction === "archive";
    Alert.alert(
      isArchive ? "Archive item" : "Restore item",
      isArchive
        ? `Archive "${item?.name}"? It will be removed from active inventory and unlinked from open tasks.`
        : `Restore "${item?.name}" to active inventory?`,
      [
        { text: "Cancel", style: "cancel", onPress: () => setConfirmAction(null) },
        {
          text: isArchive ? "Archive" : "Restore",
          style: isArchive ? "destructive" : "default",
          onPress: handleConfirmAction,
        },
      ]
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmAction]);

  if (!item) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Item not found.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isArchived = item.state === "archived";

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
          {item.name}
        </Text>
        <View style={styles.headerRight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete item"
            onPress={handleDelete}
            hitSlop={8}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}
          >
            <Feather name="trash-2" size={20} color={colors.destructive} />
          </Pressable>
          {!isArchived && (
            <Button title="Save" onPress={handleSave} loading={saving} size="sm" disabled={!isDirty} />
          )}
        </View>
      </View>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.container}
      >
        {isArchived && (
          <View style={[styles.archivedBanner, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
            <Feather name="archive" size={14} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>
              Archived {item.archivedAt ? formatDate(item.archivedAt) : ""}
            </Text>
          </View>
        )}

        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Item name"
          editable={!isArchived}
        />
        <TextField
          label="Vendor"
          value={vendor}
          onChangeText={setVendor}
          placeholder="Manufacturer or supplier"
          editable={!isArchived}
        />
        <TextField
          label="Part number"
          value={partNumber}
          onChangeText={setPartNumber}
          placeholder="SKU or model number"
          autoCapitalize="characters"
          editable={!isArchived}
        />
        <TextField
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Where is this stored?"
          editable={!isArchived}
        />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Notes, specs, or details…"
          multiline
          numberOfLines={3}
          editable={!isArchived}
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Photo</Text>
          {isArchived ? (
            photo ? (
              <View style={{ height: 180, borderRadius: colors.radius, overflow: "hidden" }}>
                <View style={{ flex: 1, backgroundColor: colors.secondary }} />
              </View>
            ) : null
          ) : (
            <SinglePhotoPicker value={photo} onChange={setPhoto} label="Item" />
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isArchived ? "Restore to active inventory" : "Archive this item"}
          onPress={() => setConfirmAction(isArchived ? "unarchive" : "archive")}
          style={({ pressed }) => [
            styles.archiveBtn,
            {
              borderColor: isArchived ? colors.primary : colors.mutedForeground,
              borderRadius: colors.radius,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name={isArchived ? "refresh-cw" : "archive"}
            size={15}
            color={isArchived ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={{
              color: isArchived ? colors.primary : colors.mutedForeground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
            }}
          >
            {isArchived ? "Restore to active inventory" : "Archive item"}
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
  archivedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
  },
  archiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 8,
  },
});
