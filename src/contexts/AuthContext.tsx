import * as Crypto from "expo-crypto";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { asyncStorage } from "@/storage/asyncStorage";
import { Timezone, User } from "@/types";
import { uuid } from "@/utils/uuid";

export const DEFAULT_TIMEZONE: Timezone = "America/Denver";

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password,
  );
}

interface AuthContextValue {
  loading: boolean;
  users: User[];
  currentUser: User | null;
  register: (name: string, password: string) => Promise<User>;
  login: (name: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  updateProfile: (
    updates: Partial<Pick<User, "name" | "timezone">> & { password?: string },
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [allUsers, sessionId] = await Promise.all([
          asyncStorage.getUsers(),
          asyncStorage.getSession(),
        ]);
        if (cancelled) return;
        setUsers(allUsers);
        if (sessionId) {
          const found = allUsers.find((u) => u.id === sessionId) ?? null;
          setCurrentUser(found);
        }
      } catch (err) {
        console.error("AuthProvider init failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback<AuthContextValue["register"]>(
    async (name, password) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Name is required");
      if (password.length < 8)
        throw new Error("Password must be at least 8 characters");
      const allUsers = await asyncStorage.getUsers();
      if (allUsers.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) {
        throw new Error("A user with that name already exists");
      }
      const id = uuid();
      const user: User = {
        id,
        name: trimmed,
        colorIndex: allUsers.length % 8,
        timezone: DEFAULT_TIMEZONE,
        createdAt: Date.now(),
      };
      const hash = await hashPassword(password);
      const updated = [...allUsers, user];
      await asyncStorage.savePasswordHash(id, hash);
      await asyncStorage.saveUsers(updated);
      await asyncStorage.saveSession(id);
      setUsers(updated);
      setCurrentUser(user);
      return user;
    },
    [],
  );

  const login = useCallback<AuthContextValue["login"]>(
    async (name, password) => {
      const allUsers = await asyncStorage.getUsers();
      const user = allUsers.find(
        (u) => u.name.toLowerCase() === name.trim().toLowerCase(),
      );
      if (!user) throw new Error("No account found with that name");
      const hash = await asyncStorage.getPasswordHash(user.id);
      if (!hash) throw new Error("Account has no password set");
      const inputHash = await hashPassword(password);
      if (inputHash !== hash) throw new Error("Incorrect password");
      await asyncStorage.saveSession(user.id);
      setCurrentUser(user);
      setUsers(allUsers);
      return user;
    },
    [],
  );

  const logout = useCallback(async () => {
    await asyncStorage.saveSession(null);
    setCurrentUser(null);
  }, []);

  const switchUser = useCallback(
    async (userId: string) => {
      const allUsers = await asyncStorage.getUsers();
      const user = allUsers.find((u) => u.id === userId);
      if (!user) throw new Error("User not found");
      await asyncStorage.saveSession(userId);
      setCurrentUser(user);
    },
    [],
  );

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (updates) => {
      if (!currentUser) throw new Error("Not signed in");
      let updated: User = { ...currentUser };
      const trimmedName = updates.name?.trim();
      if (trimmedName) {
        if (!trimmedName) throw new Error("Name cannot be empty");
        updated = { ...updated, name: trimmedName };
      }
      if (updates.timezone) {
        updated = { ...updated, timezone: updates.timezone };
      }
      if (updates.password) {
        if (updates.password.length < 8)
          throw new Error("Password must be at least 8 characters");
        const hash = await hashPassword(updates.password);
        await asyncStorage.savePasswordHash(updated.id, hash);
      }
      const allUsers = await asyncStorage.getUsers();
      const newUsers = allUsers.map((u) => (u.id === updated.id ? updated : u));
      await asyncStorage.saveUsers(newUsers);
      setUsers(newUsers);
      setCurrentUser(updated);
    },
    [currentUser],
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
    [loading, users, currentUser, register, login, logout, switchUser, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
