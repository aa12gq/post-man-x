<template>
  <div class="general-settings">
    <h3>General Settings</h3>

    <el-form label-width="180px">
      <el-form-item label="Default Request Type">
        <el-select v-model="settings.defaultRequestType">
          <el-option label="gRPC" value="rpc" />
          <el-option label="HTTP" value="http" />
        </el-select>
      </el-form-item>

      <el-form-item label="Auto Save">
        <el-switch v-model="settings.autoSave" active-text="Enable auto save" />
      </el-form-item>

      <el-form-item label="Auto Save Interval" v-if="settings.autoSave">
        <el-input-number
          v-model="settings.autoSaveInterval"
          :min="1"
          :max="60"
          :step="1"
        />
        <span class="unit-text">minutes</span>
      </el-form-item>

      <el-form-item label="Request History">
        <el-input-number
          v-model="settings.maxHistoryItems"
          :min="10"
          :max="1000"
          :step="10"
        />
        <span class="unit-text">items</span>
      </el-form-item>

      <el-form-item label="Response Size Limit">
        <el-input-number
          v-model="settings.responseSizeLimit"
          :min="1"
          :max="100"
          :step="1"
        />
        <span class="unit-text">MB</span>
      </el-form-item>

      <el-form-item label="Font Size">
        <el-select v-model="settings.fontSize">
          <el-option label="Small" value="12" />
          <el-option label="Medium" value="14" />
          <el-option label="Large" value="16" />
        </el-select>
      </el-form-item>

      <el-form-item label="Font Family">
        <el-select v-model="settings.fontFamily">
          <el-option label="System Default" value="system-ui" />
          <el-option label="Monaco" value="Monaco" />
          <el-option label="Consolas" value="Consolas" />
          <el-option label="Menlo" value="Menlo" />
        </el-select>
      </el-form-item>

      <el-form-item label="Tab Size">
        <el-input-number
          v-model="settings.tabSize"
          :min="2"
          :max="8"
          :step="2"
        />
        <span class="unit-text">spaces</span>
      </el-form-item>

      <el-form-item label="Word Wrap">
        <el-switch v-model="settings.wordWrap" active-text="Enable word wrap" />
      </el-form-item>

      <el-form-item label="Show Line Numbers">
        <el-switch
          v-model="settings.showLineNumbers"
          active-text="Show line numbers"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSettings"
          >Save Settings</el-button
        >
        <el-button @click="resetSettings">Reset to Default</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useSettings } from "../../stores/settings";

const settingsStore = useSettings();

// 使用 store 中的设置
const settings = ref({
  defaultRequestType: settingsStore.settings.general.defaultRequestType,
  autoSave: settingsStore.settings.general.autoSave,
  autoSaveInterval: settingsStore.settings.general.autoSaveInterval,
  maxHistoryItems: settingsStore.settings.general.maxHistoryItems,
  responseSizeLimit: settingsStore.settings.general.responseSizeLimit,
  fontSize: settingsStore.settings.general.fontSize,
  fontFamily: settingsStore.settings.general.fontFamily,
  tabSize: settingsStore.settings.general.tabSize,
  wordWrap: settingsStore.settings.general.wordWrap,
  showLineNumbers: settingsStore.settings.general.showLineNumbers,
});

// 保存设置
function saveSettings() {
  settingsStore.updateSettings("general", settings.value);
  ElMessage.success("Settings saved successfully");
}

// 重置设置
async function resetSettings() {
  try {
    await ElMessageBox.confirm(
      "Are you sure you want to reset all settings to default?",
      "Reset Settings"
    );
    settingsStore.resetSettings("general");
    // 更新本地设置
    settings.value = { ...settingsStore.settings.general };
    ElMessage.success("Settings reset successfully");
  } catch {}
}

// 监听设置变化并应用
onMounted(() => {
  // 应用字体设置
  document.documentElement.style.setProperty(
    "--editor-font-size",
    `${settings.value.fontSize}px`
  );
  document.documentElement.style.setProperty(
    "--editor-font-family",
    settings.value.fontFamily
  );
});
</script>

<style scoped>
.general-settings {
  padding: 20px;
}

.unit-text {
  margin-left: 8px;
  color: var(--text-secondary);
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input-number) {
  width: 120px;
}

:deep(.el-select) {
  width: 200px;
}
</style>
