<template>
  <div class="monaco-editor-container" ref="editorContainer" :style="containerStyle"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import * as monaco from "monaco-editor";

const props = defineProps<{
  modelValue: string;
  language?: string;
  readOnly?: boolean;
  height?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const editorContainer = ref<HTMLElement>();
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// 计算容器样式
const containerStyle = computed(() => ({
  height: props.height || '100%'
}));

// 监听主题变化
const updateEditorTheme = (isDark: boolean) => {
  if (editor) {
    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
  }
};

// 监听 data-theme 属性变化
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === 'data-theme') {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      updateEditorTheme(isDark);
    }
  });
});

onMounted(() => {
  if (editorContainer.value) {
    // 获取当前主题
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // 创建编辑器时设置初始主题
    editor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language || "json",
      theme: isDark ? 'vs-dark' : 'vs',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      readOnly: props.readOnly,
      fontSize: 13,
      lineNumbers: "on",
      renderLineHighlight: "all",
      roundedSelection: false,
      tabSize: 2,
      wordWrap: "on",
      formatOnPaste: true,
      formatOnType: true,
    });

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      emit("update:modelValue", editor?.getValue() || "");
    });

    // 配置 JSON 格式化
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [],
    });

    // 开始观察 document.documentElement 的 data-theme 属性变化
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }
});

// 监听值的变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && newValue !== editor.getValue()) {
      editor.setValue(newValue);
    }
  }
);

onBeforeUnmount(() => {
  // 清理观察器
  observer.disconnect();
  
  // 销毁编辑器
  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  border: 1px solid var(--border-color);
  min-height: 100px;
  background-color: var(--code-bg);
}
</style>
