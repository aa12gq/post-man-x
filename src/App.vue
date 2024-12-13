<template>
  <MainLayout />
</template>

<script setup lang="ts">
import MainLayout from "./layouts/MainLayout.vue";
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
  background-color: var(--bg-color);
  color: var(--text-color);
}

:root {
  /* 亮色主题变量 */
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #dcdfe6;
  --hover-color: #f5f7fa;
  --header-bg: #f5f7fa;
  --code-bg: #f8f9fa;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

:root[data-theme="dark"] {
  /* 暗色主题变量 */
  --bg-color: #1e1e1e;
  --text-color: #e0e0e0;
  --border-color: #333333;
  --hover-color: #2c2c2c;
  --header-bg: #252525;
  --code-bg: #1e1e1e;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: var(--bg-color);
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
</style>
