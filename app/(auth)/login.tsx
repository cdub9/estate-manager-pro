import { Feather } from "@expo/vector-icons";
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
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim()) {
      Alert.alert("Required", "Please enter your email address.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (!password) {
      Alert.alert("Required", "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Email or password is incorrect.";
      Alert.alert("Sign in failed", msg);
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
            Estate Manager Pro
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Sign in to continue
          </Text>
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
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            rightElement={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </Pressable>
            }
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Forgot password"
            onPress={() => router.push("/(auth)/forgot-password")}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, alignSelf: "flex-end" })}
          >
            <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium", fontSize: 13 }}>
              Forgot password?
            </Text>
          </Pressable>

          <Button
            title="Sign in"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 4 }}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create a new account"
          onPress={() => router.push("/(auth)/register")}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, marginTop: 8 })}
        >
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14, textAlign: "center" }}>
            New user? Create an account
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
  card: {
    padding: 16,
    gap: 12,
  },
});
