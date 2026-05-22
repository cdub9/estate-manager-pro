import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "estate.theme";

interface ThemeContextValue {
  themePreference: ThemePreference;
  resolvedScheme: "light" | "dark";
  setThemePreference: (pref: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  themePreference: "system",
  resolvedScheme: "light",
  setThemePreference: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themePreference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val === "light" || val === "dark" || val === "system") {
          setPreferenceState(val);
        }
      })
      .catch(() => {});
  }, []);

  const resolvedScheme: "light" | "dark" =
    themePreference === "system" ? (systemScheme ?? "light") : themePreference;

  const setThemePreference = useCallback(async (pref: ThemePreference) => {
    setPreferenceState(pref);
    await AsyncStorage.setItem(STORAGE_KEY, pref);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ themePreference, resolvedScheme, setThemePreference }),
    [themePreference, resolvedScheme, setThemePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
