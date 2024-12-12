<template>
  <el-drawer
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    title="请求详情"
    size="50%"
  >
    <div class="request-details">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h3 class="section-title">基本信息</h3>
        <div class="detail-item">
          <span class="label">请求类型:</span>
          <span class="value">{{ details.type }}</span>
        </div>
        <div class="detail-item">
          <span class="label">请求地址:</span>
          <span class="value">{{ details.url }}</span>
        </div>
        <div class="detail-item" v-if="details.type === 'http'">
          <span class="label">请求方法:</span>
          <span class="value">{{ details.method }}</span>
        </div>
        <div class="detail-item" v-if="details.type === 'rpc'">
          <span class="label">服务方法:</span>
          <span class="value">{{ details.serviceMethod }}</span>
        </div>
      </div>

      <!-- 请求报文 -->
      <div class="detail-section">
        <h3 class="section-title">请求报文</h3>
        <el-collapse v-model="activeCollapseNames" class="request-details">
          <!-- General 信息 -->
          <el-collapse-item name="general" class="request-details-item">
            <template #title>
              <span class="collapse-title">General</span>
            </template>
            <div class="detail-content">
              <pre>{{ details.requestMessage }}</pre>
            </div>
          </el-collapse-item>

          <!-- Headers -->
          <el-collapse-item name="headers" class="request-details-item" v-if="details.headers">
            <template #title>
              <span class="collapse-title">Headers</span>
            </template>
            <div class="detail-content">
              <pre>{{ formatHeaders(details.headers) }}</pre>
            </div>
          </el-collapse-item>

          <!-- Request Body -->
          <el-collapse-item name="body" class="request-details-item" v-if="details.params">
            <template #title>
              <span class="collapse-title">Request Body</span>
            </template>
            <div class="detail-content">
              <pre>{{ formatBody(details.params) }}</pre>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const props = defineProps<{
  modelValue: boolean
  details: {
    type: string
    url: string
    method?: string
    serviceMethod?: string
    requestMessage: string
    headers?: Record<string, string>
    params?: any
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const activeCollapseNames = ref(['general'])

const formatHeaders = (headers: Record<string, string>) => {
  return Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
}

const formatBody = (body: any) => {
  return typeof body === 'string' ? body : JSON.stringify(body, null, 2)
}
</script>

<style scoped>
.request-details {
  padding: 20px;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--el-text-color-primary);
}

.detail-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.label {
  width: 100px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.value {
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.collapse-title {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.detail-content {
  padding: 8px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 14px;
}
</style>
