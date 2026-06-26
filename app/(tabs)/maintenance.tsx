import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { EmeraldFill, GoldHairlineRule } from "@/components/Gradients";
import { MaintenanceCard } from "@/components/MaintenanceCard";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useMaintenance } from "@/contexts/MaintenanceContext";
import { useColors } from "@/hooks/useColors";
import { MaintenanceSchedule } from "@/types";
import { dueState } from "@/utils/maintenance";

export default function MaintenanceScreen() {
  const colors = useColors();
  const router = useRouter();
  const { estateName } = useAuth();
  const { schedules, loading, error, refresh } = useMaintenance();
  const { items } = useInventory();

  const labelFor = useMemo(() => {
    return (s: MaintenanceSchedule): string => {
      if (s.inventoryId) {
        const it = items.find((i) => i.id === s.inventoryId);
        if (it) return it.name;
      }
      return s.subject;
    };
  }, [items]);

  const sections = useMemo(() => {
    const active = schedules.filter((s) => s.active);
    const paused = schedules.filter((s) => !s.active);
    const overdue = active.filter((s) => dueState(s.nextDue) === "overdue");
    const dueSoon = active.filter((s) => dueState(s.nextDue) === "due_soon");
    const upcoming = active.filter((s) => dueState(s.nextDue) === "upcoming");
    return [
      { title: "Overdue", data: overdue },
      { title: "Due soon", data: dueSoon },
      { title: "Upcoming", data: upcoming },
      { title: "Paused", data: paused },
    ].filter((sec) => sec.data.length > 0);
  }, [schedules]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
            {estateName ? estateName.toUpperCase() : "ESTATE"}
          </Text>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Raleway_600SemiBold" }]}>
            Maintenance
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="New maintenance schedule"
          onPress={() => router.push("/maintenance/new")}
          style={({ pressed }) => [
            styles.addBtn,
            {
              borderRadius: 99,
              borderWidth: 1,
              borderColor: colors.goldHair,
              opacity: pressed ? 0.85 : 1,
              overflow: "hidden",
              shadowColor: "#0b2c22",
              shadowOpacity: 0.18,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            },
          ]}
        >
          <EmeraldFill borderRadius={99} />
          <Feather name="plus" size={20} color={colors.onEmeraldIcon} />
        </Pressable>
      </View>
      <GoldHairlineRule />

      {!loading && error ? (
        <View style={styles.errorState}>
          <Feather name="wifi-off" size={32} color={colors.mutedForeground} />
          <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 15, textAlign: "center" }}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading maintenance"
            onPress={refresh}
            style={({ pressed }) => [
              styles.retryBtn,
              { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
              {section.title.toUpperCase()} · {section.data.length}
            </Text>
          )}
          renderItem={({ item }) => (
            <MaintenanceCard
              schedule={item}
              assetLabel={labelFor(item)}
              onPress={() => router.push(`/maintenance/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="tool"
              title="No maintenance yet"
              description="Schedule recurring upkeep for an asset or anything else, like landscaping. Tap + to start."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 10.5,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    letterSpacing: 0.2,
  },
  addBtn: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    padding: 20,
    gap: 9,
    paddingBottom: 40,
    flexGrow: 1,
  },
  sectionHeader: {
    fontSize: 10.5,
    letterSpacing: 1.5,
    marginTop: 14,
    marginBottom: 6,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginTop: 4,
  },
});
