<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <el-button class="toolbar-btn">
      <el-icon><Setting /></el-icon>
      <span class="btn-text">Settings</span>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="theme">
          <el-icon><Brush /></el-icon>
          Theme
        </el-dropdown-item>
        <el-dropdown-item command="general">
          <el-icon><Setting /></el-icon>
          General
        </el-dropdown-item>
        <el-dropdown-item command="shortcuts">
          <el-icon><Operation /></el-icon>
          Shortcuts
        </el-dropdown-item>
        <el-dropdown-item command="about" divided>
          <el-icon><InfoFilled /></el-icon>
          About
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>

  <el-dialog
    v-model="showSettings"
    title="Settings"
    width="800px"
    :close-on-click-modal="false"
    class="settings-dialog"
  >
    <SettingsPanel :active-tab="activeTab" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Setting, Brush, Operation, InfoFilled } from '@element-plus/icons-vue';
import SettingsPanel from '../../components/settings/SettingsPanel.vue';

const showSettings = ref(false);
const activeTab = ref('theme');

const openSettings = (tab: string) => {
  activeTab.value = tab;
  showSettings.value = true;
};

const handleCommand = (command: string) => {
  activeTab.value = command;
  showSettings.value = true;
};

// 暴露方法给父组件
defineExpose({
  openSettings
});
</script>

<style scoped>
.settings-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}
</style> 