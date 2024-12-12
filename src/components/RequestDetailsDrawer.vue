<template>
  <el-drawer
    v-model="visible"
    title="Request Details"
    size="50%"
  >
    <div class="request-details">
      <div class="detail-section">
        <h3>Basic Info</h3>
        <div class="detail-item">
          <span class="label">Type:</span>
          <span class="value">{{ details.type }}</span>
        </div>
        <div class="detail-item">
          <span class="label">URL:</span>
          <span class="value">{{ details.url }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Method:</span>
          <span class="value">{{ details.method }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3>Headers</h3>
        <div v-if="Object.keys(details.headers || {}).length">
          <div v-for="(value, key) in details.headers" :key="key" class="detail-item">
            <span class="label">{{ key }}:</span>
            <span class="value">{{ value }}</span>
          </div>
        </div>
        <div v-else class="empty-message">No headers</div>
      </div>

      <div class="detail-section">
        <h3>Request Message</h3>
        <CodeEditor
          v-if="details.requestMessage"
          :model-value="formatMessage(details.requestMessage)"
          language="json"
          :read-only="true"
          height="200px"
        />
        <div v-else class="empty-message">No request message</div>
      </div>

      <div class="detail-section">
        <h3>Parameters</h3>
        <CodeEditor
          v-if="details.params"
          :model-value="formatMessage(details.params)"
          language="json"
          :read-only="true"
          height="200px"
        />
        <div v-else class="empty-message">No parameters</div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CodeEditor from './CodeEditor.vue'

const props = defineProps<{
  modelValue: boolean
  details: {
    type: string
    url: string
    method: string
    requestMessage?: string
    headers?: Record<string, string>
    params?: any
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatMessage = (message: any): string => {
  try {
    return typeof message === 'string' 
      ? message 
      : JSON.stringify(message, null, 2)
  } catch {
    return String(message)
  }
}
</script>

<style scoped>
.request-details {
  padding: 16px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-size: 16px;
}

.detail-item {
  display: flex;
  margin-bottom: 8px;
}

.label {
  width: 120px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.value {
  flex: 1;
  word-break: break-all;
}

.empty-message {
  color: var(--el-text-color-secondary);
  font-style: italic;
}
</style> 