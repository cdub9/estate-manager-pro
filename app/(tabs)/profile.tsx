import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRIVACY_POLICY_URL = "https://cdub9.github.io/estate-manager-pro/privacy-policy";

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { EmeraldFill, GoldFlourishDivider, GoldHairlineRule } from "@/components/Gradients";
import { TextField } from "@/components/TextField";
import { DEFAULT_TIMEZONE, useAuth } from "@/contexts/AuthContext";
import { ThemePreference, useTheme } from "@/contexts/ThemeContext";
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

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "smartphone" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { currentUser, users, logout, updateProfile, deleteAccount, estateJoinCode } = useAuth();
  const { themePreference, setThemePreference } = useTheme();

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
      await updateProfile({
        name: name.trim(),
        timezone,
        password: password || undefined,
      });
      setEditing(false);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not save profile.";
      Alert.alert("Error", msg);
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

  function handleDeleteAccount() {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Could not delete account.";
              Alert.alert("Error", msg);
            }
          },
        },
      ],
    );
  }

  async function handleShareCode() {
    if (!estateJoinCode) return;
    await Share.share({
      message: `Join my estate on Estate Manager Pro with code: ${estateJoinCode}`,
    });
  }

  if (!currentUser) return null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      {/* Header */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
            ACCOUNT
          </Text>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "PlayfairDisplay_600SemiBold" }]}>
            Profile
          </Text>
        </View>
        {!editing ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => setEditing(true)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Feather name="edit-2" size={20} color={colors.goldDeep} />
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
      <GoldHairlineRule />

      {/* Identity card — centered avatar, name, email, flourish, timezone */}
      <View
        style={[
          styles.card,
          styles.identityCard,
          {
            backgroundColor: colors.card,
            borderRadius: colors.radius,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        <Avatar user={currentUser} size={72} />
        <Text style={{ color: colors.foreground, fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 21, marginTop: 12 }}>
          {currentUser.name}
        </Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 }}>
          {currentUser.email}
        </Text>
        <View style={{ alignSelf: "stretch", marginTop: 14, marginBottom: 10 }}>
          <GoldFlourishDivider />
        </View>
        <Text style={[styles.eyebrow, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
          TIMEZONE
        </Text>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 13, marginTop: 4 }}>
          {TIMEZONE_OPTIONS.find((t) => t.value === (currentUser.timezone ?? DEFAULT_TIMEZONE))?.label ??
            currentUser.timezone}
        </Text>
      </View>

      {/* Estate */}
      {estateJoinCode && (
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderRadius: colors.radius,
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.eyebrow, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
            THE ESTATE
          </Text>
          <View style={styles.joinCodeRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 11.5, marginBottom: 2 }}>
                Private join code
              </Text>
              <Text style={{ color: colors.primary, fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 24, letterSpacing: 4 }}>
                {estateJoinCode}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Share join code"
              onPress={handleShareCode}
              style={({ pressed }) => [
                styles.copyBtn,
                {
                  borderRadius: colors.radius - 4,
                  borderWidth: 1,
                  borderColor: colors.goldHair,
                  opacity: pressed ? 0.85 : 1,
                  overflow: "hidden",
                },
              ]}
            >
              <EmeraldFill borderRadius={colors.radius - 4} />
              <Feather name="share-2" size={14} color={colors.onEmeraldIcon} />
              <Text style={{ color: colors.onEmerald, fontFamily: "Inter_600SemiBold", fontSize: 12 }}>Invite</Text>
            </Pressable>
          </View>
          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.borderSoft, marginVertical: 4 }} />

          {users.length > 0 && (
            <>
              <Text style={[styles.eyebrow, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
                MEMBERS
              </Text>
              {users.map((u, idx) => (
                <View
                  key={u.id}
                  style={[
                    styles.memberRow,
                    { borderBottomColor: colors.border },
                    idx === users.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Avatar user={u} size={32} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 14 }}>
                      {u.name}{u.id === currentUser.id ? " (you)" : ""}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12 }}>
                      {u.email}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* Edit form */}
      {editing && (
        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border }]}>
          <Text style={[styles.eyebrow, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
            EDIT PROFILE
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

          <Button title="Save changes" onPress={handleSave} loading={saving} />
        </View>
      )}

      {/* Categories */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Manage categories"
          onPress={() => router.push("/categories")}
          style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather name="tag" size={18} color={colors.goldDeep} />
          <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 }}>
            Manage categories
          </Text>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {/* Appearance */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border }]}>
        <Text style={[styles.eyebrow, { color: colors.goldDeep, fontFamily: "Inter_600SemiBold" }]}>
          APPEARANCE
        </Text>
        <View style={styles.themeOptions} accessibilityRole="radiogroup" accessibilityLabel="Theme">
          {THEME_OPTIONS.map((opt) => {
            const active = themePreference === opt.value;
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="radio"
                accessibilityLabel={opt.label}
                accessibilityState={{ checked: active }}
                onPress={() => setThemePreference(opt.value)}
                style={({ pressed }) => [
                  styles.themeChip,
                  {
                    backgroundColor: active ? "transparent" : colors.secondary,
                    borderRadius: colors.radius,
                    borderWidth: 1,
                    borderColor: active ? colors.goldHair : "transparent",
                    overflow: "hidden",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                {active ? <EmeraldFill borderRadius={colors.radius} /> : null}
                <Feather
                  name={opt.icon as any}
                  size={14}
                  color={active ? colors.onEmeraldIcon : colors.secondaryForeground}
                />
                <Text
                  style={{
                    color: active ? colors.onEmerald : colors.secondaryForeground,
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
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

      {/* Legal & danger zone */}
      <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderWidth: 1, borderColor: colors.border }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Privacy policy"
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          style={({ pressed }) => [styles.linkRow, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather name="shield" size={18} color={colors.goldDeep} />
          <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15, flex: 1 }}>
            Privacy Policy
          </Text>
          <Feather name="external-link" size={16} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Delete my account"
        onPress={handleDeleteAccount}
        style={({ pressed }) => [
          styles.deleteBtn,
          { borderColor: colors.destructive, borderRadius: colors.radius, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Feather name="trash-2" size={16} color={colors.destructive} />
        <Text style={{ color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 14 }}>
          Delete My Account
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 56,
    gap: 14,
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 4,
  },
  eyebrow: {
    fontSize: 10.5,
    letterSpacing: 2,
  },
  title: {
    fontSize: 30,
    letterSpacing: 0.2,
  },
  card: {
    padding: 18,
    gap: 12,
  },
  identityCard: {
    alignItems: "center",
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
  themeOptions: {
    flexDirection: "row",
    gap: 8,
  },
  themeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  joinCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
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
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 4,
  },
});
