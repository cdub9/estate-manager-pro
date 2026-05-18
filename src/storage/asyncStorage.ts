import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { Category, InventoryItem, Task, User } from "@/types";

import { IStorage } from "./types";

const KEYS = {
  users: "estate.users",
  session: "estate.session",
  tasks: "estate.tasks",
  categories: "estate.categories",
  inventory: "estate.inventory",
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(`secure.${key}`);
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(`secure.${key}`, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(`secure.${key}`);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const asyncStorage: IStorage = {
  async getUsers() {
    return readJson<User[]>(KEYS.users, []);
  },
  async saveUsers(users) {
    await writeJson(KEYS.users, users);
  },
  async getPasswordHash(userId) {
    return secureGet(`pw.${userId}`);
  },
  async savePasswordHash(userId, hash) {
    await secureSet(`pw.${userId}`, hash);
  },
  async removePasswordHash(userId) {
    await secureDelete(`pw.${userId}`);
  },
  async getSession() {
    return readJson<string | null>(KEYS.session, null);
  },
  async saveSession(userId) {
    if (userId) {
      await writeJson(KEYS.session, userId);
    } else {
      await AsyncStorage.removeItem(KEYS.session);
    }
  },
  async getTasks() {
    return readJson<Task[]>(KEYS.tasks, []);
  },
  async saveTasks(tasks) {
    await writeJson(KEYS.tasks, tasks);
  },
  async getCategories() {
    return readJson<Category[]>(KEYS.categories, []);
  },
  async saveCategories(categories) {
    await writeJson(KEYS.categories, categories);
  },
  async getInventory() {
    return readJson<InventoryItem[]>(KEYS.inventory, []);
  },
  async saveInventory(items) {
    await writeJson(KEYS.inventory, items);
  },
};
