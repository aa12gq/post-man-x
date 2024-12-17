<template>
  <div class="theme-settings">
    <h2>{{ t('settings.theme.title') }}</h2>

    <!-- 主题类型选择标签页 -->
    <el-tabs v-model="activeTab">
      <el-tab-pane :label="t('settings.theme.officialThemes')" name="official">
        <div class="theme-list">
          <div
            v-for="theme in themeStore.officialCustomThemes"
            :key="theme.id"
            class="theme-item"
            :class="{
              active: themeStore.currentTheme.id === theme.id,
              'theme-item-official': true,
            }"
          >
            <div class="theme-preview" @click="applyCustomTheme(theme)">
              <ThemePreviewCard :theme="theme" />
              <div class="theme-info">
                <span class="theme-name">{{ theme.name }}</span>
                <span class="theme-type">{{
                  theme.isDark ? t('settings.theme.dark') : t('settings.theme.light')
                }}</span>
              </div>
            </div>
            <div class="theme-actions">
              <el-button type="primary" link @click="handleExport(theme)">
                <el-icon><Download /></el-icon>
                {{ t('settings.theme.exportTheme') }}
              </el-button>
              <el-button type="primary" link @click="handleDuplicate(theme)">
                <el-icon><CopyDocument /></el-icon>
                {{ t('settings.theme.duplicateTheme') }}
              </el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="t('settings.theme.customThemes')" name="custom">
        <div class="themes-header">
          <el-button type="primary" @click="showThemeEditor = true">
            {{ t('settings.theme.createTheme') }}
          </el-button>
        </div>
        <div class="theme-list">
          <div
            v-for="theme in themeStore.customThemes"
            :key="theme.id"
            class="theme-item"
            :class="{ active: themeStore.currentTheme.id === theme.id }"
          >
            <div class="theme-preview" @click="applyCustomTheme(theme)">
              <ThemePreviewCard :theme="theme" />
              <div class="theme-info">
                <span class="theme-name">{{ theme.name }}</span>
                <span class="theme-type">{{
                  theme.isDark ? t('settings.theme.dark') : t('settings.theme.light')
                }}</span>
              </div>
            </div>
            <div class="theme-actions">
              <el-button type="primary" link @click="editTheme(theme)">
                <el-icon><Edit /></el-icon>
                {{ t('settings.theme.editTheme') }}
              </el-button>
              <el-button type="primary" link @click="handleExport(theme)">
                <el-icon><Download /></el-icon>
                {{ t('settings.theme.exportTheme') }}
              </el-button>
              <el-button type="danger" link @click="handleDelete(theme)">
                <el-icon><Delete /></el-icon>
                {{ t('settings.theme.deleteTheme') }}
              </el-button>
            </div>
          </div>
        </div>
        <div class="import-theme">
          <el-upload
            class="upload-demo"
            accept=".json"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImport"
          >
            <el-button>{{ t('settings.theme.importTheme') }}</el-button>
          </el-upload>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 主题编辑器对话框 -->
    <el-dialog
      v-model="showThemeEditor"
      :title="editingTheme ? t('settings.theme.editTheme') : t('settings.theme.createTheme')"
      width="800px"
    >
      <ThemeEditor
        :initial-theme="editingTheme"
        @save="handleSaveTheme"
        @cancel="closeEditor"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useThemeStore } from "../../stores/theme";
import { ElMessageBox, ElMessage } from "element-plus";
import { Edit, Download, Delete, CopyDocument } from "@element-plus/icons-vue";
import type { Theme } from "../../types/theme";
import ThemeEditor from "./ThemeEditor.vue";
import type { UploadFile } from "element-plus";
import ThemePreviewCard from "../common/ThemePreviewCard.vue";
import { useI18n } from "vue-i18n";

const themeStore = useThemeStore();
const { t } = useI18n();
const showThemeEditor = ref(false);
const editingTheme = ref<Theme | null>(null);
const activeTab = computed(() => {
  const currentTheme = themeStore.currentTheme;
  if (themeStore.officialCustomThemes.some(theme => theme.id === currentTheme.id)) {
    return "official";
  }
  if (themeStore.customThemes.some(theme => theme.id === currentTheme.id)) {
    return "custom";
  }
  return "official";
});

// 应用自定义主题
const applyCustomTheme = (theme: Theme) => {
  // 先设置 preset，再切换主题
  themeStore.switchTheme("custom", theme.id);
};

const handleExport = (theme: Theme) => {
  try {
    themeStore.exportTheme(theme);
    ElMessage.success(t('settings.theme.exportSuccess'));
  } catch (error) {
    ElMessage.error(t('settings.theme.exportError'));
  }
};

const handleDelete = async (theme: Theme) => {
  try {
    await ElMessageBox.confirm(
      t('settings.theme.deleteConfirm'),
      t('settings.theme.deleteTheme')
    );
    themeStore.removeCustomTheme(theme.id);
    ElMessage.success(t('settings.theme.deleteSuccess'));

    // 如果删除后没有自定义主题了，自动切换到 light 主题
    if (
      themeStore.customThemes.length === 0 &&
      themeStore.themePreset === "custom"
    ) {
      themeStore.switchTheme("light");
    }
  } catch {}
};

const handleImport = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) {
    ElMessage.error(t('settings.theme.selectFile'));
    return;
  }

  try {
    const themeData = await themeStore.importTheme(uploadFile.raw);
    const newTheme = themeStore.addCustomTheme(themeData);
    themeStore.switchTheme("custom", newTheme.id);
    ElMessage.success(t('settings.theme.importSuccess'));
  } catch (error) {
    ElMessage.error(t('settings.theme.importError'));
  }
};

const handleSaveTheme = (theme: Omit<Theme, "id">) => {
  if (editingTheme.value) {
    themeStore.updateCustomTheme({
      ...theme,
      id: editingTheme.value.id,
    });
    ElMessage.success(t('settings.theme.updateSuccess'));
  } else {
    themeStore.addCustomTheme(theme);
    ElMessage.success(t('settings.theme.createSuccess'));
  }
  closeEditor();
};

const editTheme = (theme: Theme) => {
  editingTheme.value = { ...theme };
  showThemeEditor.value = true;
};

const closeEditor = () => {
  showThemeEditor.value = false;
  editingTheme.value = null;
};

// 复制主题
const handleDuplicate = (theme: Theme) => {
  const { id, ...themeWithoutId } = theme;
  const newTheme = {
    ...themeWithoutId,
    name: `${theme.name} ${t('settings.theme.copy')}`,
  };
  const addedTheme = themeStore.addCustomTheme(newTheme);
  themeStore.switchTheme("custom", addedTheme.id);
  ElMessage.success(t('settings.theme.duplicateSuccess'));
};
</script>

<style scoped>
.theme-settings {
  padding: 20px;
}

.theme-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.theme-item {
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--bg-color);
}

.theme-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px 0 var(--shadow-color);
}

.theme-item.active {
  border-color: var(--el-color-primary);
  border-width: 2px;
}

.theme-preview {
  cursor: pointer;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.theme-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 4px;
  text-align: center;
  align-items: center;
  width: 100%;
}

.theme-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.theme-type {
  font-size: 12px;
  color: var(--text-secondary);
}

.theme-type::before {
  content: "";
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
}

.theme-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.theme-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

.theme-actions .el-button .el-icon {
  margin-right: 4px;
  font-size: 12px;
}

.theme-item-official::before {
  content: "OFFICIAL";
  position: absolute;
  top: 0;
  right: 16px;
  font-size: 10px;
  padding: 3px 12px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  background: linear-gradient(
    90deg,
    var(--el-color-primary-light-8) 0%,
    var(--el-color-primary-light-7) 100%
  );
  color: var(--el-color-primary-dark-2);
  font-weight: 600;
  letter-spacing: 0.5px;
  z-index: 1;
  border: 1px solid var(--el-color-primary-light-5);
  border-top: none;
  box-shadow: 0 2px 4px rgba(var(--el-color-primary-rgb), 0.1);
  text-align: center;
  min-width: 60px;
}

.theme-item-official::after {
  display: none;
}

.import-theme {
  margin-top: 20px;
}

.themes-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}

/* 调整标签页样式 */
:deep(.el-tabs__header) {
  margin-bottom: 24px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--border-color);
}

:deep(.el-tabs__item) {
  font-size: 15px;
  height: 40px;
  line-height: 40px;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

/* 调整主题列表布局 */
.theme-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.themes-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}

.theme-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.tag-github-light {
  background-color: #f6f8fa;
  color: #0969da;
  border: 1px solid #0969da;
}

.tag-github-dark {
  background-color: #161b22;
  color: #58a6ff;
  border: 1px solid #58a6ff;
}

.tag-one-dark {
  background-color: #282c34;
  color: #61afef;
  border: 1px solid #61afef;
}

.tag-solarized {
  background-color: #eee8d5;
  color: #268bd2;
  border: 1px solid #268bd2;
}

.tag-light {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary);
}

.tag-dark {
  background-color: var(--el-color-primary-dark-2);
  color: white;
  border: 1px solid transparent;
}

:deep(.theme-preview-card) {
  width: 100%;
  max-width: 160px;
  margin: 0 auto;
}
</style>
