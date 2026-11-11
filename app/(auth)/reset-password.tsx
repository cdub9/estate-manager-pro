import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/hooks/useColors";

export default function ResetPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const url = Linking.useURL();

  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parse the deep-link hash and establish a Supabase session from the tokens.
  useEffect(() => {
    if (!url) return;
    const hash = url.split("#")[1];
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth
        .setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) setSessionError(true);
          else setSessionReady(true);
        });
    } else {
      setSessionError(true);
    }
  }, [url]);

  async function handleReset() {
    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      Alert.alert("Password updated", "Your password has been changed. Please sign in.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Please try again.";
      Alert.alert("Error", msg);
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
            Set new password
          </Text>
          {sessionError && (
            <Text style={[styles.subtitle, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>
              This reset link has expired or is invalid. Please request a new one.
            </Text>
          )}
          {!sessionReady && !sessionError && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Verifying your reset link…
            </Text>
          )}
        </View>

        {sessionReady && (
          <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <TextField
              label="New password"
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
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                </Pressable>
              }
            />
            <TextField
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat password"
              secureTextEntry={!showConfirm}
              returnKeyType="done"
              onSubmitEditing={handleReset}
              rightElement={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showConfirm ? "Hide password" : "Show password"}
                  onPress={() => setShowConfirm((v) => !v)}
                  hitSlop={8}
                >
                  <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                </Pressable>
              }
            />
            <Button
              title="Update password"
              onPress={handleReset}
              loading={loading}
              style={{ marginTop: 4 }}
            />
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          onPress={() => router.replace("/(auth)/login")}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginTop: 8 })}
        >
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14, textAlign: "center" }}>
            Back to sign in
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
    gap: 8,
  },
  title: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    padding: 16,
    gap: 12,
  },
});
