<template>
  <div class="theme-settings">
    <h2>Theme Settings</h2>

    <!-- 主题预设选择 -->
    <div class="theme-presets">
      <el-radio-group v-model="currentPreset" @change="handlePresetChange">
        <el-radio-button label="light">Light</el-radio-button>
        <el-radio-button label="dark">Dark</el-radio-button>
        <el-radio-button label="custom">Custom</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 自定义主题列表 -->
    <div v-if="currentPreset === 'custom'" class="custom-themes">
      <div class="themes-header">
        <h3>Custom Themes</h3>
        <el-button type="primary" @click="showThemeEditor = true">
          Create Theme
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
            <div
              class="color-block"
              :style="{ backgroundColor: theme.colors.primary }"
            ></div>
            <div class="theme-info">
              <span class="theme-name">{{ theme.name }}</span>
              <span class="theme-type">{{
                theme.isDark ? "Dark" : "Light"
              }}</span>
            </div>
          </div>
          <div class="theme-actions">
            <el-button type="primary" link @click="editTheme(theme)">
              <el-icon><Edit /></el-icon>
              Edit
            </el-button>
            <el-button type="primary" link @click="handleExport(theme)">
              <el-icon><Download /></el-icon>
              Export
            </el-button>
            <el-button type="danger" link @click="handleDelete(theme)">
              <el-icon><Delete /></el-icon>
              Delete
            </el-button>
          </div>
        </div>
      </div>

      <!-- 导入主题按钮 -->
      <div class="import-theme">
        <el-upload
          class="upload-demo"
          accept=".json"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleImport"
        >
          <el-button>Import Theme</el-button>
        </el-upload>
      </div>
    </div>

    <!-- 主题编辑器对话框 -->
    <el-dialog
      v-model="showThemeEditor"
      :title="editingTheme ? 'Edit Theme' : 'Create Theme'"
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
import { Edit, Download, Delete } from "@element-plus/icons-vue";
import type { Theme, ThemePreset } from "../../types/theme";
import ThemeEditor from "./ThemeEditor.vue";
import type { UploadFile } from "element-plus";

const themeStore = useThemeStore();

// 使用计算属性来处理当前预设
const currentPreset = computed({
  get: () => themeStore.themePreset,
  set: (value) => themeStore.switchTheme(value),
});

const showThemeEditor = ref(false);
const editingTheme = ref<Theme | null>(null);

const handlePresetChange = (val: string | number | boolean | undefined) => {
  if (typeof val === "string") {
    themeStore.switchTheme(val as ThemePreset);
  }
};

const applyCustomTheme = (theme: Theme) => {
  themeStore.switchTheme("custom", theme.id);
};

const handleExport = (theme: Theme) => {
  themeStore.exportTheme(theme);
};

const handleDelete = async (theme: Theme) => {
  try {
    await ElMessageBox.confirm(
      "Are you sure you want to delete this theme?",
      "Delete Theme"
    );
    themeStore.removeCustomTheme(theme.id);
  } catch {}
};

const handleImport = async (uploadFile: UploadFile) => {
  try {
    const theme = await themeStore.importTheme(uploadFile.raw as File);
    themeStore.addCustomTheme(theme);
    ElMessage.success("Theme imported successfully");
  } catch (error) {
    ElMessage.error("Failed to import theme");
  }
};

const handleSaveTheme = (theme: Omit<Theme, "id">) => {
  if (editingTheme.value) {
    themeStore.updateCustomTheme({
      ...theme,
      id: editingTheme.value.id,
    });
    ElMessage.success("Theme updated successfully");
  } else {
    themeStore.addCustomTheme(theme);
    ElMessage.success("Theme created successfully");
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
</script>

<style scoped>
.theme-settings {
  padding: 20px;
}

.theme-presets {
  margin: 20px 0;
}

.custom-themes {
  margin-top: 20px;
}

.themes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.theme-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.theme-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.theme-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 var(--shadow-color);
}

.theme-item.active {
  border-color: var(--el-color-primary);
}

.theme-preview {
  cursor: pointer;
  padding: 16px;
}

.color-block {
  height: 40px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.theme-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-name {
  font-weight: 500;
}

.theme-type {
  font-size: 12px;
  color: var(--text-secondary);
}

.theme-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--border-color);
}

.theme-actions .el-button {
  padding: 4px 8px;
}

.theme-actions .el-icon {
  margin-right: 4px;
}

.import-theme {
  margin-top: 20px;
}
</style>
