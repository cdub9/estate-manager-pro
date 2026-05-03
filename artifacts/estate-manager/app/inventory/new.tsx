import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

import { Button } from "@/components/Button";
import { SinglePhotoPicker } from "@/components/SinglePhotoPicker";
import { TextField } from "@/components/TextField";
import { useInventory } from "@/contexts/InventoryContext";
import { useColors } from "@/hooks/useColors";

export default function NewInventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createItem } = useInventory();

  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (submitting) return;
    if (!name.trim()) {
      setError("Give the item a name");
      return;
    }
    setSubmitting(true);
    try {
      await createItem({
        name,
        vendor,
        partNumber,
        location,
        description,
        photo,
      });
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save item");
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
        gap: 14,
      }}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      <SinglePhotoPicker value={photo} onChange={setPhoto} />

      <TextField
        label="Name"
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError(null);
        }}
        placeholder="e.g. John Deere 5075E Tractor"
        error={error}
        autoFocus
      />
      <TextField
        label="Vendor"
        value={vendor}
        onChangeText={setVendor}
        placeholder="Manufacturer or supplier"
        autoCapitalize="words"
      />
      <TextField
        label="Part number"
        value={partNumber}
        onChangeText={setPartNumber}
        placeholder="Model or SKU"
        autoCapitalize="characters"
      />
      <TextField
        label="Location"
        value={location}
        onChangeText={setLocation}
        placeholder="Where it lives on the property"
      />
      <TextField
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Specs, condition, maintenance notes…"
        multiline
      />

      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <Button
          title="Save item"
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
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
});
