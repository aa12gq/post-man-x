<template>
  <div class="message-editor">
    <div class="editor-toolbar">
      <el-button
        size="small"
        @click="$emit('generate-example')"
        :disabled="!hasMethod"
      >
        Generate Example
      </el-button>
    </div>
    <div class="editor-container">
      <CodeEditor
        v-model="localMessage"
        language="json"
        :read-only="false"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import CodeEditor from '../CodeEditor.vue';

const props = defineProps<{
  message: any;
  hasMethod: boolean;
}>();

const emit = defineEmits<{
  'update:message': [value: any];
  'generate-example': [];
}>();

// 本地消息状态
const localMessage = ref(
  typeof props.message === 'object' 
    ? JSON.stringify(props.message, null, 2) 
    : props.message || ''
);

// 监听 props.message 的变化
watch(() => props.message, (newValue) => {
  localMessage.value = typeof newValue === 'object' 
    ? JSON.stringify(newValue, null, 2) 
    : newValue || '';
}, { deep: true });

const handleChange = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    emit('update:message', parsed);
  } catch (e) {
    // 如果不是有效的 JSON，直接发送原始字符串
    emit('update:message', value);
  }
};
</script>

<style scoped>
.message-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

:deep(.monaco-editor) {
  flex: 1;
}
</style>
