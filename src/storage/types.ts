import { Category, InventoryItem, Task, User } from "@/types";

export interface IStorage {
  // Auth
  getUsers(): Promise<User[]>;
  saveUsers(users: User[]): Promise<void>;
  getPasswordHash(userId: string): Promise<string | null>;
  savePasswordHash(userId: string, hash: string): Promise<void>;
  removePasswordHash(userId: string): Promise<void>;
  getSession(): Promise<string | null>;
  saveSession(userId: string | null): Promise<void>;

  // Tasks
  getTasks(): Promise<Task[]>;
  saveTasks(tasks: Task[]): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  saveCategories(categories: Category[]): Promise<void>;

  // Inventory
  getInventory(): Promise<InventoryItem[]>;
  saveInventory(items: InventoryItem[]): Promise<void>;
}
