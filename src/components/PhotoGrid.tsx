import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  photos: string[];
  onAdd: (uri: string) => void;
  onRemove: (uri: string) => void;
  maxPhotos?: number;
}

export function PhotoGrid({ photos, onAdd, onRemove, maxPhotos = 6 }: Props) {
  const colors = useColors();
  const canAdd = photos.length < maxPhotos;

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Estate Manager Pro needs access to your photo library to attach photos to tasks.",
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
      onAdd(result.assets[0].uri);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Estate Manager Pro needs camera access to take photos.",
        [{ text: "OK" }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      onAdd(result.assets[0].uri);
    }
  }

  function confirmRemove(uri: string) {
    Alert.alert("Remove photo", "Remove this photo?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => onRemove(uri) },
    ]);
  }

  function promptAdd() {
    Alert.alert("Add photo", "Choose source", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo library", onPress: pickPhoto },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {photos.map((uri, i) => (
          <View key={uri} style={[styles.tile, { borderRadius: colors.radius }]}>
            <Image
              source={{ uri }}
              style={[styles.image, { borderRadius: colors.radius }]}
              accessibilityLabel={`Attached photo ${i + 1}`}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove photo ${i + 1}`}
              onPress={() => confirmRemove(uri)}
              style={[styles.removeBtn, { backgroundColor: colors.card }]}
            >
              <Feather name="x" size={12} color={colors.foreground} />
            </Pressable>
          </View>
        ))}

        {canAdd && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            onPress={promptAdd}
            style={({ pressed }) => [
              styles.addTile,
              {
                backgroundColor: colors.secondary,
                borderColor: colors.border,
                borderRadius: colors.radius,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Feather name="camera" size={20} color={colors.mutedForeground} />
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_500Medium",
                fontSize: 11,
                marginTop: 4,
              }}
            >
              Add
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {photos.length > 0 && (
        <Text
          style={{
            color: colors.mutedForeground,
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            marginTop: 4,
          }}
        >
          {photos.length}/{maxPhotos} photos
        </Text>
      )}
    </View>
  );
}

const TILE_SIZE = 80;

const styles = StyleSheet.create({
  scroll: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  image: {
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
});
