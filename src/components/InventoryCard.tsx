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
        },
      ]}
    >
      <View
        style={[
          styles.accent,
          {
            backgroundColor: colors.primary,
            borderTopLeftRadius: colors.radius,
            borderBottomLeftRadius: colors.radius,
          },
        ]}
      />

      <View style={styles.body}>
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
              {
                backgroundColor: colors.secondary,
                borderRadius: colors.radius - 4,
              },
            ]}
          >
            <Feather name="package" size={22} color={colors.primary} />
          </View>
        )}

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 15.5,
              lineHeight: 19,
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
                  fontSize: 12,
                }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}

            {item.location ? (
              <>
                {subtitle ? (
                  <View style={[styles.bullet, { backgroundColor: colors.bulletColor }]} />
                ) : null}
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={11} color={colors.mutedForeground} />
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      marginLeft: 4,
                    }}
                    numberOfLines={1}
                  >
                    {item.location}
                  </Text>
                </View>
              </>
            ) : null}

            {taskCount > 0 ? (
              <>
                {subtitle || item.location ? (
                  <View style={[styles.bullet, { backgroundColor: colors.bulletColor }]} />
                ) : null}
                <View style={styles.metaItem}>
                  <Feather name="check-square" size={11} color={colors.mutedForeground} />
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      marginLeft: 4,
                    }}
                  >
                    {taskCount}
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    overflow: "hidden",
  },
  accent: {
    width: 4,
    alignSelf: "stretch",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  image: {
    width: 52,
    height: 52,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
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
});
