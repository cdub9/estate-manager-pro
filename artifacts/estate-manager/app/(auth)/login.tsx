import { Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
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

import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { users, login } = useAuth();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : insets.top;

  async function handleSubmit() {
    if (!name.trim() || !password) {
      setError("Enter your name and password");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(name, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  }

  function quickLogin(userName: string) {
    setName(userName);
    setPassword("");
    setError(null);
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
            { backgroundColor: colors.primary, borderRadius: colors.radius },
          ]}
        >
          <Feather name="home" size={26} color="#fff" />
        </View>
        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontFamily: "Inter_700Bold" },
          ]}
        >
          Estate Manager
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
          ]}
        >
          Coordinate tasks, equipment, and the people who keep the place running.
        </Text>
      </View>

      <View style={styles.form}>
        <TextField
          label="Name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            setError(null);
          }}
          autoCapitalize="words"
          autoCorrect={false}
          placeholder="Your name"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            setError(null);
          }}
          secureTextEntry
          placeholder="••••••"
          error={error}
        />
        <Button
          title="Sign in"
          onPress={handleSubmit}
          loading={submitting}
          fullWidth
          size="lg"
        />
        <Link href="/(auth)/register" asChild>
          <Pressable style={styles.linkRow} hitSlop={8}>
            <Text
              style={{
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
              }}
            >
              New here?{" "}
            </Text>
            <Text
              style={{
                color: colors.primary,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Create an account
            </Text>
          </Pressable>
        </Link>
      </View>

      {users.length > 0 ? (
        <View style={styles.recentSection}>
          <Text
            style={[
              styles.sectionLabel,
              { color: colors.mutedForeground, fontFamily: "Inter_500Medium" },
            ]}
          >
            On this device
          </Text>
          <View style={styles.userList}>
            {users.map((u) => (
              <Pressable
                key={u.id}
                onPress={() => quickLogin(u.name)}
                style={({ pressed }) => [
                  styles.userRow,
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
                <Feather
                  name="chevron-right"
                  size={16}
                  color={colors.mutedForeground}
                />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
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
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  form: {
    gap: 14,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 4,
  },
  recentSection: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  userList: {
    gap: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
  },
});
