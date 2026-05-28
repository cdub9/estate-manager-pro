import { useRouter } from "expo-router";
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

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { supabase } from "@/lib/supabase";
import { useColors } from "@/hooks/useColors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "estate-manager-pro://reset-password",
      });
      if (error) throw error;
      setSent(true);
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
            Reset password
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {sent
              ? `We sent a reset link to ${email}. Check your inbox and tap the link to set a new password.`
              : "Enter your email and we'll send you a reset link."}
          </Text>
        </View>

        {!sent && (
          <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <Button
              title="Send reset link"
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: 4 }}
            />
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          onPress={() => router.back()}
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
