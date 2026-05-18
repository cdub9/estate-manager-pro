import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { DEFAULT_TIMEZONE, useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { Timezone } from "@/types";

const TIMEZONE_OPTIONS: { value: Timezone; label: string }[] = [
  { value: "America/New_York", label: "Eastern (ET)" },
  { value: "America/Chicago", label: "Central (CT)" },
  { value: "America/Denver", label: "Mountain (MT)" },
  { value: "America/Phoenix", label: "Arizona (no DST)" },
  { value: "America/Los_Angeles", label: "Pacific (PT)" },
  { value: "America/Anchorage", label: "Alaska (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii (HT)" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { currentUser, users, logout, switchUser, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name ?? "");
  const [timezone, setTimezone] = useState<Timezone>(currentUser?.timezone ?? DEFAULT_TIMEZONE);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setTimezone(currentUser.timezone ?? DEFAULT_TIMEZONE);
    }
  }, [currentUser]);

  const isDirty =
    name !== currentUser?.name ||
    timezone !== (currentUser?.timezone ?? DEFAULT_TIMEZONE) ||
    password.length > 0;

  function handleCancelEdit() {
    if (isDirty) {
      Alert.alert("Discard changes?", "You have unsaved changes.", [
        { text: "Keep editing", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setEditing(false);
            setName(currentUser?.name ?? "");
            setTimezone(currentUser?.timezone ?? DEFAULT_TIMEZONE);
            setPassword("");
            setConfirmPassword("");
          },
        },
      ]);
    } else {
      setEditing(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Required", "Name cannot be empty.");
      return;
    }
    if (password && password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    if (password && password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateProfile({
        name: name.trim(),
        timezone,
        password: password || undefined,
      });
      if (!result.ok) {
        Alert.alert("Error", result.error ?? "Could not save profile.");
      } else {
        setEditing(false);
        setPassword("");
        setConfirmPassword("");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: logout },
    ]);
  }

  const otherUsers = users.filter((u) => u.id !== currentUser?.id);

  if (!currentUser) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      {/* Header */}
      <View style={[styles.pageHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Profile
        </Text>
        {!editing ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => setEditing(true)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Feather name="edit-2" size={20} color={colors.primary} />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel editing"
            onPress={handleCancelEdit}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Feather name="x" size={22} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* Avatar + name */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <View style={styles.avatarRow}>
          <Avatar user={currentUser} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: 20 }}>
              {currentUser.name}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 }}>
              {TIMEZONE_OPTIONS.find((t) => t.value === (currentUser.timezone ?? DEFAULT_TIMEZONE))?.label ??
                currentUser.timezone}
            </Text>
          </View>
        </View>
      </View>

      {/* Edit form */}
      {editing && (
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
            Edit profile
          </Text>
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Timezone
          </Text>
          <View style={styles.tzOptions}>
            {TIMEZONE_OPTIONS.map((opt) => {
              const active = timezone === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  accessibilityRole="radio"
                  accessibilityLabel={opt.label}
                  accessibilityState={{ checked: active }}
                  onPress={() => setTimezone(opt.value)}
                  style={({ pressed }) => [
                    styles.tzChip,
                    {
                      backgroundColor: active ? colors.primary : colors.secondary,
                      borderRadius: 99,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? "#fff" : colors.secondaryForeground,
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 12,
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Change password (optional)
          </Text>
          <TextField
            label="New password"
            value={password}
            onChangeText={setPassword}
            placeholder="Leave blank to keep current"
            secureTextEntry
          />
          {password.length > 0 && (
            <TextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat new password"
              secureTextEntry
            />
          )}

          <Button label="Save changes" onPress={handleSave} loading={saving} />
        </View>
      )}

      {/* Switch user */}
      {otherUsers.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
            Switch user
          </Text>
          {otherUsers.map((u) => (
            <Pressable
              key={u.id}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${u.name}`}
              onPress={() => switchUser(u.id)}
              style={({ pressed }) => [
                styles.userRow,
                { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Avatar user={u} size={36} />
              <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 }}>
                {u.name}
              </Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Categories */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Manage categories"
          onPress={() => router.push("/categories")}
          style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather name="tag" size={18} color={colors.primary} />
          <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 }}>
            Manage categories
          </Text>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Sign out */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.signOutBtn,
          { borderColor: colors.destructive, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={{ color: colors.destructive, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>
          Sign out
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 56,
    gap: 12,
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
  },
  card: {
    padding: 16,
    gap: 12,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontSize: 13,
    marginBottom: -4,
  },
  tzOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tzChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
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
