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

import { Button } from "@/components/Button";
import { SinglePhotoPicker } from "@/components/SinglePhotoPicker";
import { StatusPill } from "@/components/StatusPill";
import { TextField } from "@/components/TextField";
import { useInventory } from "@/contexts/InventoryContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";

export default function InventoryDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getItemById,
    updateItem,
    deleteItem,
    archiveItem,
    unarchiveItem,
  } = useInventory();
  const { tasks, removeInventoryFromAll } = useTasks();

  const item = getItemById(id);

  const [name, setName] = useState(item?.name ?? "");
  const [vendor, setVendor] = useState(item?.vendor ?? "");
  const [partNumber, setPartNumber] = useState(item?.partNumber ?? "");
  const [location, setLocation] = useState(item?.location ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [photo, setPhoto] = useState<string | null>(item?.photo ?? null);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [unarchiveConfirmOpen, setUnarchiveConfirmOpen] = useState(false);

  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setVendor(item.vendor);
    setPartNumber(item.partNumber);
    setLocation(item.location);
    setDescription(item.description);
    setPhoto(item.photo);
  }, [item?.id]);

  const linkedTasks = useMemo(
    () => tasks.filter((t) => t.inventoryIds.includes(id ?? "")),
    [tasks, id],
  );

  const dirty = useMemo(() => {
    if (!item) return false;
    return (
      item.name !== name.trim() ||
      item.vendor !== vendor.trim() ||
      item.partNumber !== partNumber.trim() ||
      item.location !== location.trim() ||
      item.description !== description.trim() ||
      item.photo !== photo
    );
  }, [item, name, vendor, partNumber, location, description, photo]);

  if (!item) {
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
          Item not found
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

  async function save() {
    if (!name.trim()) {
      Alert.alert("Name required");
      return;
    }
    await updateItem(item!.id, {
      name: name.trim(),
      vendor: vendor.trim(),
      partNumber: partNumber.trim(),
      location: location.trim(),
      description: description.trim(),
      photo,
    });
    router.back();
  }

  function confirmDelete() {
    Alert.alert(
      "Delete equipment?",
      linkedTasks.length > 0
        ? `This item is linked to ${linkedTasks.length} task${linkedTasks.length === 1 ? "" : "s"}. Those links will be removed.`
        : "This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await removeInventoryFromAll(item!.id);
            await deleteItem(item!.id);
            router.back();
          },
        },
      ],
    );
  }

  function confirmArchive() {
    if (item.archivedAt) {
      setUnarchiveConfirmOpen(true);
      return;
    }
    setArchiveConfirmOpen(true);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Equipment",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              {item.archivedAt ? (
                <Button title="Unarchive" onPress={confirmArchive} />
              ) : (
                <Button title="Archive" onPress={confirmArchive} variant="secondary" />
              )}
              <Button
                title="Delete"
                variant="destructive"
                size="sm"
                onPress={() => {
                  confirmDelete();
                }}
              />
            </View>
          ),
        }}
      />
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) + 80,
          gap: 14,
        }}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        <SinglePhotoPicker value={photo} onChange={setPhoto} />

        <TextField label="Name" value={name} onChangeText={setName} />
        <TextField label="Vendor" value={vendor} onChangeText={setVendor} autoCapitalize="words" />
        <TextField
          label="Part number"
          value={partNumber}
          onChangeText={setPartNumber}
          autoCapitalize="characters"
        />
        <TextField label="Location" value={location} onChangeText={setLocation} />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {linkedTasks.length > 0 ? (
          <View style={styles.linkedSection}>
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
              ]}
            >
              Linked tasks
            </Text>
            <View style={{ gap: 8 }}>
              {linkedTasks.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => router.push(`/task/${t.id}`)}
                  style={({ pressed }) => [
                    styles.taskRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      borderRadius: colors.radius,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text
                      style={{
                        color: colors.foreground,
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                      }}
                      numberOfLines={1}
                    >
                      {t.title}
                    </Text>
                    <StatusPill status={t.status} />
                  </View>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

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
      </KeyboardAwareScrollViewCompat>
      {archiveConfirmOpen ? (
        <View style={styles.confirmOverlay}>
          <View
            style={[
              styles.confirmCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
              }}
            >
              Are you sure you'd like to archive this piece of equipment?
            </Text>
            <View style={styles.confirmActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setArchiveConfirmOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Archive"
                variant="destructive"
                onPress={async () => {
                  setArchiveConfirmOpen(false);
                  await archiveItem(item.id);
                  router.back();
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      ) : null}
      {unarchiveConfirmOpen ? (
        <View style={styles.confirmOverlay}>
          <View
            style={[
              styles.confirmCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius,
              },
            ]}
          >
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
              }}
            >
              Are you sure you'd like to unarchive this piece of equipment?
            </Text>
            <View style={styles.confirmActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setUnarchiveConfirmOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Unarchive"
                onPress={async () => {
                  setUnarchiveConfirmOpen(false);
                  await unarchiveItem(item.id);
                  router.back();
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  linkedSection: {
    gap: 8,
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  confirmCard: {
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10,
  },
});
