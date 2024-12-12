<template>
  <div class="http-request-form">
    <!-- URL 和方法选择器 -->
    <div class="request-url-bar">
      <el-select
        v-model="method"
        class="method-select"
        size="default"
      >
        <el-option
          v-for="m in HTTP_METHODS"
          :key="m"
          :label="m"
          :value="m"
        />
      </el-select>

      <el-autocomplete
        v-model="url"
        class="url-input"
        placeholder="Enter request URL"
        :fetch-suggestions="handleUrlSuggestions"
        clearable
        @change="$emit('update:url', $event)"
      />

      <el-button
        type="primary"
        :loading="loading"
        @click="$emit('send')"
      >
        Send
      </el-button>
    </div>

    <!-- 请求选项卡 -->
    <el-tabs v-model="activeTab" class="request-tabs">
      <!-- Params -->
      <el-tab-pane label="Params" name="params">
        <ParamsEditor
          v-model:params="queryParams"
          @update:params="handleParamsUpdate"
        />
      </el-tab-pane>

      <!-- Headers -->
      <el-tab-pane label="Headers" name="headers">
        <HeadersEditor
          v-model:headers="headers"
          @update:headers="$emit('update:headers', $event)"
        />
      </el-tab-pane>

      <!-- Body -->
      <el-tab-pane label="Body" name="body">
        <div class="body-editor">
          <div class="body-type-selector">
            <el-radio-group v-model="bodyType" size="small">
              <el-radio-button value="none">none</el-radio-button>
              <el-radio-button value="form-data">form-data</el-radio-button>
              <el-radio-button value="x-www-form-urlencoded">x-www-form-urlencoded</el-radio-button>
              <el-radio-button value="raw">raw</el-radio-button>
              <el-radio-button value="binary">binary</el-radio-button>
            </el-radio-group>

            <el-select
              v-if="bodyType === 'raw'"
              v-model="rawContentType"
              size="small"
              style="width: 120px"
            >
              <el-option label="Text" value="text/plain" />
              <el-option label="JSON" value="application/json" />
              <el-option label="XML" value="application/xml" />
              <el-option label="HTML" value="text/html" />
            </el-select>
          </div>

          <component
            :is="bodyEditorComponent"
            v-model="requestBody"
            @update:modelValue="handleBodyUpdate"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ParamsEditor from './ParamsEditor.vue'
import HeadersEditor from './HeadersEditor.vue'
import RawEditor from './RawEditor.vue'
import FormDataEditor from './FormDataEditor.vue'
import BinaryEditor from './BinaryEditor.vue'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

const props = defineProps<{
  initialMethod?: string
  initialUrl?: string
  initialHeaders?: Record<string, string>
  initialParams?: Record<string, string>
  initialBody?: any
  loading?: boolean
}>()

const emit = defineEmits([
  'update:method',
  'update:url',
  'update:headers',
  'update:params',
  'update:body',
  'send'
])

// 基础状态
const method = ref(props.initialMethod || 'GET')
const url = ref(props.initialUrl || '')
const headers = ref(props.initialHeaders || {})
const queryParams = ref(props.initialParams || {})
const activeTab = ref('params')

// Body 相关状态
const bodyType = ref('none')
const rawContentType = ref('application/json')
const requestBody = ref(props.initialBody || '')

// URL 建议
const handleUrlSuggestions = (query: string, cb: (data: any[]) => void) => {
  const suggestions = !query ? [] : [{ value: query }]
  cb(suggestions)
}

// Body 编辑器组件选择
const bodyEditorComponent = computed(() => {
  switch (bodyType.value) {
    case 'raw':
      return RawEditor
    case 'form-data':
      return FormDataEditor
    case 'binary':
      return BinaryEditor
    default:
      return 'div'
  }
})

// 更新处理器
const handleParamsUpdate = (newParams: Record<string, string>) => {
  emit('update:params', newParams)
}

const handleBodyUpdate = (newBody: any) => {
  emit('update:body', newBody)
  
  // 更新 Content-Type header
  if (bodyType.value === 'raw') {
    const newHeaders = { ...headers.value, 'Content-Type': rawContentType.value }
    emit('update:headers', newHeaders)
  }
}

// 监听方法变化
watch(method, (newMethod) => {
  emit('update:method', newMethod)
})
</script>

<style scoped>
.http-request-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.request-url-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.method-select {
  width: 120px;
}

.url-input {
  flex: 1;
}

.request-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

.body-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.body-type-selector {
  display: flex;
  gap: 16px;
  align-items: center;
}
</style>
