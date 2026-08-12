import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { PhotoViewer } from "@/components/PhotoViewer";
import { useColors } from "@/hooks/useColors";

interface Props {
  value: string | null;
  onChange: (uri: string | null) => void;
  label?: string;
}

export function SinglePhotoPicker({ value, onChange, label = "Photo" }: Props) {
  const colors = useColors();
  const [viewerOpen, setViewerOpen] = useState(false);

  async function pick() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Estate Manager Pro needs access to your photo library to attach a photo.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Estate Manager Pro needs camera access to take a photo.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri);
    }
  }

  function promptAdd() {
    Alert.alert("Add photo", "Choose source", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo library", onPress: pick },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function confirmRemove() {
    Alert.alert("Remove photo", `Remove the ${label.toLowerCase()} photo?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onChange(null) },
    ]);
  }

  if (value) {
    return (
      <View style={styles.wrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${label} photo full size`}
          onPress={() => setViewerOpen(true)}
          style={{ borderRadius: colors.radius, overflow: "hidden" }}
        >
          <Image
            source={{ uri: value }}
            style={[styles.preview, { borderRadius: colors.radius }]}
            accessibilityLabel={`${label} photo`}
          />
        </Pressable>

        <PhotoViewer
          photos={[value]}
          visible={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Change ${label} photo`}
            onPress={promptAdd}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.secondary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="edit-2" size={14} color={colors.secondaryForeground} />
            <Text style={{ color: colors.secondaryForeground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
              Change
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${label} photo`}
            onPress={confirmRemove}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: colors.secondary, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="trash-2" size={14} color={colors.destructive} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Add ${label} photo`}
      onPress={promptAdd}
      style={({ pressed }) => [
        styles.emptyTile,
        {
          backgroundColor: colors.secondary,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Feather name="camera" size={22} color={colors.mutedForeground} />
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 6 }}>
        Add {label} photo
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  preview: {
    width: "100%",
    height: 180,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  emptyTile: {
    height: 120,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
});
