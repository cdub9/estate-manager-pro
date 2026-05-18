import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { TasksProvider } from "@/contexts/TasksContext";
import { useColors } from "@/hooks/useColors";

SplashScreen.preventAutoHideAsync();

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CategoriesProvider>
        <InventoryProvider>
          <TasksProvider>{children}</TasksProvider>
        </InventoryProvider>
      </CategoriesProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { currentUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const routerRef = useRef(router);
  const colors = useColors();

  useEffect(() => {
    routerRef.current = router;
  });

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";

    if (!currentUser && !inAuth) {
      routerRef.current.replace("/(auth)/login");
    } else if (currentUser && inAuth) {
      routerRef.current.replace("/(tabs)");
    }
  }, [currentUser, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="task/new" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="inventory/new" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="inventory/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="categories" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
}
