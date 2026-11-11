import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const router = useRouter();
  const { register } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [estateName, setEstateName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [joinMode, setJoinMode] = useState(mode === "join");
  const [estateCode, setEstateCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }
    if (joinMode && !estateCode.trim()) {
      Alert.alert("Required", "Please enter the estate join code.");
      return;
    }

    setLoading(true);
    try {
      await register(
        email.trim(),
        name.trim(),
        password,
        joinMode ? undefined : estateName.trim() || undefined,
        joinMode ? estateCode.trim().toUpperCase() : undefined,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Please try again.";
      Alert.alert("Registration failed", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Create account
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Join Estate Manager Pro
          </Text>
        </View>

        {/* Estate mode toggle */}
        <View style={[styles.toggleRow, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Create a new estate"
            accessibilityState={{ checked: !joinMode }}
            onPress={() => setJoinMode(false)}
            style={({ pressed }) => [
              styles.toggleBtn,
              !joinMode && { backgroundColor: colors.primary, borderRadius: colors.radius - 2 },
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text
              style={{
                color: !joinMode ? "#fff" : colors.secondaryForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
              }}
            >
              New estate
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="radio"
            accessibilityLabel="Join an existing estate"
            accessibilityState={{ checked: joinMode }}
            onPress={() => setJoinMode(true)}
            style={({ pressed }) => [
              styles.toggleBtn,
              joinMode && { backgroundColor: colors.primary, borderRadius: colors.radius - 2 },
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text
              style={{
                color: joinMode ? "#fff" : colors.secondaryForeground,
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
              }}
            >
              Join existing
            </Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            returnKeyType="next"
          />
          <TextField
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your full name"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
          />
          {!joinMode && (
            <TextField
              label="Estate name"
              value={estateName}
              onChangeText={setEstateName}
              placeholder={name.trim() ? `${name.trim()}'s Estate` : "e.g. Holloway Estate"}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          )}
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry={!showPassword}
            returnKeyType="next"
            rightElement={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
              >
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9aa094" />
              </Pressable>
            }
          />
          <TextField
            label="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repeat password"
            secureTextEntry={!showConfirm}
            returnKeyType={joinMode ? "next" : "done"}
            onSubmitEditing={joinMode ? undefined : handleRegister}
            rightElement={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showConfirm ? "Hide password" : "Show password"}
                onPress={() => setShowConfirm((v) => !v)}
                hitSlop={8}
              >
                <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color="#9aa094" />
              </Pressable>
            }
          />

          {joinMode && (
            <TextField
              label="Estate join code"
              value={estateCode}
              onChangeText={(t) => setEstateCode(t.toUpperCase())}
              placeholder="6-character code"
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
          )}

          {!joinMode && (
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 }}>
              A new estate will be created for you. Share the join code from your profile to add other members.
            </Text>
          )}

          <Button
            title={joinMode ? "Join estate" : "Create account"}
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: 4 }}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginTop: 8 })}
        >
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14, textAlign: "center" }}>
            Already have an account? Sign in
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  title: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 15,
  },
  toggleRow: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 9,
  },
  card: {
    padding: 16,
    gap: 12,
  },
});
