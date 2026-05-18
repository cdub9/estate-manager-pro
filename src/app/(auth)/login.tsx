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

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { users, login } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }
    if (!password) {
      Alert.alert("Required", "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(name.trim(), password);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Name or password is incorrect.";
      Alert.alert("Login failed", msg);
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
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Button
            label="Sign in"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 4 }}
          />
        </View>

        {users.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
              Other users on this device
            </Text>
            {users.map((u) => (
              <Pressable
                key={u.id}
                accessibilityRole="button"
                accessibilityLabel={`Sign in as ${u.name}`}
                onPress={() => setName(u.name)}
                style={({ pressed }) => [
                  styles.userRow,
                  { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium", fontSize: 15 }}>
                  {u.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

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
  sectionLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  userRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
