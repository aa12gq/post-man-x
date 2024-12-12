import { ref, onMounted } from 'vue'
import { storage } from '../services/storage'
import type { HistoryItem } from '../types'

export function useRequestHistory() {
  const historyItems = ref<HistoryItem[]>([])

  // 加载历史记录
  const loadHistory = () => {
    historyItems.value = storage.getHistory()
  }

  // 添加历史记录
  const addHistoryItem = (item: HistoryItem) => {
    storage.addHistoryItem(item)
    loadHistory() // 重新加载以获取最新数据
  }

  // 删除历史记录项
  const removeHistoryItem = (id: string) => {
    storage.removeHistoryItem(id)
    loadHistory() // 重新加载以获取最新数据
  }

  // 清空历史记录
  const clearHistory = () => {
    storage.clearHistory()
    historyItems.value = []
  }

  // 组件挂载时加载历史记录
  onMounted(() => {
    loadHistory()
  })

  return {
    historyItems,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
    loadHistory
  }
}
