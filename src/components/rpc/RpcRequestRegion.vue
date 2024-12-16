<template>
  <div class="request-region">
    <div class="request-editor">
      <CodeEditor
        v-model="requestData"
        language="json"
        editor-id="request-editor"
        :readOnly="isLoading"
        :hideToolbar="false"
        @change="handleEditorChange"
      />
    </div>
    <div class="request-actions">
      <el-button
        type="primary"
        :loading="isLoading"
        @click="handleInvoke"
      >
        发送请求
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import CodeEditor from '../CodeEditor.vue';

const requestData = ref(JSON.stringify({ message: 'Hello' }, null, 2));
const isLoading = ref(false);

const handleEditorChange = (value: string) => {
  console.log('Editor content changed:', value);
};

watch(requestData, (newValue) => {
  console.log('Request data changed:', newValue);
});

onMounted(() => {
  try {
    const parsed = JSON.parse(requestData.value);
    requestData.value = JSON.stringify(parsed, null, 2);
  } catch (error) {
    console.error('Failed to parse initial request data:', error);
  }
});

const handleInvoke = async () => {
  // ... 处理请求逻辑
};
</script>

<style scoped>
.request-region {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  position: relative;
  background-color: var(--bg-color);
}

.request-editor {
  flex: 1;
  min-height: 200px;
  height: calc(100% - 60px);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.request-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0;
  height: 44px;
  flex-shrink: 0;
}

:deep(.code-editor-wrapper) {
  height: 100%;
  min-height: 200px;
}

:deep(.monaco-editor-container) {
  height: 100% !important;
  min-height: 200px;
}
</style> 