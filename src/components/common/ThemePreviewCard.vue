<template>
  <div class="theme-preview-card" :class="{ 'is-dark': theme.isDark }">
    <div class="preview-header" :style="{ backgroundColor: theme.colors.header }">
      <div class="preview-dots">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
    <div class="preview-content" :style="{ backgroundColor: theme.colors.background }">
      <div class="preview-sidebar" :style="{ backgroundColor: theme.colors['background-light'] }">
        <div class="sidebar-item" :style="{ backgroundColor: theme.colors.primary }"></div>
        <div class="sidebar-item"></div>
        <div class="sidebar-item"></div>
      </div>
      <div class="preview-main">
        <div class="preview-line"></div>
        <div class="preview-line"></div>
        <div class="preview-buttons">
          <div class="preview-button" :style="{ backgroundColor: theme.colors.primary }"></div>
          <div class="preview-button" :style="{ backgroundColor: theme.colors.success }"></div>
          <div class="preview-button" :style="{ backgroundColor: theme.colors.warning }"></div>
          <div class="preview-button" :style="{ backgroundColor: theme.colors.danger }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Theme } from '../../types/theme';

defineProps<{
  theme: Theme;
}>();
</script>

<style scoped>
.theme-preview-card {
  width: 200px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.theme-preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.preview-header {
  height: 24px;
  padding: 0 8px;
  display: flex;
  align-items: center;
}

.preview-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  opacity: 0.5;
}

.preview-content {
  height: calc(100% - 24px);
  display: flex;
}

.preview-sidebar {
  width: 40px;
  padding: 8px 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-item {
  height: 8px;
  border-radius: 2px;
  background-color: var(--text-secondary);
  opacity: 0.2;
}

.preview-main {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-line {
  height: 6px;
  border-radius: 3px;
  background-color: var(--text-secondary);
  opacity: 0.1;
}

.preview-buttons {
  display: flex;
  gap: 4px;
  margin-top: auto;
}

.preview-button {
  width: 20px;
  height: 8px;
  border-radius: 2px;
  opacity: 0.8;
}

.is-dark .preview-line {
  opacity: 0.2;
}

.is-dark .sidebar-item {
  opacity: 0.3;
}
</style> 