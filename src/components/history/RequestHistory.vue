<template>
  <div class="history-container">
    <RequestHistoryTable
      :history-list="historyList"
      @load="$emit('load-request', $event)"
      @view-details="$emit('view-details', $event)"
      @remove="$emit('remove-item', $event)"
      @clear="$emit('clear-history')"
    />
  </div>
</template>

<script setup lang="ts">
import RequestHistoryTable from './RequestHistoryTable.vue'

interface HistoryItem {
  id: string
  type: 'http' | 'rpc'
  url: string
  method?: string
  serviceMethod?: string
  params?: any
  timestamp: number
  response: {
    status: string | number
    data: any
    headers: Record<string, string>
  }
  requestMessage: string
}

defineProps<{
  historyList: HistoryItem[]
}>()

defineEmits<{
  (e: 'load-request', item: HistoryItem): void
  (e: 'view-details', item: HistoryItem): void
  (e: 'remove-item', item: HistoryItem): void
  (e: 'clear-history'): void
}>()
</script>

<style scoped>
.history-container {
  height: 100%;
  padding: 16px;
}
</style>
