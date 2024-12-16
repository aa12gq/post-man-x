<template>
  <div class="settings-panel">
    <el-tabs>
      <!-- 布局设置 -->
      <el-tab-pane label="布局设置">
        <div class="settings-section">
          <div class="section-header">
            <h3>布局设置</h3>
            <el-button type="primary" @click="showLayoutSettings = true">
              自定义布局
            </el-button>
          </div>
          
          <div class="current-layout">
            <div class="layout-info">
              <span class="label">当前布局:</span>
              <span class="value">{{ getCurrentLayoutName() }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 主题设置 -->
      <el-tab-pane label="主题设置">
        <ThemeSettings />
      </el-tab-pane>

      <!-- 常规设置 -->
      <el-tab-pane label="常规设置">
        <GeneralSettings />
      </el-tab-pane>

      <!-- 快捷键设置 -->
      <el-tab-pane label="快捷键">
        <ShortcutsSettings />
      </el-tab-pane>

      <!-- 关于 -->
      <el-tab-pane label="关于">
        <div class="settings-section">
          <h3>关于 RPC Master</h3>
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
                检查更新
              </el-button>
            </div>
            <div class="credits">
              <h4>技术栈</h4>
              <p>Built with Vue 3, TypeScript, and Element Plus</p>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 布局设置弹窗 -->
    <LayoutSettings
      v-model="showLayoutSettings"
      @close="handleLayoutSettingsClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Link, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useLayoutStore } from '../../stores/layout';
import LayoutSettings from './LayoutSettings.vue';
import ThemeSettings from './ThemeSettings.vue';
import GeneralSettings from './GeneralSettings.vue';
import ShortcutsSettings from './ShortcutsSettings.vue';
import { layoutPresets } from '../../constants/layoutPresets';

const layoutStore = useLayoutStore();
const showLayoutSettings = ref(false);

const getCurrentLayoutName = () => {
  const currentLayout = layoutStore.settings.currentLayout;
  const preset = layoutPresets.find(p => p.id === currentLayout);
  return preset?.name || '自定义布局';
};

const handleLayoutSettingsClose = () => {
  showLayoutSettings.value = false;
};

const checkForUpdates = () => {
  // TODO: 实现检查更新功能
  ElMessage.info('正在检查更新...');
};
</script>

<style scoped>
.settings-panel {
  padding: 20px;
}

.settings-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.current-layout {
  padding: 16px;
  background-color: var(--bg-color-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.layout-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.layout-info .label {
  color: var(--text-color-secondary);
  font-size: 14px;
}

.layout-info .value {
  font-weight: 500;
  color: var(--text-color);
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