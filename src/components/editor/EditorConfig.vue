<script setup lang="ts">
import { watch } from 'vue';
import { useSettings } from '../../stores/settings';
import { useThemeStore } from '../../stores/theme';
import { createEditorOptions, updateAllEditors } from '../../utils/editor';

const settingsStore = useSettings();
const themeStore = useThemeStore();

// 监听设置变化并应用到编辑器
watch([
  () => settingsStore.settings.general,
  () => themeStore.currentTheme.isDark
], ([settings, isDark]) => {
  if (window.monaco) {
    const options = createEditorOptions(settings, isDark);
    updateAllEditors(options);
  }
}, { deep: true });
</script>

<template>
  <!-- 这是一个无渲染组件 -->
</template> 