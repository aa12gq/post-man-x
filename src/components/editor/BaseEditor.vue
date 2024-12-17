<template>
  <div class="editor-wrapper">
    <EditorToolbar
      v-if="!hideToolbar"
      :model-value="modelValue"
      :current-language="language"
      @format="format"
      @copy="handleCopy"
      @language-change="handleLanguageChange"
    />
    <div 
      ref="editorContainer" 
      class="editor-container"
      :class="{ 'with-toolbar': !hideToolbar }"
      :style="{ height }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useSettings } from '../../stores/settings';
import { useThemeStore } from '../../stores/theme';
import { createEditorOptions, setupEditorKeybindings } from '../../utils/editor';
import EditorToolbar from './EditorToolbar.vue';
import { ElMessage } from 'element-plus';
import type * as monaco from 'monaco-editor';

const props = defineProps<{
  modelValue: string;
  language?: string;
  height?: string;
  readOnly?: boolean;
  hideToolbar?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
  'language-change': [language: string];
}>();

const editorContainer = ref<HTMLElement | null>(null);
const editor = ref<monaco.editor.IStandaloneCodeEditor | null>(null);
const settingsStore = useSettings();
const themeStore = useThemeStore();

// 创建编辑器
onMounted(() => {
  if (editorContainer.value && window.monaco) {
    const options = createEditorOptions(
      settingsStore.settings.general,
      themeStore.currentTheme.isDark
    );

    editor.value = window.monaco.editor.create(editorContainer.value, {
      ...options,
      value: props.modelValue,
      language: props.language,
      readOnly: props.readOnly,
    });

    // 设置快捷键
    setupEditorKeybindings(editor.value);

    // 监听内容变化
    editor.value.onDidChangeModelContent(() => {
      const value = editor.value?.getValue() || '';
      emit('update:modelValue', value);
      emit('change', value);
    });
  }
});

// 监听值变化
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getValue()) {
    editor.value.setValue(newValue);
  }
});

// 监听语言变化
watch(() => props.language, (newLanguage) => {
  if (editor.value && window.monaco && newLanguage) {
    const model = editor.value.getModel();
    if (model) {
      window.monaco.editor.setModelLanguage(model, newLanguage);
    }
  }
});

// 监听只读状态变化
watch(() => props.readOnly, (readOnly) => {
  if (editor.value) {
    editor.value.updateOptions({ readOnly });
  }
});

// 格式化代码
const format = () => {
  if (editor.value) {
    editor.value.getAction('editor.action.formatDocument')?.run();
  }
};

// 复制代码
const handleCopy = () => {
  if (editor.value) {
    const value = editor.value.getValue();
    navigator.clipboard.writeText(value)
      .then(() => ElMessage.success('Copied to clipboard'))
      .catch(() => ElMessage.error('Failed to copy'));
  }
};

// 切换语言
const handleLanguageChange = (newLanguage: string) => {
  if (editor.value && window.monaco) {
    const model = editor.value.getModel();
    if (model) {
      window.monaco.editor.setModelLanguage(model, newLanguage);
      emit('language-change', newLanguage);
    }
  }
};

// 清理
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.dispose();
  }
});

// 暴露方法
defineExpose({
  editor,
  format,
  copy: handleCopy,
});
</script>

<style scoped>
.editor-wrapper {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.editor-container {
  width: 100%;
  min-height: 100px;
  border-radius: 4px;
  overflow: hidden;
}

.editor-container.with-toolbar {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style> 