<template>
  <div class="app-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="app-title">RPC Postman</span>
      </div>
      <div class="toolbar-right">
        <el-switch
          v-model="isDarkMode"
          inline-prompt
          :active-icon="Moon"
          :inactive-icon="Sunny"
          @change="toggleTheme"
        />
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content-wrapper">
      <RequestPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'
import RequestPanel from './components/RequestPanel.vue'

const isDarkMode = ref(document.documentElement.getAttribute('data-theme') === 'dark')

const toggleTheme = (value: boolean) => {
  document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light')
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.toolbar {
  height: 48px;
  min-height: 48px;
  padding: 0 16px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 48px);
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

:deep(.main-layout) {
  height: 100%;
  position: relative;
}
</style>
