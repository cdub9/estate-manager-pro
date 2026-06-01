import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
} from "@expo-google-fonts/playfair-display";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, LogBox, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";

// Show notification banners even when the app is in the foreground.
// Wrapped in try/catch because this throws in Expo Go on SDK 53+ (Android).
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // Push notifications are not supported in Expo Go on Android SDK 53+.
  // Build a development client via `eas build --platform android --profile development`.
}

// react-native-draggable-flatlist uses InteractionManager internally;
// suppress the deprecation warning until the library is updated.
LogBox.ignoreLogs(["InteractionManager has been deprecated"]);

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Onboarding } from "@/components/Onboarding";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CategoriesProvider } from "@/contexts/CategoriesContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { TasksProvider } from "@/contexts/TasksContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync("onboarding_complete").then((val) => {
      setOnboardingDone(val === "1");
    });
  }, []);

  useEffect(() => {
    routerRef.current = router;
  });

  // Navigate to the relevant task when a notification is tapped.
  // Guarded because the listener API throws in Expo Go on Android SDK 53+.
  useEffect(() => {
    let subscription: ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null = null;
    try {
      subscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const taskId = response.notification.request.content.data?.taskId as string | undefined;
          if (taskId) {
            routerRef.current.push(`/task/${taskId}`);
          }
        },
      );
    } catch {
      // Not available in Expo Go on Android SDK 53+.
    }
    return () => subscription?.remove();
  }, []);

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
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(auth)/reset-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="task/new" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="task/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="inventory/new" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="inventory/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="categories" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      {currentUser && onboardingDone === false && (
        <Onboarding
          visible
          onDone={() => setOnboardingDone(true)}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <KeyboardProvider>
          <AppProviders>
            <RootNavigator />
          </AppProviders>
        </KeyboardProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
