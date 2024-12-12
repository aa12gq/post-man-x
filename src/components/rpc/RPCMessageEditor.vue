<template>
  <div class="message-editor">
    <div v-if="hasMethod" class="editor-container">
      <CodeEditor
        v-model="localMessage"
        language="json"
        :read-only="false"
        @change="handleChange"
      />
      <div class="editor-toolbar">
        <el-button
          size="small"
          @click="$emit('generate-example')"
          :disabled="!hasMethod"
        >
          Generate Example
        </el-button>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>Select a method to edit message</p>
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
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
}

.editor-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 8px;
}
</style>
