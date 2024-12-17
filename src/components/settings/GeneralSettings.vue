<template>
  <div class="general-settings">
    <h3>{{ t('settings.general.title') }}</h3>

    <el-form label-width="180px">
      <el-form-item :label="t('settings.general.defaultRequestType')">
        <el-select v-model="settings.defaultRequestType">
          <el-option label="gRPC" value="rpc" />
          <el-option label="HTTP" value="http" />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('settings.general.autoSave')">
        <el-switch v-model="settings.autoSave" active-text="Enable auto save" />
      </el-form-item>

      <el-form-item :label="t('settings.general.autoSaveInterval')" v-if="settings.autoSave">
        <el-input-number
          v-model="settings.autoSaveInterval"
          :min="1"
          :max="60"
          :step="1"
        />
        <span class="unit-text">{{ t('settings.general.minutes') }}</span>
      </el-form-item>

      <el-form-item :label="t('settings.general.requestHistory')">
        <el-input-number
          v-model="settings.maxHistoryItems"
          :min="10"
          :max="1000"
          :step="10"
        />
        <span class="unit-text">{{ t('settings.general.items') }}</span>
      </el-form-item>

      <el-form-item :label="t('settings.general.responseSizeLimit')">
        <el-input-number
          v-model="settings.responseSizeLimit"
          :min="1"
          :max="100"
          :step="1"
        />
        <span class="unit-text">{{ t('settings.general.mb') }}</span>
      </el-form-item>

      <el-form-item :label="t('settings.general.fontSize')">
        <el-select v-model="settings.fontSize">
          <el-option 
            :label="t('settings.general.sizes.small')" 
            value="12" 
          />
          <el-option 
            :label="t('settings.general.sizes.medium')" 
            value="14" 
          />
          <el-option 
            :label="t('settings.general.sizes.large')" 
            value="16" 
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('settings.general.fontFamily')">
        <el-select v-model="settings.fontFamily">
          <el-option 
            :label="t('settings.general.fonts.systemDefault')" 
            value="system-ui" 
          />
          <el-option 
            :label="t('settings.general.fonts.monaco')" 
            value="Monaco" 
          />
          <el-option 
            :label="t('settings.general.fonts.consolas')" 
            value="Consolas" 
          />
          <el-option 
            :label="t('settings.general.fonts.menlo')" 
            value="Menlo" 
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('settings.general.tabSize')">
        <el-input-number
          v-model="settings.tabSize"
          :min="2"
          :max="8"
          :step="2"
        />
      </el-form-item>

      <el-form-item :label="t('settings.general.wordWrap')">
        <el-switch v-model="settings.wordWrap" />
      </el-form-item>

      <el-form-item :label="t('settings.general.showLineNumbers')">
        <el-switch v-model="settings.showLineNumbers" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="saveSettings">
          {{ t('settings.general.saveSettings') }}
        </el-button>
        <el-button @click="resetSettings">
          {{ t('settings.general.resetSettings') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useSettings } from "../../stores/settings";
import { useI18n } from "vue-i18n";

const settingsStore = useSettings();
const { t } = useI18n();

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
  ElMessage.success(t('settings.general.saveSuccess'));
}

// 重置设置
async function resetSettings() {
  try {
    await ElMessageBox.confirm(
      t('settings.general.resetConfirm'),
      t('settings.general.resetSettings')
    );
    settingsStore.resetSettings("general");
    settings.value = { ...settingsStore.settings.general };
    ElMessage.success(t('settings.general.resetSuccess'));
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
