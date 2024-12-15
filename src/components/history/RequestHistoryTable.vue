<template>
  <div class="history-table">
    <el-table 
      :data="historyList" 
      style="width: 100%"
      size="small"
      :max-height="500"
    >
      <el-table-column prop="type" label="类型" width="60">
        <template #default="{ row }">
          <el-tag :type="row.type === 'http' ? 'success' : 'warning'" size="small">
            {{ row.type.toUpperCase() }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="请求信息" min-width="200">
        <template #default="{ row }">
          <div class="request-info">
            <div class="url-info">
              <span v-if="row.type === 'http'" class="method-tag" :class="row.method?.toLowerCase()">
                {{ row.method }}
              </span>
              <el-tooltip :content="row.url" placement="top" :show-after="1000">
                <span class="url-text">{{ row.url }}</span>
              </el-tooltip>
            </div>
            <div class="service-method" v-if="row.type === 'rpc'">
              {{ row.serviceMethod }}
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="时间" width="160">
        <template #default="{ row }">
          <el-tooltip :content="formatFullDate(row.timestamp)" placement="top">
            <span>{{ formatRelativeTime(row.timestamp) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <div class="operation-buttons">
            <el-button @click="$emit('load', row)" size="small" type="primary" text>
              加载
            </el-button>
            <el-button @click="$emit('view-details', row)" size="small" type="info" text>
              详情
            </el-button>
            <el-button @click="$emit('remove', row)" size="small" type="danger" text>
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <el-button type="danger" size="small" @click="$emit('clear')" :disabled="!historyList.length">
        清空历史记录
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

defineProps<{
  historyList: any[]
}>();

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')
defineEmits<{
  (e: 'load', item: any): void
  (e: 'view-details', item: any): void
  (e: 'remove', item: any): void
  (e: 'clear'): void
}>()

const formatRelativeTime = (timestamp: number) => {
  return dayjs(timestamp).fromNow()
}

const formatFullDate = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<style scoped>
.history-table {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.request-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.url-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-tag {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.method-tag.get { background-color: #95de64; color: #135200; }
.method-tag.post { background-color: #69c0ff; color: #003a8c; }
.method-tag.put { background-color: #ffd666; color: #874d00; }
.method-tag.delete { background-color: #ff7875; color: #820014; }

.url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
  color: var(--el-text-color-regular);
}

.service-method {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.table-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
