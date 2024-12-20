<template>
  <div class="message-editor">
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
    <div class="editor-toolbar">
      <el-button
        size="small"
        @click="$emit('generate-example')"
        :disabled="!hasMethod"
      >
        <ExampleMessageIcon class="icon" />
        Use Example Message
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import CodeEditor from "../CodeEditor.vue";
import ExampleMessageIcon from "../icons/ExampleMessageIcon.vue";

const props = defineProps<{
  message: any;
  hasMethod: boolean;
}>();

const emit = defineEmits<{
  "update:message": [value: any];
  "generate-example": [];
}>();

// 本地消息状态
const localMessage = ref(
  typeof props.message === "object"
    ? JSON.stringify(props.message, null, 2)
    : props.message || ""
);

// 监听 props.message 的变化
watch(
  () => props.message,
  (newValue) => {
    localMessage.value =
      typeof newValue === "object"
        ? JSON.stringify(newValue, null, 2)
        : newValue || "";
  },
  { deep: true }
);

// 确保初始数据正确格式化
onMounted(() => {
  try {
    if (typeof props.message === "object") {
      localMessage.value = JSON.stringify(props.message, null, 2);
    } else if (props.message) {
      // 尝试解析并格式化 JSON 字符串
      const parsed = JSON.parse(props.message);
      localMessage.value = JSON.stringify(parsed, null, 2);
    } else {
      localMessage.value = "{\n  \n}";
    }
  } catch (error) {
    console.warn("Failed to parse message:", error);
    localMessage.value = props.message || "{\n  \n}";
  }
});

const handleChange = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    emit("update:message", parsed);
  } catch (e) {
    // 如果不是有效的 JSON，直接发送原始字符串
    emit("update:message", value);
  }
};
</script>

<style scoped>
.message-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--surface-1);
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
  padding: 4px;
  margin-top: auto;
}

:deep(.code-editor-wrapper) {
  height: 100%;
  min-height: 200px;
  background-color: var(--surface-1);
}

:deep(.monaco-editor-container) {
  height: 100% !important;
  min-height: 200px;
  background-color: var(--surface-1);
}

:deep(.monaco-editor) {
  height: 100% !important;
  flex: 1;
}

/* 按钮样式 */
:deep(.el-button) {
  color: var(--text-secondary);
  background-color: transparent;
  border: none;
  padding: 8px 12px;
}

:deep(.el-button:hover) {
  color: var(--text);
  background-color: var(--hover-color);
}

:deep(.el-button:disabled) {
  color: var(--text-secondary);
  background-color: transparent;
  opacity: 0.6;
}

:deep(.el-button .icon) {
  margin-right: 6px;
  margin-left: -2px;
}
</style>
