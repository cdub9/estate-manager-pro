import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : insets.top;

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await register(name, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: webTopInset + 24,
          paddingBottom: 40 + (Platform.OS === "web" ? 34 : insets.bottom),
        },
      ]}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.brand}>
        <View
          style={[
            styles.logo,
            { backgroundColor: colors.accent, borderRadius: colors.radius },
          ]}
        >
          <Feather name="user-plus" size={24} color="#fff" />
        </View>
        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontFamily: "Inter_700Bold" },
          ]}
        >
          Create your account
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          Each member of the estate gets their own login.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Your name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            setError(null);
          }}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="e.g. Alex Morgan"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setError(null);
          }}
          secureTextEntry
          placeholder="At least 4 characters"
        />
        <TextField
          label="Confirm password"
          value={confirm}
          onChangeText={(v) => {
            setConfirm(v);
            setError(null);
          }}
          secureTextEntry
          placeholder="Re-enter password"
          error={error}
        />
        <Button
          title="Create account"
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
          size="lg"
        />
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.linkRow} hitSlop={8}>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              }}
            >
              Already have an account?{" "}
            </Text>
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Sign in
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    gap: 28,
  },
  brand: {
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  logo: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  form: {
    gap: 14,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 4,
  },
});
