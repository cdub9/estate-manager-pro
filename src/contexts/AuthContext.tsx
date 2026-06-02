import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { Timezone, User } from "@/types";
import { registerForPushNotifications } from "@/utils/notifications";

export const DEFAULT_TIMEZONE: Timezone = "America/Denver";

// ── DB row shape ───────────────────────────────────────────────────────────────
interface ProfileRow {
  id: string;
  estate_id: string;
  email: string;
  name: string;
  color_index: number;
  timezone: string;
  created_at: number;
  push_token?: string | null;
}

function rowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    colorIndex: row.color_index,
    timezone: (row.timezone as Timezone) ?? DEFAULT_TIMEZONE,
    createdAt: row.created_at,
    pushToken: row.push_token ?? null,
  };
}

// ── Context shape ──────────────────────────────────────────────────────────────
interface AuthContextValue {
  loading: boolean;
  users: User[];
  currentUser: User | null;
  estateId: string | null;
  estateName: string | null;
  estateJoinCode: string | null;
  register: (
    email: string,
    name: string,
    password: string,
    estateName?: string,
    estateCode?: string,
  ) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (
    updates: Partial<Pick<User, "name" | "timezone">> & { password?: string },
  ) => Promise<void>;
  updateEstateName: (name: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [estateId, setEstateId] = useState<string | null>(null);
  const [estateName, setEstateName] = useState<string | null>(null);
  const [estateJoinCode, setEstateJoinCode] = useState<string | null>(null);

  // Prevent double-loads during registration (signUp fires SIGNED_IN immediately)
  const loadingProfile = useRef(false);

  // ── Load all estate data for a given auth user ID ──────────────────────────
  const loadUserData = useCallback(async (userId: string): Promise<User | null> => {
    if (loadingProfile.current) return null;
    loadingProfile.current = true;
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !profile) return null; // Profile not yet created (mid-registration)

      const [{ data: estate }, { data: members }] = await Promise.all([
        supabase.from("estates").select("id, name, join_code").eq("id", profile.estate_id).single(),
        supabase.from("profiles").select("*").eq("estate_id", profile.estate_id),
      ]);

      const user = rowToUser(profile as ProfileRow);
      setCurrentUser(user);
      setUsers((members ?? []).map((p) => rowToUser(p as ProfileRow)));
      setEstateId(profile.estate_id);
      setEstateName(estate?.name ?? null);
      setEstateJoinCode(estate?.join_code ?? null);
      return user;
    } finally {
      loadingProfile.current = false;
    }
  }, []);

  // ── Initialise from persisted session ─────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUserData(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setCurrentUser(null);
          setUsers([]);
          setEstateId(null);
          setEstateName(null);
          setEstateJoinCode(null);
        }
        // SIGNED_IN is handled manually in login() / register() to avoid
        // a race where the profile row doesn't exist yet.
      },
    );

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback<AuthContextValue["register"]>(
    async (email, name, password, newEstateName, estateCode) => {
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error("Name is required");
      if (password.length < 8) throw new Error("Password must be at least 8 characters");

      // Create the Supabase auth user
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({ email: email.trim(), password });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Sign-up did not return a user");

      // Pick a color index based on how many estate members already exist
      const colorIndex = 0; // Will be set by the RPC based on estate member count; start at 0

      // Create estate + profile in one atomic RPC call
      const rpcName = estateCode ? "join_existing_estate" : "register_new_estate";
      const trimmedEstateName = newEstateName?.trim() || `${trimmedName}'s Estate`;
      const rpcParams = estateCode
        ? {
            p_join_code: estateCode.trim().toUpperCase(),
            p_email: email.trim(),
            p_name: trimmedName,
            p_color_index: colorIndex,
            p_timezone: DEFAULT_TIMEZONE,
          }
        : {
            p_email: email.trim(),
            p_name: trimmedName,
            p_estate_name: trimmedEstateName,
            p_color_index: colorIndex,
            p_timezone: DEFAULT_TIMEZONE,
          };

      const { error: rpcError } = await supabase.rpc(rpcName, rpcParams);
      if (rpcError) throw rpcError;

      // Now load the profile (it exists)
      const user = await loadUserData(signUpData.user.id);
      if (!user) throw new Error("Profile creation succeeded but could not be loaded");

      // Fix the colorIndex to reflect actual estate member count
      const memberCount = users.length; // users was just set by loadUserData
      if (memberCount > 0) {
        await supabase
          .from("profiles")
          .update({ color_index: memberCount % 8 })
          .eq("id", signUpData.user.id);
        setCurrentUser((u) => u ? { ...u, colorIndex: memberCount % 8 } : u);
      }

      // Register/refresh push token in the background — non-blocking
      registerForPushNotifications(user.id).catch(() => {});

      return user;
    },
    [loadUserData, users.length],
  );

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      const user = await loadUserData(data.user.id);
      if (!user) throw new Error("Account exists but no profile was found");
      // Register/refresh push token in the background — non-blocking
      registerForPushNotifications(user.id).catch(() => {});
      return user;
    },
    [loadUserData],
  );

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT handles clearing state
  }, []);

  // ── updateProfile ──────────────────────────────────────────────────────────
  const updateProfile = useCallback<AuthContextValue["updateProfile"]>(
    async (updates) => {
      if (!currentUser) throw new Error("Not signed in");

      const trimmedName = updates.name?.trim();
      if (trimmedName !== undefined && !trimmedName) {
        throw new Error("Name cannot be empty");
      }
      if (updates.password) {
        if (updates.password.length < 8) {
          throw new Error("Password must be at least 8 characters");
        }
        const { error } = await supabase.auth.updateUser({ password: updates.password });
        if (error) throw error;
      }

      const profileUpdates: Partial<ProfileRow> = {};
      if (trimmedName) profileUpdates.name = trimmedName;
      if (updates.timezone) profileUpdates.timezone = updates.timezone;

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(profileUpdates)
          .eq("id", currentUser.id);
        if (error) throw error;
      }

      const updated: User = {
        ...currentUser,
        ...(trimmedName ? { name: trimmedName } : {}),
        ...(updates.timezone ? { timezone: updates.timezone } : {}),
      };
      setCurrentUser(updated);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    },
    [currentUser],
  );

  // ── updateEstateName ───────────────────────────────────────────────────────
  const updateEstateName = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Estate name cannot be empty");
      if (!estateId) throw new Error("Not part of an estate");
      const { error } = await supabase
        .from("estates")
        .update({ name: trimmed })
        .eq("id", estateId);
      if (error) throw error;
      setEstateName(trimmed);
    },
    [estateId],
  );

  // ── deleteAccount ──────────────────────────────────────────────────────────
  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw error;
    await supabase.auth.signOut();
    // SIGNED_OUT handler clears all state
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      users,
      currentUser,
      estateId,
      estateName,
      estateJoinCode,
      register,
      login,
      logout,
      updateProfile,
      updateEstateName,
      deleteAccount,
    }),
    [loading, users, currentUser, estateId, estateName, estateJoinCode, register, login, logout, updateProfile, updateEstateName, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
