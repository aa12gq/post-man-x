<template>
  <div class="code-editor-wrapper">
    <div class="editor-toolbar" v-if="!hideToolbar">
      <el-button-group>
        <el-button
          size="small"
          :icon="Document"
          @click="formatCode"
          :title="formatShortcut"
        >
          Format
        </el-button>
        <el-button
          size="small"
          :icon="CopyDocument"
          @click="copyCode"
          :title="copyShortcut"
        >
          Copy
        </el-button>
      </el-button-group>
    </div>
    <div
      ref="editorContainer"
      class="monaco-editor-container"
      v-show="isReady"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { setupEditor } from "../utils/editor";
import { Document, CopyDocument } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { editorManager } from "../utils/editorManager";

const props = defineProps<{
  modelValue: string;
  language?: string;
  readOnly?: boolean;
  hideToolbar?: boolean;
  editorId?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
}>();

const isReady = ref(false);
const editorContainer = ref<HTMLElement | null>(null);
let editor: any = null;

const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
const formatShortcut = isMac ? "⌘K" : "Ctrl+K";
const copyShortcut = isMac ? "⌘C" : "Ctrl+C";

// 获取当前主题
const getCurrentTheme = () => {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "vs-dark"
    : "vs";
};

// 格式化代码
const formatCode = () => {
  if (editor) {
    editor.getAction("editor.action.formatDocument")?.run();
  }
};

// 复制代码
const copyCode = async () => {
  if (editor) {
    const value = editor.getValue();
    try {
      await navigator.clipboard.writeText(value);
      ElMessage.success("Copied to clipboard");
    } catch (error) {
      ElMessage.error("Failed to copy");
    }
  }
};

onMounted(async () => {
  await nextTick();

  if (!editorContainer.value) {
    console.error("Editor container not found");
    return;
  }

  try {
    isReady.value = true;
    await nextTick();

    const id = props.editorId || "default";
    editor = await setupEditor(
      editorContainer.value,
      {
        value: props.modelValue,
        language: props.language || "json",
        theme: getCurrentTheme(),
        readOnly: props.readOnly,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
      },
      id
    );

    // 确保初始值被设置
    if (editor && props.modelValue) {
      editor.setValue(props.modelValue);
    }

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue() || "";
      emit("update:modelValue", value);
      emit("change", value);
    });
  } catch (error) {
    console.error("Failed to initialize Monaco editor:", error);
    ElMessage.error({
      message: "Failed to load editor",
      duration: 5000,
      showClose: true,
    });
    throw error;
  }

  // 监听主题变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-theme") {
        editor?.updateOptions({ theme: getCurrentTheme() });
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // 组件销毁时停止观察
  onBeforeUnmount(() => {
    observer.disconnect();
    if (props.editorId) {
      editorManager.disposeEditor(props.editorId);
    }
  });
});

// 监听 props 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && newValue !== editor.getValue()) {
      editor.setValue(newValue);
    }
  }
);

// 清理
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
    editor = null;
  }
});

// 暴露方法
defineExpose({
  editor,
  format: formatCode,
  copy: copyCode,
});
</script>

<style scoped>
.code-editor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: inherit;
  position: relative;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px;
  background-color: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  flex-shrink: 0;
  z-index: 1;
}

.monaco-editor-container {
  flex: 1;
  min-height: 200px;
  border: none;
  border-radius: 0;
  overflow: hidden;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.monaco-editor) {
  padding: 0;
  height: 100% !important;
}

:deep(.monaco-editor .margin),
:deep(.monaco-editor .monaco-editor-background) {
  background-color: var(--background) !important;
}

:deep(.monaco-editor .lines-content) {
  margin: 0;
  padding: 0;
}

:deep(.monaco-editor .editor-scrollable) {
  margin: 0;
  padding: 0;
}

:deep(.monaco-editor .overflow-guard) {
  margin: 0;
  padding: 0;
}

/* 禁用折叠图标 */
:deep(.monaco-editor .folding) {
  display: none !important;
}

/* 确保内容完全展开 */
:deep(.monaco-editor .view-line) {
  white-space: pre-wrap !important;
}

:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-button .el-icon) {
  margin: 0;
}

:deep(.monaco-editor .editor-statusbar-container) {
  position: absolute;
  bottom: 2px;
  right: 8px;
  padding: 1px 4px;
  font-size: 11px;
  background-color: var(--bg-color-light);
  border-radius: 3px;
  opacity: 0.9;
  z-index: 1;
  pointer-events: none;
}

:deep(.monaco-editor .editor-scrollable) {
  margin-bottom: 20px;
}
</style>
