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

onMounted(() => {
  if (editorContainer.value) {
    // 创建编辑器
    editor = monaco.editor.create(editorContainer.value, {
      value: props.modelValue,
      language: props.language || "json",
      theme: "vs",
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
  if (editor) {
    editor.dispose();
  }
});
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  border: 1px solid #dcdfe6;
  min-height: 100px;
}
</style>
