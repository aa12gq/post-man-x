<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <span class="app-title">RPC Postman</span>
      <WorkspaceSelector />
      <ToolbarIcons />
    </div>
    <div class="toolbar-right">
      <SettingsDropdown />
      <ThemeSwitch />
      <UserAvatar />
    </div>
  </div>
</template>

<script setup lang="ts">
import WorkspaceSelector from './WorkspaceSelector.vue'
import ToolbarIcons from './ToolbarIcons.vue'
import SettingsDropdown from './SettingsDropdown.vue'
import ThemeSwitch from './ThemeSwitch.vue'
import UserAvatar from './UserAvatar.vue'
</script>

<style scoped>
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

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-title {
  margin-right: 8px;
}
</style> 