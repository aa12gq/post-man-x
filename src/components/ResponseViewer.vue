<template>
  <div class="response-viewer">
    <div class="response-header">
      <h3>响应结果</h3>
      <div class="response-actions">
        <span v-if="responseTime" class="response-time">
          响应时间: {{ responseTime }}ms
        </span>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="preview">预览</el-radio-button>
          <el-radio-button value="raw">原始</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="copyResponse">复制</el-button>
      </div>
    </div>

    <div class="response-content">
      <!-- JSON预览模式 -->
      <div v-if="viewMode === 'preview'" class="json-viewer">
        <pre v-if="isJson" class="json-formatted">{{ formattedJson }}</pre>
        <pre v-else>{{ response }}</pre>
      </div>

      <!-- 原始模式 -->
      <el-input
        v-else
        :model-value="response"
        type="textarea"
        :rows="10"
        readonly
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  response: string
  responseTime?: number
}>()

const viewMode = ref<'preview' | 'raw'>('preview')

const isJson = computed(() => {
  try {
    JSON.parse(props.response)
    return true
  } catch {
    return false
  }
})

const formattedJson = computed(() => {
  if (isJson.value) {
    try {
      return JSON.stringify(JSON.parse(props.response), null, 2)
    } catch {
      return props.response
    }
  }
  return props.response
})

const copyResponse = async () => {
  try {
    await navigator.clipboard.writeText(props.response)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.response-viewer {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

.response-header {
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
}

.response-body {
  color: var(--text-color);
}

.response-tabs {
  border-bottom: 1px solid var(--border-color);
}

.response-tab {
  color: var(--text-color);
  border-bottom: 2px solid transparent;
}

.response-tab.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.response-tab:hover {
  color: var(--primary-color);
}

.status-code {
  color: var(--text-color-secondary);
}

.status-code.success {
  color: var(--success-color);
}

.status-code.error {
  color: var(--danger-color);
}

.response-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.response-time {
  color: var(--text-color);
}

.response-content {
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  border-radius: 4px;
  padding: 10px;
  min-height: 200px;
  max-height: 600px;
  overflow: auto;
}

.json-viewer {
  font-family: monospace;
}

.json-formatted {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-color);
  line-height: 1.5;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-color);
}
</style> 