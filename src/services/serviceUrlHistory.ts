import { storage } from './storage'

const HISTORY_KEY = 'service_url_history'
const MAX_HISTORY_LENGTH = 10

export class ServiceUrlHistoryService {
  private static getHistory(): string[] {
    return storage.get(HISTORY_KEY, [])
  }

  private static saveHistory(history: string[]) {
    storage.set(HISTORY_KEY, history)
  }

  static addToHistory(url: string) {
    const history = this.getHistory()
    
    // Remove existing entry if present
    const index = history.indexOf(url)
    if (index !== -1) {
      history.splice(index, 1)
    }
    
    // Add to front of array
    history.unshift(url)
    
    // Keep only the most recent entries
    if (history.length > MAX_HISTORY_LENGTH) {
      history.length = MAX_HISTORY_LENGTH
    }
    
    this.saveHistory(history)
  }

  static getUrlSuggestions(query: string): string[] {
    const history = this.getHistory()
    if (!query) return history
    
    const lowerQuery = query.toLowerCase()
    return history.filter(url => url.toLowerCase().includes(lowerQuery))
  }

  static clearHistory() {
    this.saveHistory([])
  }
}
