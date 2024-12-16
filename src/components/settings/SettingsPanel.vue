<template>
  <el-tabs v-model="currentTab">
    <el-tab-pane label="Theme" name="theme">
      <ThemeSettings />
    </el-tab-pane>
    <el-tab-pane label="General" name="general">
      <GeneralSettings />
    </el-tab-pane>
    <el-tab-pane label="Shortcuts" name="shortcuts">
      <ShortcutsSettings />
    </el-tab-pane>
    <el-tab-pane label="About" name="about">
      <div class="settings-section">
        <h3>About RPC Master</h3>
        <div class="about-content">
          <p class="version">Version: 1.0.0</p>
          <p class="description">
            A modern API testing tool for gRPC and HTTP requests.
          </p>
          <div class="links">
            <a href="https://github.com/vtyug/rpc-master" target="_blank">
              <el-button>
                <el-icon><Link /></el-icon>
                GitHub
              </el-button>
            </a>
            <el-button @click="checkForUpdates">
              <el-icon><Refresh /></el-icon>
              Check for Updates
            </el-button>
          </div>
          <div class="credits">
            <h4>Credits</h4>
            <p>Built with Vue 3, TypeScript, and Element Plus</p>
          </div>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Link, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ThemeSettings from './ThemeSettings.vue';
import GeneralSettings from './GeneralSettings.vue';
import ShortcutsSettings from './ShortcutsSettings.vue';

const props = defineProps<{
  activeTab?: string;
}>();

const currentTab = computed({
  get: () => props.activeTab || 'theme',
  set: () => {} // 由父组件控制
});

const checkForUpdates = () => {
  // TODO: 实现检查更新功能
  ElMessage.info('Checking for updates...');
};
</script>

<style scoped>
.settings-section {
  padding: 20px;
}

.about-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.version {
  font-size: 24px;
  margin-bottom: 16px;
  color: var(--el-color-primary);
}

.description {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.links {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 32px;
}

.credits {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.credits h4 {
  margin-bottom: 8px;
}
</style> 