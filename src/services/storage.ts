import type {
  HistoryItem,
  FavoriteItem,
  Environment,
  RequestTab,
  Settings
} from '../types'

// 存储键名常量
const STORAGE_KEYS = {
  HISTORY: 'pmx_history',
  FAVORITES: 'pmx_favorites',
  ENVIRONMENTS: 'pmx_environments',
  TABS: 'pmx_tabs',
  SETTINGS: 'pmx_settings'
} as const

// 默认设置
const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  fontSize: 14,
  autoSave: true,
  maxHistoryItems: 100
}

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key)
    if (!item) return defaultValue
    try {
      return JSON.parse(item)
    } catch {
      return defaultValue
    }
  }

  private setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  // 历史记录管理
  getHistory(): HistoryItem[] {
    return this.getItem<HistoryItem[]>(STORAGE_KEYS.HISTORY, [])
  }

  addHistoryItem(item: HistoryItem): void {
    const history = this.getHistory()
    history.unshift(item)
    
    // 获取设置中的最大历史记录数量
    const settings = this.getSettings()
    const maxItems = settings.maxHistoryItems
    
    // 如果超出最大数量，删除旧的记录
    if (history.length > maxItems) {
      history.splice(maxItems)
    }
    
    this.setItem(STORAGE_KEYS.HISTORY, history)
  }

  removeHistoryItem(id: string): void {
    const history = this.getHistory()
    const index = history.findIndex(item => item.id === id)
    if (index !== -1) {
      history.splice(index, 1)
      this.setItem(STORAGE_KEYS.HISTORY, history)
    }
  }

  clearHistory(): void {
    this.setItem(STORAGE_KEYS.HISTORY, [])
  }

  // 收藏夹管理
  getFavorites(): FavoriteItem[] {
    return this.getItem<FavoriteItem[]>(STORAGE_KEYS.FAVORITES, [])
  }

  addFavorite(item: FavoriteItem): void {
    const favorites = this.getFavorites()
    favorites.push(item)
    this.setItem(STORAGE_KEYS.FAVORITES, favorites)
  }

  removeFavorite(id: string): void {
    const favorites = this.getFavorites()
    const index = favorites.findIndex(item => item.id === id)
    if (index !== -1) {
      favorites.splice(index, 1)
      this.setItem(STORAGE_KEYS.FAVORITES, favorites)
    }
  }

  // 环境变量管理
  getEnvironments(): Environment[] {
    return this.getItem<Environment[]>(STORAGE_KEYS.ENVIRONMENTS, [])
  }

  saveEnvironment(env: Environment): void {
    const environments = this.getEnvironments()
    const index = environments.findIndex(e => e.id === env.id)
    if (index !== -1) {
      environments[index] = env
    } else {
      environments.push(env)
    }
    this.setItem(STORAGE_KEYS.ENVIRONMENTS, environments)
  }

  removeEnvironment(id: string): void {
    const environments = this.getEnvironments()
    const index = environments.findIndex(e => e.id === id)
    if (index !== -1) {
      environments.splice(index, 1)
      this.setItem(STORAGE_KEYS.ENVIRONMENTS, environments)
    }
  }

  // 标签页状态管理
  getTabs(): RequestTab[] {
    return this.getItem<RequestTab[]>(STORAGE_KEYS.TABS, [])
  }

  saveTabs(tabs: RequestTab[]): void {
    this.setItem(STORAGE_KEYS.TABS, tabs)
  }

  // 应用设置管理
  getSettings(): Settings {
    return this.getItem<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS)
  }

  saveSettings(settings: Settings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings)
  }
}

export const storage = new StorageService()
