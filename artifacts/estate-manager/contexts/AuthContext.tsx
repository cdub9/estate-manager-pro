import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { User } from "@/types";
import { uuid } from "@/utils/uuid";

const USERS_KEY = "estate.users";
const SESSION_KEY = "estate.session";

interface AuthContextValue {
  loading: boolean;
  users: User[];
  currentUser: User | null;
  register: (name: string, password: string) => Promise<User>;
  login: (name: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "name" | "password">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [usersRaw, sessionRaw] = await Promise.all([
          AsyncStorage.getItem(USERS_KEY),
          AsyncStorage.getItem(SESSION_KEY),
        ]);
        const loadedUsers: User[] = usersRaw ? JSON.parse(usersRaw) : [];
        setUsers(loadedUsers);
        if (sessionRaw) {
          const found = loadedUsers.find((u) => u.id === sessionRaw);
          if (found) setCurrentUser(found);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persistUsers = useCallback(async (next: User[]) => {
    setUsers(next);
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(next));
  }, []);

  const persistSession = useCallback(async (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      await AsyncStorage.setItem(SESSION_KEY, user.id);
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const register = useCallback<AuthContextValue["register"]>(
    async (name, password) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Name is required");
      if (password.length < 4) throw new Error("Password must be at least 4 characters");
      if (
        users.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())
      ) {
        throw new Error("That name is already taken");
      }
      const newUser: User = {
        id: uuid(),
        name: trimmed,
        password,
        colorIndex: users.length,
        createdAt: Date.now(),
      };
      const next = [...users, newUser];
      await persistUsers(next);
      await persistSession(newUser);
      return newUser;
    },
    [users, persistUsers, persistSession],
  );

  const login = useCallback<AuthContextValue["login"]>(
    async (name, password) => {
      const found = users.find(
        (u) => u.name.toLowerCase() === name.trim().toLowerCase(),
      );
      if (!found) throw new Error("No user with that name");
      if (found.password !== password) throw new Error("Incorrect password");
      await persistSession(found);
      return found;
    },
    [users, persistSession],
  );

  const logout = useCallback(async () => {
    await persistSession(null);
  }, [persistSession]);

  const switchUser = useCallback(
    async (userId: string) => {
      const found = users.find((u) => u.id === userId);
      if (!found) throw new Error("User not found");
      await persistSession(found);
    },
    [users, persistSession],
  );

  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (updates) => {
      if (!currentUser) throw new Error("Not signed in");
      const trimmedName = updates.name?.trim();
      if (
        trimmedName &&
        users.some(
          (u) =>
            u.id !== currentUser.id &&
            u.name.toLowerCase() === trimmedName.toLowerCase(),
        )
      ) {
        throw new Error("That name is already taken");
      }
      const next = users.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              ...(trimmedName ? { name: trimmedName } : {}),
              ...(updates.password ? { password: updates.password } : {}),
            }
          : u,
      );
      await persistUsers(next);
      const updated = next.find((u) => u.id === currentUser.id) ?? null;
      setCurrentUser(updated);
    },
    [users, currentUser, persistUsers],
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
