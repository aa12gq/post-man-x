<template>
  <div class="settings-panel">
    <el-tabs>
      <!-- 布局设置 -->
      <el-tab-pane :label="t('settings.layout.title')">
        <div class="settings-section">
          <div class="section-header">
            <h3>{{ t("settings.layout.title") }}</h3>
            <el-button type="primary" @click="showLayoutSettings = true">
              {{ t("settings.layout.customize") }}
            </el-button>
          </div>

          <div class="current-layout">
            <div class="layout-info">
              <span class="label"
                >{{ t("settings.layout.currentLayout") }}:</span
              >
              <span class="value">{{ getCurrentLayoutName() }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 主题设置 -->
      <el-tab-pane :label="t('settings.theme.title')">
        <ThemeSettings />
      </el-tab-pane>

      <!-- 常规设置 -->
      <el-tab-pane :label="t('settings.general.title')">
        <GeneralSettings />
      </el-tab-pane>

      <!-- 快捷键设置 -->
      <el-tab-pane :label="t('settings.shortcuts.title')">
        <ShortcutsSettings />
      </el-tab-pane>

      <!-- 关于 -->
      <el-tab-pane :label="t('settings.about.title')">
        <div class="settings-section">
          <h3>{{ t("settings.about.title") }} RPC Master</h3>
          <div class="about-content">
            <p class="version">{{ t("settings.about.version") }}: 1.0.0</p>
            <p class="description">{{ t("settings.about.description") }}</p>
            <div class="links">
              <a href="https://github.com/vtyug/rpc-master" target="_blank">
                <el-button>
                  <el-icon><Link /></el-icon>
                  GitHub
                </el-button>
              </a>
              <el-button @click="checkForUpdates">
                <el-icon><Refresh /></el-icon>
                {{ t("settings.about.checkUpdates") }}
              </el-button>
            </div>
            <div class="credits">
              <h4>{{ t("settings.about.techStack") }}</h4>
              <p>{{ t("settings.about.techStackDesc") }}</p>
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
import { ref } from "vue";
import { Link, Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useLayoutStore } from "../../stores/layout";
import LayoutSettings from "./LayoutSettings.vue";
import ThemeSettings from "./ThemeSettings.vue";
import GeneralSettings from "./GeneralSettings.vue";
import ShortcutsSettings from "./ShortcutsSettings.vue";
import { layoutPresets } from "../../constants/layoutPresets";
import { useI18n } from "vue-i18n";

const layoutStore = useLayoutStore();
const showLayoutSettings = ref(false);
const { t } = useI18n();

const getCurrentLayoutName = () => {
  const currentLayout = layoutStore.settings.currentLayout;
  const preset = layoutPresets.find((p) => p.id === currentLayout);
  return preset
    ? t(`settings.layout.presets.names.${preset.id}`)
    : t('settings.layout.presets.names.custom');
};

const handleLayoutSettingsClose = () => {
  showLayoutSettings.value = false;
};

const checkForUpdates = () => {
  // TODO: 实现检查更新功能
  ElMessage.info(t("settings.about.checkUpdates"));
};
</script>

<style scoped>
.settings-panel {
  padding: 20px;
  overflow-y: auto;
  background-color: transparent;
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
