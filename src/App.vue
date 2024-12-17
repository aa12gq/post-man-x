<template>
  <div
    class="app-container"
    :class="{
      [`layout-${layoutStore.settings.currentLayout}`]: true,
      'sidebar-collapsed': layoutStore.settings.isCollapsed,
      [`toolbar-${layoutStore.settings.toolbarPosition}`]: true,
      [`tabs-${layoutStore.settings.tabsPosition}`]: true,
    }"
  >
    <MainLayout />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import MainLayout from "./layouts/MainLayout.vue";
import { useThemeStore } from "./stores/theme";
import { useSettings } from "./stores/settings";
import type { Settings } from "./stores/settings";
import { useLayoutStore } from "./stores/layout";

const themeStore = useThemeStore();
const settingsStore = useSettings();
const layoutStore = useLayoutStore();

// 在 setup 中直接初始化，而不是在 onMounted 中
themeStore.initializeTheme();

// 在组件挂载后初始化
onMounted(async () => {
  // 监听设置变更事件
  window.addEventListener("settings-changed", ((
    event: CustomEvent<Settings>
  ) => {
    const settings = event.detail;
    applyGlobalSettings(settings);
  }) as EventListener);

  // 初始应用设置
  applyGlobalSettings(settingsStore.settings);
});

// 应用全局设置
function applyGlobalSettings(settings: Settings) {
  // 应用字体设置
  document.documentElement.style.setProperty(
    "--editor-font-size",
    `${settings.general.fontSize}px`
  );
  document.documentElement.style.setProperty(
    "--editor-font-family",
    settings.general.fontFamily
  );

  // 应用编辑器设置
  document.documentElement.style.setProperty(
    "--editor-tab-size",
    `${settings.general.tabSize}`
  );

  // 应用其他全局设置
  if (settings.general.wordWrap) {
    document.documentElement.style.setProperty(
      "--editor-word-wrap",
      "break-word"
    );
  } else {
    document.documentElement.style.setProperty("--editor-word-wrap", "normal");
  }
}
</script>

<style>
html {
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--background);
  color: var(--text-color);
}

:root {
  /* 基础颜色 */
  --primary-color: var(--el-color-primary);
  --primary-light: var(--el-color-primary-light-3);
  --primary-dark: var(--el-color-primary-dark-2);

  /* 背景颜色 */
  --bg-color: #ffffff;
  --bg-color-light: #f5f7fa;
  --bg-color-dark: #e4e7ed;
  --header-bg: #f5f7fa;

  /* 文本颜色 */
  --text-color: #333333;
  --text-color-secondary: #909399;
  --text-color-disabled: #c0c4cc;

  /* 边框和分割线 */
  --border-color: #dcdfe6;
  --border-color-light: #e4e7ed;
  --border-color-dark: #d4d7de;

  /* 状态颜色 */
  --success-color: var(--el-color-success);
  --warning-color: var(--el-color-warning);
  --danger-color: var(--el-color-danger);
  --info-color: var(--el-color-info);

  /* 交互状态 */
  --hover-color: #f5f7fa;
  --active-color: #e6f2ff;
  --selected-color: #f0f7ff;

  /* 阴影 */
  --shadow-color: rgba(0, 0, 0, 0.1);
  --shadow-base: 0 2px 4px var(--shadow-color);
  --shadow-light: 0 1px 2px var(--shadow-color);
  --shadow-dark: 0 4px 8px var(--shadow-color);

  /* 编辑器相关 */
  --editor-bg: #ffffff;
  --editor-line-number: #999999;
  --editor-selection: #e6f2ff;
  --editor-cursor: var(--primary-color);
  --editor-gutter-bg: #f5f7fa;
  --editor-font-size: 14px;
  --editor-font-family: system-ui;
  --editor-tab-size: 2;
  --editor-word-wrap: normal;
  --editor-line-height: 1.5;

  /* 布局相关的 CSS 变量 */
  --sidebar-width: 240px;
  --header-height: 48px;
  --toolbar-height: 40px;
  --tabs-height: 36px;
}

:root[data-theme="dark"] {
  /* 基础颜色保持不变，使用 Element Plus 的暗色主题变量 */

  /* 背景颜色 */
  --bg-color: #1e1e1e;
  --bg-color-light: #252525;
  --bg-color-dark: #141414;
  --header-bg: #252525;

  /* 文本颜色 */
  --text-color: #e0e0e0;
  --text-color-secondary: #909399;
  --text-color-disabled: #666666;

  /* 边框和分割线 */
  --border-color: #333333;
  --border-color-light: #404040;
  --border-color-dark: #1f1f1f;

  /* 交互状态 */
  --hover-color: #2c2c2c;
  --active-color: #213d5b;
  --selected-color: #1a3045;

  /* 阴影 */
  --shadow-color: rgba(0, 0, 0, 0.3);

  /* 编辑器相关 */
  --editor-bg: #1e1e1e;
  --editor-line-number: #666666;
  --editor-selection: #264f78;
  --editor-cursor: var(--primary-color);
  --editor-gutter-bg: #252525;
}

/* 应用编辑器设置 */
.editor-container {
  font-size: var(--editor-font-size);
  font-family: var(--editor-font-family);
  tab-size: var(--editor-tab-size);
  word-wrap: var(--editor-word-wrap);
  line-height: var(--editor-line-height);
}

/* 局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: var(--background);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(144, 147, 153, 0.5);
}

/* 确保所有元素的盒模型一致 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 布局样式 */
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
