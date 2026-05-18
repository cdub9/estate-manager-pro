import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function NewInventoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { addItem } = useInventory();

  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isDirty =
    name.trim().length > 0 ||
    vendor.trim().length > 0 ||
    partNumber.trim().length > 0 ||
    location.trim().length > 0 ||
    description.trim().length > 0 ||
    photo !== null;

  function handleBack() {
    if (isDirty) {
      Alert.alert("Discard item?", "You have unsaved changes.", [
        { text: "Keep editing", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Required", "Item name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await addItem({
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
          New Item
        </Text>
        <Button label="Save" onPress={handleSave} loading={saving} size="sm" />
      </View>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.container}
      >
        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Item name"
          autoFocus
        />
        <TextField
          label="Vendor"
          value={vendor}
          onChangeText={setVendor}
          placeholder="Manufacturer or supplier"
        />
        <TextField
          label="Part number"
          value={partNumber}
          onChangeText={setPartNumber}
          placeholder="SKU or model number"
          autoCapitalize="characters"
        />
        <TextField
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Where is this stored?"
        />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Notes, specs, or details…"
          multiline
          numberOfLines={3}
        />

        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Photo</Text>
          <SinglePhotoPicker value={photo} onChange={setPhoto} label="Item" />
        </View>
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
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
  },
});
