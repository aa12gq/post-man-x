<template>
  <div class="headers-editor">
    <div class="editor-header">
      <el-button size="small" @click="addHeader">
        <el-icon><Plus /></el-icon>
        Add Header
      </el-button>
      <el-dropdown @command="handlePresetCommand">
        <el-button size="small">
          Presets
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="content-type-json">
              Content-Type: application/json
            </el-dropdown-item>
            <el-dropdown-item command="accept-json">
              Accept: application/json
            </el-dropdown-item>
            <el-dropdown-item command="cors">
              CORS Headers
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="headers-list">
      <div v-for="(header, index) in headersList" :key="index" class="header-item">
        <el-checkbox
          v-model="header.enabled"
          @change="updateHeaders"
          class="header-checkbox"
        />
        <el-autocomplete
          v-model="header.key"
          :fetch-suggestions="handleHeaderSuggestions"
          placeholder="Header"
          @change="updateHeaders"
          class="header-key"
        />
        <el-input
          v-model="header.value"
          placeholder="Value"
          @change="updateHeaders"
          class="header-value"
        />
        <el-button
          type="danger"
          size="small"
          circle
          @click="removeHeader(index)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Delete, ArrowDown } from '@element-plus/icons-vue'

interface Header {
  key: string
  value: string
  enabled: boolean
}

// 常用 HTTP 头部
const COMMON_HEADERS = [
  'Accept',
  'Accept-Charset',
  'Accept-Encoding',
  'Accept-Language',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'Cookie',
  'Origin',
  'Referer',
  'User-Agent',
  'X-Requested-With'
]

const props = defineProps<{
  headers: Record<string, string>
}>()

const emit = defineEmits(['update:headers'])

const headersList = ref<Header[]>([])

// 初始化头部列表
const initHeadersList = () => {
  headersList.value = Object.entries(props.headers).map(([key, value]) => ({
    key,
    value,
    enabled: true
  }))
}

// 添加头部
const addHeader = () => {
  headersList.value.push({
    key: '',
    value: '',
    enabled: true
  })
}

// 移除头部
const removeHeader = (index: number) => {
  headersList.value.splice(index, 1)
  updateHeaders()
}

// 更新头部
const updateHeaders = () => {
  const newHeaders: Record<string, string> = {}
  headersList.value.forEach(header => {
    if (header.enabled && header.key.trim()) {
      newHeaders[header.key.trim()] = header.value
    }
  })
  emit('update:headers', newHeaders)
}

// 头部建议
const handleHeaderSuggestions = (query: string, cb: (data: any[]) => void) => {
  const suggestions = COMMON_HEADERS
    .filter(header => header.toLowerCase().includes(query.toLowerCase()))
    .map(value => ({ value }))
  cb(suggestions)
}

// 预设命令处理
const handlePresetCommand = (command: string) => {
  switch (command) {
    case 'content-type-json':
      addPresetHeader('Content-Type', 'application/json')
      break
    case 'accept-json':
      addPresetHeader('Accept', 'application/json')
      break
    case 'cors':
      addPresetHeader('Access-Control-Allow-Origin', '*')
      addPresetHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      addPresetHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      break
  }
}

// 添加预设头部
const addPresetHeader = (key: string, value: string) => {
  const existingIndex = headersList.value.findIndex(h => h.key.toLowerCase() === key.toLowerCase())
  if (existingIndex >= 0) {
    headersList.value[existingIndex].value = value
    headersList.value[existingIndex].enabled = true
  } else {
    headersList.value.push({
      key,
      value,
      enabled: true
    })
  }
  updateHeaders()
}

// 初始化
initHeadersList()
</script>

<style scoped>
.headers-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-header {
  display: flex;
  gap: 8px;
}

.headers-list {
  flex: 1;
  overflow-y: auto;
}

.header-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.header-checkbox {
  margin-right: 0;
}

.header-key {
  width: 200px;
}

.header-value {
  flex: 1;
}
</style>
