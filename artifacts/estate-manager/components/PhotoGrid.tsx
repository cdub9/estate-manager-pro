import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  photos: string[];
  onChange: (next: string[]) => void;
  editable?: boolean;
}

export function PhotoGrid({ photos, onChange, editable = true }: Props) {
  const colors = useColors();

  async function pickImage(source: "camera" | "library") {
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Camera access is needed to take photos.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        onChange([...photos, result.assets[0].uri]);
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
        allowsMultipleSelection: true,
      });
      if (!result.canceled) {
        const uris = result.assets.map((a) => a.uri);
        onChange([...photos, ...uris]);
      }
    }
  }

  function chooseSource() {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    if (Platform.OS === "web") {
      pickImage("library");
      return;
    }
    Alert.alert("Add photo", "", [
      { text: "Take photo", onPress: () => pickImage("camera") },
      { text: "Choose from library", onPress: () => pickImage("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function removePhoto(uri: string) {
    Alert.alert("Remove photo?", "", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => onChange(photos.filter((p) => p !== uri)),
      },
    ]);
  }

  return (
    <View style={styles.grid}>
      {photos.map((uri) => (
        <Pressable
          key={uri}
          onLongPress={() => editable && removePhoto(uri)}
          style={[styles.tile, { borderRadius: colors.radius }]}
        >
          <Image source={{ uri }} style={styles.image} />
          {editable ? (
            <Pressable
              onPress={() => removePhoto(uri)}
              style={styles.removeBtn}
              hitSlop={8}
            >
              <Feather name="x" size={14} color="#fff" />
            </Pressable>
          ) : null}
        </Pressable>
      ))}
      {editable ? (
        <Pressable
          onPress={chooseSource}
          style={({ pressed }) => [
            styles.tile,
            styles.addTile,
            {
              borderRadius: colors.radius,
              borderColor: colors.border,
              backgroundColor: colors.card,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather name="camera" size={22} color={colors.primary} />
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 11,
              marginTop: 4,
            }}
          >
            Add photo
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const TILE = 96;

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: TILE,
    height: TILE,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  addTile: {
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});
