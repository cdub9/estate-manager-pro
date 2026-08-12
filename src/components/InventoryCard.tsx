import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmeraldFill } from "@/components/Gradients";
import { useColors } from "@/hooks/useColors";
import { InventoryItem } from "@/types";

interface Props {
  item: InventoryItem;
  taskCount: number;
  onPress: () => void;
}

export function InventoryCard({ item, taskCount, onPress }: Props) {
  const colors = useColors();
  const subtitle = [item.vendor, item.partNumber].filter(Boolean).join(" · ");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.name}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
          shadowColor: "#1b2a23",
          shadowOpacity: 0.03,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
        },
      ]}
    >
      <View style={styles.body}>
        {item.photo ? (
          <Image
            source={{ uri: item.photo }}
            style={[styles.thumb, { borderRadius: 12 }]}
            contentFit="cover"
          />
        ) : (
          <View
            style={[
              styles.thumb,
              {
                borderRadius: 12,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: colors.goldHair,
              },
            ]}
          >
            <EmeraldFill borderRadius={12} />
            <Feather name="package" size={24} color={colors.onEmeraldIcon} />
          </View>
        )}

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Raleway_500Medium",
              fontSize: 20,
              lineHeight: 24,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            {subtitle ? (
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontFamily: "Inter_500Medium",
                  fontSize: 11.5,
                }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}

            {item.location ? (
              <>
                {subtitle ? (
                  <View style={[styles.bullet, { backgroundColor: colors.faint }]} />
                ) : null}
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 11.5,
                      marginLeft: 4,
                    }}
                    numberOfLines={1}
                  >
                    {item.location}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {taskCount > 0 ? (
          <View style={styles.tasksBlock}>
            <Text
              style={{
                color: colors.goldDeep,
                fontFamily: "Raleway_600SemiBold",
                fontSize: 17,
                lineHeight: 20,
              }}
            >
              {taskCount}
            </Text>
            <Text
              style={{
                color: colors.goldDeep,
                fontFamily: "Inter_600SemiBold",
                fontSize: 9,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              Tasks
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  thumb: {
    width: 54,
    height: 54,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    flexWrap: "wrap",
    rowGap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    flexShrink: 1,
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
  },
  tasksBlock: {
    alignItems: "center",
    minWidth: 32,
  },
});
