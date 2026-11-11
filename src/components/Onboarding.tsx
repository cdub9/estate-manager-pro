import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onDone: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "home" as const,
    title: "Welcome to\nEstate Manager Pro",
    body: "Everything your estate needs — tasks, equipment, and your team — in one place.",
  },
  {
    icon: "check-square" as const,
    title: "Organize Tasks",
    body: "Create tasks, assign them to estate members, set due dates, and track progress together in real time.",
  },
  {
    icon: "users" as const,
    title: "Invite Your Team",
    body: "Share your estate code from the Profile screen to add other members. Everyone sees the same tasks and inventory.",
  },
];

export function Onboarding({ visible, onDone }: Props) {
  const colors = useColors();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  async function finish() {
    await SecureStore.setItemAsync("onboarding_complete", "1");
    onDone();
  }

  function next() {
    if (index < SLIDES.length - 1) {
      const nextIndex = index + 1;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setIndex(nextIndex);
    } else {
      finish();
    }
  }

  const isLast = index === SLIDES.length - 1;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, i) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * i, index: i })}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primary + "18" }]}>
                <Feather name={item.icon} size={48} color={colors.primary} />
              </View>
              <Text style={[styles.slideTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {item.title}
              </Text>
              <Text style={[styles.slideBody, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {item.body}
              </Text>
            </View>
          )}
        />

        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? colors.primary : colors.border,
                  width: i === index ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!isLast && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              onPress={finish}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 12 })}
            >
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 15 }}>
                Skip
              </Text>
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLast ? "Get started" : "Next"}
            onPress={next}
            style={({ pressed }) => [
              styles.nextBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: colors.radius,
                opacity: pressed ? 0.85 : 1,
                flex: isLast ? 1 : 0,
              },
            ]}
          >
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 16 }}>
              {isLast ? "Get Started" : "Next"}
            </Text>
            {!isLast && <Feather name="arrow-right" size={18} color="#fff" />}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingBottom: 48,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 24,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 28,
    textAlign: "center",
    lineHeight: 36,
  },
  slideBody: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    gap: 12,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
});
