import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useInventory } from "@/contexts/InventoryContext";
import { useTasks } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, users, logout, switchUser, updateProfile } = useAuth();
  const { tasks } = useTasks();
  const { items } = useInventory();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const myStats = useMemo(() => {
    if (!currentUser) return { assigned: 0, completed: 0 };
    return {
      assigned: tasks.filter(
        (t) => t.assigneeId === currentUser.id && t.status !== "done",
      ).length,
      completed: tasks.filter(
        (t) => t.assigneeId === currentUser.id && t.status === "done",
      ).length,
    };
  }, [tasks, currentUser]);

  if (!currentUser) return null;

  const otherUsers = users.filter((u) => u.id !== currentUser.id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad =
    Platform.OS === "web" ? 84 + 16 : insets.bottom + 60 + 24;

  function confirmLogout() {
    Alert.alert("Sign out?", "You can sign back in anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        name: name !== currentUser?.name ? name : undefined,
        password: password ? password : undefined,
      });
      setPassword("");
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 16,
        paddingTop: topPad + 12,
        paddingBottom: bottomPad,
        gap: 18,
      }}
    >
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.h1,
            { color: colors.foreground, fontFamily: "Inter_700Bold" },
          ]}
        >
          Account
        </Text>
      </View>

      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        <Avatar user={currentUser} size={64} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_700Bold",
              fontSize: 20,
            }}
            numberOfLines={1}
          >
            {currentUser.name}
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
              fontSize: 13,
            }}
          >
            Signed in
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setEditing((v) => !v);
            setError(null);
            setName(currentUser.name);
            setPassword("");
          }}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconBtn,
            { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather
            name={editing ? "x" : "edit-2"}
            size={16}
            color={colors.secondaryForeground}
          />
        </Pressable>
      </View>

      {editing ? (
        <View
          style={[
            styles.editBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <TextField
            label="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Leave blank to keep current"
            error={error}
            hint={!error ? "Optional — only set if you want to change it" : undefined}
          />
          <Button
            title="Save changes"
            onPress={handleSave}
            loading={saving}
            fullWidth
          />
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Text
            style={{
              color: colors.primary,
              fontFamily: "Inter_700Bold",
              fontSize: 26,
            }}
          >
            {myStats.assigned}
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              marginTop: 2,
              textAlign: "center",
            }}
          >
            Assigned to you
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Text
            style={{
              color: colors.accent,
              fontFamily: "Inter_700Bold",
              fontSize: 26,
            }}
          >
            {myStats.completed}
          </Text>
          <Text
            style={{
              color: colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              marginTop: 2,
              textAlign: "center",
            }}
          >
            Completed by you
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.summaryRow,
          { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
        ]}
      >
        <View style={styles.summaryItem}>
          <Feather name="users" size={16} color={colors.primary} />
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
            }}
          >
            {users.length} {users.length === 1 ? "member" : "members"}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Feather name="check-square" size={16} color={colors.primary} />
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
            }}
          >
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Feather name="package" size={16} color={colors.primary} />
          <Text
            style={{
              color: colors.foreground,
              fontFamily: "Inter_600SemiBold",
              fontSize: 15,
            }}
          >
            {items.length} {items.length === 1 ? "item" : "items"}
          </Text>
        </View>
      </View>

      {otherUsers.length > 0 ? (
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
            ]}
          >
            Switch user
          </Text>
          <View style={{ gap: 8 }}>
            {otherUsers.map((u) => (
              <Pressable
                key={u.id}
                onPress={() => switchUser(u.id)}
                style={({ pressed }) => [
                  styles.switchRow,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Avatar user={u} size={36} />
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 15,
                    flex: 1,
                  }}
                >
                  {u.name}
                </Text>
                <Feather name="log-in" size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={confirmLogout}
        style={({ pressed }) => [
          styles.signOutBtn,
          {
            borderColor: colors.border,
            borderRadius: colors.radius,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text
          style={{
            color: colors.destructive,
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
          }}
        >
          Sign out
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    paddingHorizontal: 4,
  },
  h1: {
    fontSize: 32,
    letterSpacing: -0.5,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderWidth: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  editBox: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 4,
  },
});
