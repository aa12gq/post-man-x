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
        editor-id="message-editor"
        :read-only="false"
        :hideToolbar="false"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
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

// 确保初始数据正确格式化
onMounted(() => {
  try {
    if (typeof props.message === 'object') {
      localMessage.value = JSON.stringify(props.message, null, 2);
    } else if (props.message) {
      // 尝试解析并格式化 JSON 字符串
      const parsed = JSON.parse(props.message);
      localMessage.value = JSON.stringify(parsed, null, 2);
    } else {
      localMessage.value = '{\n  \n}';
    }
  } catch (error) {
    console.warn('Failed to parse message:', error);
    localMessage.value = props.message || '{\n  \n}';
  }
});

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
  background-color: var(--background);
}

.editor-container {
  flex: 1;
  min-height: 200px;
  height: calc(100% - 60px);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
  background-color: var(--background);
}

:deep(.code-editor-wrapper) {
  height: 100%;
  min-height: 200px;
}

:deep(.monaco-editor-container) {
  height: 100% !important;
  min-height: 200px;
}

:deep(.monaco-editor) {
  height: 100% !important;
  flex: 1;
}
</style>
