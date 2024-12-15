import { nanoid } from "nanoid";
import type {
  HistoryItem,
  RequestTab,
  Settings,
  Folder,
} from "../types";

// 使用不同的名称
type StorageFavoriteItem = FavoriteItem;
type StorageEnvironment = Environment;

// 存储键名常量
const STORAGE_KEYS = {
  HISTORY: "pmx_history",
  FAVORITES: "pmx_favorites",
  ENVIRONMENTS: "pmx_environments",
  TABS: "pmx_tabs",
  SETTINGS: "pmx_settings",
} as const;

// 默认设置
const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  fontSize: 14,
  autoSave: true,
  maxHistoryItems: 100,
};

export interface FavoriteItem {
  id: string;
}

export interface Environment {
  id: string;
}

class StorageService {
  public getItem<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key);
    if (!item) {
      return defaultValue;
    }
    try {
      const parsed = JSON.parse(item);
      return parsed;
    } catch (error) {
      return defaultValue;
    }
  }

  public setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // 历史记录管理
  getHistory(): HistoryItem[] {
    const history = this.getItem(STORAGE_KEYS.HISTORY, []);
    if (!history) {
      this.setItem(STORAGE_KEYS.HISTORY, []);
      return [];
    }
    if (!Array.isArray(history)) {
      return [];
    }
    return (history as HistoryItem[]).map((item) => ({
      ...item,
      name: item.name || item.url,
      timestamp: item.timestamp || Date.now(),
    }));
  }

  addHistoryItem(item: HistoryItem) {
    const history = this.getHistory();

    // 创建新项
    const newItem = {
      ...item,
      id: item.id || nanoid(),
      timestamp: item.timestamp || Date.now(),
      name: item.name || item.url,
      folderId: item.folderId,
      type: item.type,
      url: item.url || "",
      method: item.method || "",
      response: item.response || { status: 0, data: null, headers: {} },
      requestMessage: item.requestMessage || "",
      debugInfo: item.debugInfo || "",
      debugCommand: item.debugCommand || "",
    };

    // 创建新的历史记录数组
    const newHistory = [newItem, ...history];

    // 保存新的历史记录数组
    this.setItem(STORAGE_KEYS.HISTORY, newHistory);

    console.log("History after adding:", this.getHistory());
    return newItem;
  }

  removeHistoryItem(id: string): void {
    const history = this.getHistory();
    const index = history.findIndex((item) => item.id === id);
    if (index !== -1) {
      history.splice(index, 1);
      this.setItem(STORAGE_KEYS.HISTORY, history);
    }
  }

  clearHistory(): void {
    this.setItem(STORAGE_KEYS.HISTORY, []);
  }

  // 收藏夹管理
  getFavorites(): StorageFavoriteItem[] {
    return this.getItem<StorageFavoriteItem[]>(STORAGE_KEYS.FAVORITES, []);
  }

  addFavorite(item: StorageFavoriteItem): void {
    const favorites = this.getFavorites();
    favorites.push(item);
    this.setItem(STORAGE_KEYS.FAVORITES, favorites);
  }

  removeFavorite(id: string): void {
    const favorites = this.getFavorites();
    const index = favorites.findIndex((item) => item.id === id);
    if (index !== -1) {
      favorites.splice(index, 1);
      this.setItem(STORAGE_KEYS.FAVORITES, favorites);
    }
  }

  // 环境变量管理
  getEnvironments(): StorageEnvironment[] {
    return this.getItem<StorageEnvironment[]>(STORAGE_KEYS.ENVIRONMENTS, []);
  }

  saveEnvironment(env: StorageEnvironment): void {
    const environments = this.getEnvironments();
    const index = environments.findIndex((e) => e.id === env.id);
    if (index !== -1) {
      environments[index] = env;
    } else {
      environments.push(env);
    }
    this.setItem(STORAGE_KEYS.ENVIRONMENTS, environments);
  }

  removeEnvironment(id: string): void {
    const environments = this.getEnvironments();
    const index = environments.findIndex((e) => e.id === id);
    if (index !== -1) {
      environments.splice(index, 1);
      this.setItem(STORAGE_KEYS.ENVIRONMENTS, environments);
    }
  }

  // 标签页状态管理
  getTabs(): RequestTab[] {
    return this.getItem<RequestTab[]>(STORAGE_KEYS.TABS, []);
  }

  saveTabs(tabs: RequestTab[]): void {
    this.setItem(STORAGE_KEYS.TABS, tabs);
  }

  // 应用设置管理
  getSettings(): Settings {
    return this.getItem<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  saveSettings(settings: Settings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // 添加文件夹相关的存储方法
  getFolders(): Folder[] {
    return this.getItem<Folder[]>("pmx_folders", []);
  }

  saveFolders(folders: Folder[]) {
    this.setItem("pmx_folders", folders);
  }

  // 保存请求的文件夹系
  saveRequestFolder(requestId: string, folderId?: string) {
    const history = this.getHistory();
    const item = history.find((h) => h.id === requestId);
    if (item) {
      item.folderId = folderId;
      this.setItem(STORAGE_KEYS.HISTORY, history);
      return item;
    }
  }

  getRequestFolderRelationships(): Record<string, string | undefined> {
    return this.getItem<Record<string, string | undefined>>(
      "pmx_request_folders",
      {}
    );
  }

  // 添加公共方法来更新历史记录
  updateHistory(history: HistoryItem[]): void {
    this.setItem(STORAGE_KEYS.HISTORY, history);
  }
}

export const storage = new StorageService();
