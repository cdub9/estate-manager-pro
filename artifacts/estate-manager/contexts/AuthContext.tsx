import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ApiError,
  authApi,
  setAuthToken,
  setUnauthorizedHandler,
} from "@/lib/api";
import { Timezone, User } from "@/types";

const TOKEN_KEY = "estate.token";

interface AuthContextValue {
  loading: boolean;
  users: User[];
  currentUser: User | null;
  register: (name: string, password: string) => Promise<User>;
  login: (name: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  updateProfile: (
    updates: Partial<Pick<User, "name" | "password" | "timezone">>,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const DEFAULT_TIMEZONE: Timezone = "America/Denver";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const refreshTokenRef = useRef<string | null>(null);

  const persistToken = useCallback(async (token: string | null) => {
    refreshTokenRef.current = token;
    setAuthToken(token);
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      const { users: list } = await authApi.listUsers();
      setUsers(list);
    } catch {
    }
  }, []);

  const handleUnauthorized = useCallback(() => {
    refreshTokenRef.current = null;
    setAuthToken(null);
    setCurrentUser(null);
    AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (!stored) return;
        refreshTokenRef.current = stored;
        setAuthToken(stored);
        try {
          const { user } = await authApi.me();
          if (cancelled) return;
          setCurrentUser(user);
          await refreshUsers();
        } catch (err) {
          if (err instanceof ApiError && err.status === 401) {
            await AsyncStorage.removeItem(TOKEN_KEY);
            refreshTokenRef.current = null;
            setAuthToken(null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUsers]);

  const register = useCallback<AuthContextValue["register"]>(
    async (name, password) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Name is required");
      if (password.length < 4)
        throw new Error("Password must be at least 4 characters");
      const { token, user } = await authApi.register(trimmed, password);
      await persistToken(token);
      setCurrentUser(user);
      await refreshUsers();
      return user;
    },
    [persistToken, refreshUsers],
  );

  const login = useCallback<AuthContextValue["login"]>(
    async (name, password) => {
      const { token, user } = await authApi.login(name.trim(), password);
      await persistToken(token);
      setCurrentUser(user);
      await refreshUsers();
      return user;
    },
    [persistToken, refreshUsers],
  );

  const logout = useCallback(async () => {
    await persistToken(null);
    setCurrentUser(null);
  }, [persistToken]);

  const switchUser = useCallback(
    async (_userId: string) => {
      void _userId;
      await persistToken(null);
      setCurrentUser(null);
    },
    [persistToken],
  );

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (updates) => {
      if (!currentUser) throw new Error("Not signed in");
      const payload: { name?: string; password?: string; timezone?: string } = {};
      const trimmedName = updates.name?.trim();
      if (trimmedName) payload.name = trimmedName;
      if (updates.password) payload.password = updates.password;
      if (updates.timezone) payload.timezone = updates.timezone;
      if (Object.keys(payload).length === 0) return;
      const { user } = await authApi.updateProfile(payload);
      if (user) setCurrentUser(user);
      await refreshUsers();
    },
    [currentUser, refreshUsers],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      users,
      currentUser,
      register,
      login,
      logout,
      switchUser,
      updateProfile,
    }),
    [
      loading,
      users,
      currentUser,
      register,
      login,
      logout,
      switchUser,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
