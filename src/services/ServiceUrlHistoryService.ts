export class ServiceUrlHistoryService {
  private static instance: ServiceUrlHistoryService;
  private readonly HISTORY_KEY = 'service_url_history';
  private readonly MAX_HISTORY = 10;  // 最多保存10条历史记录

  private constructor() {}

  public static getInstance(): ServiceUrlHistoryService {
    if (!ServiceUrlHistoryService.instance) {
      ServiceUrlHistoryService.instance = new ServiceUrlHistoryService();
    }
    return ServiceUrlHistoryService.instance;
  }

  // 获取历史记录
  public getHistory(): string[] {
    const history = localStorage.getItem(this.HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  }

  // 添加新的服务地址到历史记录
  public addToHistory(url: string) {
    if (!url) return;
    
    const history = this.getHistory();
    
    // 如果已存在，先移除旧的
    const index = history.indexOf(url);
    if (index > -1) {
      history.splice(index, 1);
    }
    
    // 添加到开头
    history.unshift(url);
    
    // 限制数量
    if (history.length > this.MAX_HISTORY) {
      history.pop();
    }
    
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
  }

  // 清除历史记录
  public clearHistory() {
    localStorage.removeItem(this.HISTORY_KEY);
  }
}

export default ServiceUrlHistoryService.getInstance(); 