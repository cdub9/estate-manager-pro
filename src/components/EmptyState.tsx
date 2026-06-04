import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: colors.secondary,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.goldHair,
          },
        ]}
      >
        <Feather name={icon} size={26} color={colors.goldDeep} />
      </View>
      <Text
        style={[
          styles.title,
          { color: colors.foreground, fontFamily: "Raleway_500Medium" },
        ]}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            styles.desc,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          {description}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: 16 }}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
    gap: 10,
  },
  iconBox: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  desc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
