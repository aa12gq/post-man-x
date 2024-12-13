<template>
  <div ref="editorContainer" class="monaco-editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";

// 配置 worker
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === "json") {
      return new jsonWorker();
    }
    return new editorWorker();
  },
};

const props = defineProps<{
  modelValue: string;
  language?: string;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
}>();

const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// 获取当前主题
const getCurrentTheme = () => {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "vs-dark"
    : "vs";
};

onMounted(async () => {
  if (!editorContainer.value) return;

  // 创建编辑器
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: props.language || "json",
    theme: getCurrentTheme(),
    automaticLayout: true,
    minimap: { enabled: false },
    readOnly: props.readOnly,
    scrollBeyondLastLine: false,
    fontSize: 14,
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
    padding: { top: 0, bottom: 0 },
    lineNumbers: "on",
    folding: false,
    wordWrap: "on",
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 3,
    glyphMargin: false,
    fixedOverflowWidgets: true,
  });

  // 配置 JSON 格式化
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: true,
    schemas: [],
  });

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || "";
    emit("update:modelValue", value);
    emit("change", value);
  });

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
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  border: none;
  border-radius: 0;
  overflow: hidden;
}

:deep(.monaco-editor) {
  padding: 0;
}

:deep(.monaco-editor .margin),
:deep(.monaco-editor .monaco-editor-background) {
  background-color: var(--bg-color) !important;
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
</style>
