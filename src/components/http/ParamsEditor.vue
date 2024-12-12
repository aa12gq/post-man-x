<template>
  <div class="params-editor">
    <div class="editor-header">
      <el-button size="small" @click="addParam">
        <el-icon><Plus /></el-icon>
        Add Parameter
      </el-button>
    </div>

    <div class="params-list">
      <div v-for="(param, index) in paramsList" :key="index" class="param-item">
        <el-checkbox
          v-model="param.enabled"
          @change="updateParams"
          class="param-checkbox"
        />
        <el-input
          v-model="param.key"
          placeholder="Parameter"
          @change="updateParams"
          class="param-key"
        />
        <el-input
          v-model="param.value"
          placeholder="Value"
          @change="updateParams"
          class="param-value"
        />
        <el-button
          type="danger"
          size="small"
          circle
          @click="removeParam(index)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <div class="preview-section" v-if="paramsList.length > 0">
      <div class="preview-header">
        <span class="preview-title">Query String Preview</span>
        <el-button size="small" text @click="copyQueryString">
          <el-icon><DocumentCopy /></el-icon>
          Copy
        </el-button>
      </div>
      <div class="preview-content">
        {{ queryStringPreview }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface QueryParam {
  key: string
  value: string
  enabled: boolean
}

const props = defineProps<{
  params: Record<string, string>
}>()

const emit = defineEmits(['update:params'])

const paramsList = ref<QueryParam[]>([])

// 初始化参数列表
const initParamsList = () => {
  paramsList.value = Object.entries(props.params).map(([key, value]) => ({
    key,
    value,
    enabled: true
  }))
}

// 添加参数
const addParam = () => {
  paramsList.value.push({
    key: '',
    value: '',
    enabled: true
  })
}

// 移除参数
const removeParam = (index: number) => {
  paramsList.value.splice(index, 1)
  updateParams()
}

// 更新参数
const updateParams = () => {
  const newParams: Record<string, string> = {}
  paramsList.value.forEach(param => {
    if (param.enabled && param.key.trim()) {
      newParams[param.key.trim()] = param.value
    }
  })
  emit('update:params', newParams)
}

// 查询字符串预览
const queryStringPreview = computed(() => {
  const params = new URLSearchParams()
  paramsList.value.forEach(param => {
    if (param.enabled && param.key.trim()) {
      params.append(param.key.trim(), param.value)
    }
  })
  return params.toString()
})

// 复制查询字符串
const copyQueryString = async () => {
  try {
    await navigator.clipboard.writeText(queryStringPreview.value)
    ElMessage.success('Query string copied to clipboard')
  } catch (err) {
    ElMessage.error('Failed to copy query string')
  }
}

// 初始化
initParamsList()
</script>

<style scoped>
.params-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-header {
  display: flex;
  justify-content: flex-start;
}

.params-list {
  flex: 1;
  overflow-y: auto;
}

.param-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.param-checkbox {
  margin-right: 0;
}

.param-key,
.param-value {
  flex: 1;
}

.preview-section {
  padding: 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.preview-content {
  font-family: monospace;
  word-break: break-all;
  font-size: 13px;
}
</style>
