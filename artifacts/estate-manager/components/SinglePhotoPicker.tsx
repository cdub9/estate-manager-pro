import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  value: string | null;
  onChange: (uri: string | null) => void;
}

export function SinglePhotoPicker({ value, onChange }: Props) {
  const colors = useColors();

  async function pick(source: "camera" | "library") {
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Camera access is needed.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Photo library access is needed.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri);
      }
    }
  }

  function choose() {
    if (Platform.OS === "web") {
      pick("library");
      return;
    }
    Alert.alert("Add photo", "", [
      { text: "Take photo", onPress: () => pick("camera") },
      { text: "Choose from library", onPress: () => pick("library") },
      ...(value
        ? [
            {
              text: "Remove",
              style: "destructive" as const,
              onPress: () => onChange(null),
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" as const },
    ]);
  }

  if (value) {
    return (
      <Pressable
        onPress={choose}
        style={[
          styles.preview,
          { borderRadius: colors.radius, borderColor: colors.border },
        ]}
      >
        <Image source={{ uri: value }} style={styles.image} contentFit="cover" />
        <View style={styles.editBadge}>
          <Feather name="edit-2" size={12} color="#fff" />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={choose}
      style={({ pressed }) => [
        styles.empty,
        {
          borderRadius: colors.radius,
          borderColor: colors.border,
          backgroundColor: colors.card,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Feather name="camera" size={26} color={colors.primary} />
      <Text
        style={{
          color: colors.mutedForeground,
          fontFamily: "Inter_500Medium",
          fontSize: 13,
          marginTop: 6,
        }}
      >
        Add photo
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: "100%",
    height: 180,
    overflow: "hidden",
    borderWidth: 1,
  },
  image: { width: "100%", height: "100%" },
  empty: {
    width: "100%",
    height: 180,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});
