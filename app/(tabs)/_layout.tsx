import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

import { GoldHairlineRule } from "@/components/Gradients";
import { useColors } from "@/hooks/useColors";
import { Text } from "react-native";

/**
 * Tab bar background: solid `card` surface with a gold-hairline rule
 * across the top edge (transparent → goldHair → transparent).
 */
function TabBarBackground() {
  const colors = useColors();
  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.card }]}>
      <GoldHairlineRule />
    </View>
  );
}

/**
 * Tab label — Inter 600 when focused, Inter 500 when not, 10.5px, 0.3 tracking.
 */
function TabLabel({ label, color, focused }: { label: string; color: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontFamily: focused ? "Inter_600SemiBold" : "Inter_500Medium",
        fontSize: 10.5,
        letterSpacing: 0.3,
        color,
        marginBottom: 2,
      }}
    >
      {label}
    </Text>
  );
}

/**
 * Icon + a small gold diamond (4px, 45°) under the active tab.
 */
function TabIcon({
  name,
  color,
  size,
  focused,
  goldColor,
}: {
  name: keyof typeof Feather.glyphMap;
  color: string;
  size: number;
  focused: boolean;
  goldColor: string;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Feather name={name} size={size} color={color} />
      <View
        style={{
          width: 4,
          height: 4,
          marginTop: 3,
          backgroundColor: focused ? goldColor : "transparent",
          transform: [{ rotate: "45deg" }],
        }}
      />
    </View>
  );
}

export default function TabsLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: "transparent",
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 10.5,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="check-square"
              color={color}
              size={22}
              focused={focused}
              goldColor={colors.gold}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label="Tasks" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="package"
              color={color}
              size={22}
              focused={focused}
              goldColor={colors.gold}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label="Inventory" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="user"
              color={color}
              size={22}
              focused={focused}
              goldColor={colors.gold}
            />
          ),
          tabBarLabel: ({ color, focused }) => (
            <TabLabel label="Profile" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
