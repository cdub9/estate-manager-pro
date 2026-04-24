import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { InventoryItem } from "@/types";

interface Props {
  item: InventoryItem;
  taskCount: number;
  onPress: () => void;
}

export function InventoryCard({ item, taskCount, onPress }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      {item.photo ? (
        <Image
          source={{ uri: item.photo }}
          style={[styles.image, { borderRadius: colors.radius - 4 }]}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.image,
            styles.imagePlaceholder,
            { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 },
          ]}
        >
          <Feather name="package" size={24} color={colors.primary} />
        </View>
      )}
      <View style={{ flex: 1, gap: 4 }}>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
          }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {item.vendor || item.partNumber ? (
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 13,
            }}
            numberOfLines={1}
          >
            {[item.vendor, item.partNumber].filter(Boolean).join(" · ")}
          </Text>
        ) : null}
        <View style={styles.metaRow}>
          {item.location ? (
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={11} color={colors.mutedForeground} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                {item.location}
              </Text>
            </View>
          ) : null}
          {taskCount > 0 ? (
            <View style={styles.metaItem}>
              <Feather name="check-square" size={11} color={colors.mutedForeground} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                }}
              >
                {taskCount} {taskCount === 1 ? "task" : "tasks"}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
  },
  image: {
    width: 64,
    height: 64,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
  },
});
