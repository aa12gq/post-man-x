export interface RequestHistory {
  id: string
  type: 'http' | 'rpc'
  url: string
  method: string
  params: string
  timestamp: number
}

export class StorageService {
  private static instance: StorageService
  private readonly HISTORY_KEY = 'request_history'
  private readonly MAX_HISTORY = 50

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  public saveToHistory(request: Omit<RequestHistory, 'id' | 'timestamp'>) {
    const history = this.getHistory()
    const newRequest: RequestHistory = {
      ...request,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    
    history.unshift(newRequest)
    
    // 限制历史记录数量
    if (history.length > this.MAX_HISTORY) {
      history.pop()
    }
    
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history))
  }

  public getHistory(): RequestHistory[] {
    const history = localStorage.getItem(this.HISTORY_KEY)
    return history ? JSON.parse(history) : []
  }

  public clearHistory() {
    localStorage.removeItem(this.HISTORY_KEY)
  }
}

export default StorageService.getInstance() 