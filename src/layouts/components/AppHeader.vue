<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="logo-container" @click="goHome">
        <LogoIcon class="logo" />
        <span class="app-title">RPC Master</span>
      </div>
      <WorkspaceSelector />
      <ToolbarIcons />
    </div>
    <div class="toolbar-right">
      <button class="toolbar-btn" @click="handleImport">
        <ImportIcon class="btn-icon" />
        <span class="btn-text">导入</span>
      </button>
      <button class="toolbar-btn" @click="handleExport">
        <ExportIcon class="btn-icon" />
        <span class="btn-text">导出</span>
      </button>
      <div class="divider"></div>

      <!-- 主题相关功能整合 -->
      <el-dropdown trigger="click" @command="handleThemeCommand">
        <div class="theme-indicator">
          <div class="theme-preview">
            <div
              class="color-block"
              :style="{
                backgroundColor: themeStore.currentTheme.colors.primary,
              }"
            ></div>
            <span class="theme-name">{{ currentThemeDisplay }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="system">
              <el-icon><Monitor /></el-icon>
              跟随系统
            </el-dropdown-item>
            <el-dropdown-item command="light">
              <el-icon><Sunny /></el-icon>
              明亮模式
            </el-dropdown-item>
            <el-dropdown-item command="dark">
              <el-icon><Moon /></el-icon>
              暗黑模式
            </el-dropdown-item>

            <!-- 官方主题列表 -->
            <el-dropdown-item
              v-if="themeStore.officialCustomThemes.length"
              divided
              class="section-header"
            >
              <span class="dropdown-section-title">官方主题</span>
            </el-dropdown-item>
            <el-dropdown-item
              v-for="theme in themeStore.officialCustomThemes"
              :key="theme.id"
              :command="['custom', theme.id]"
              class="theme-item"
            >
              <div class="custom-theme-item">
                <ThemePreviewCard :theme="theme" />
                <div class="theme-info">
                  <span class="theme-name">{{ theme.name }}</span>
                  <span class="theme-type">{{
                    theme.isDark ? "暗色" : "亮色"
                  }}</span>
                  <span class="theme-tag" :class="getThemeTagClass(theme)">
                    Official
                  </span>
                </div>
              </div>
            </el-dropdown-item>

            <!-- 自定义主题列表 -->
            <el-dropdown-item v-if="themeStore.customThemes.length" divided>
              <span class="dropdown-section-title">自定义主题</span>
            </el-dropdown-item>
            <el-dropdown-item
              v-for="theme in themeStore.customThemes"
              :key="theme.id"
              :command="['custom', theme.id]"
            >
              <div class="custom-theme-item">
                <div
                  class="color-dot"
                  :style="{ backgroundColor: theme.colors.primary }"
                ></div>
                {{ theme.name }}
              </div>
            </el-dropdown-item>

            <!-- 创建新主题按钮 -->
            <el-dropdown-item divided command="customize">
              <el-icon><Plus /></el-icon>
              创建新主题
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <SettingsDropdown ref="settingsDropdownRef" />
      <UserAvatar />
    </div>
  </div>

  <!-- 添加主题编辑器对话框 -->
  <el-dialog v-model="showThemeEditor" title="Create New Theme" width="800px">
    <ThemeEditor
      :initial-theme="null"
      @save="handleSaveTheme"
      @cancel="showThemeEditor = false"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import LogoIcon from "../../components/icons/LogoIcon.vue";
import WorkspaceSelector from "./WorkspaceSelector.vue";
import ToolbarIcons from "./ToolbarIcons.vue";
import SettingsDropdown from "./SettingsDropdown.vue";
import UserAvatar from "./UserAvatar.vue";
import ImportIcon from "../../components/icons/ImportIcon.vue";
import ExportIcon from "../../components/icons/ExportIcon.vue";
import { useRouter, useRoute } from "vue-router";
import { ref, computed } from "vue";
import { ArrowDown, Sunny, Moon, Plus, Monitor } from "@element-plus/icons-vue";
import { useThemeStore } from "../../stores/theme";
import ThemeEditor from "../../components/settings/ThemeEditor.vue";
import { Theme } from "../../types/theme";
import type { ThemePreset } from "../../types/theme";
import ThemePreviewCard from "../../components/common/ThemePreviewCard.vue";

const router = useRouter();
const route = useRoute();
const themeStore = useThemeStore();
const settingsDropdownRef = ref();
const showThemeEditor = ref(false);

const goHome = () => {
  if (route.path !== "/") {
    router.push("/");
  }
};

const handleImport = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          console.log("导入的数据:", data);
          // TODO: 处理导入的数据
        } catch (err) {
          console.error("导入失败:", err);
          // TODO: 显示错误提示
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const handleExport = () => {
  // 模拟导出数据
  const mockData = {
    version: "1.0",
    exportTime: new Date().toISOString(),
    environments: [
      { id: "dev", name: "开发环境", baseUrl: "http://dev-api.example.com" },
      { id: "prod", name: "生产环境", baseUrl: "http://api.example.com" },
    ],
    collections: [
      {
        id: "1",
        name: "用户服务",
        methods: [
          { name: "getUserInfo", request: { id: 1 } },
          { name: "updateUser", request: { id: 1, name: "test" } },
        ],
      },
    ],
  };

  const blob = new Blob([JSON.stringify(mockData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rpc-master-export-${
    new Date().toISOString().split("T")[0]
  }.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 处理主题相关命令
const handleThemeCommand = (command: string | [ThemePreset, string]) => {
  if (Array.isArray(command)) {
    const [preset, themeId] = command;
    themeStore.switchTheme(preset, themeId);
  } else {
    switch (command) {
      case "light":
      case "dark":
        themeStore.switchTheme(command);
        break;
      case "customize":
        showThemeEditor.value = true;
        break;
    }
  }
};

// 处理保存新主题
const handleSaveTheme = (theme: Omit<Theme, "id">) => {
  const newTheme = themeStore.addCustomTheme(theme);
  themeStore.switchTheme("custom", newTheme.id);
  showThemeEditor.value = false;
};

// 添加当前主题显示计算属性
const currentThemeDisplay = computed(() => {
  const theme = themeStore.currentTheme;
  switch (themeStore.themePreset) {
    case "system":
      return "跟随系统";
    case "light":
      return "明亮模式";
    case "dark":
      return "暗黑模式";
    case "custom":
      const isOfficial = theme.id.startsWith("official_");
      return isOfficial ? `${theme.name} (Official)` : theme.name;
    default:
      return "默认";
  }
});

// 添加获取主题标签样式的函数
const getThemeTagClass = (theme: Theme) => {
  if (theme.name.includes("GitHub")) {
    return theme.isDark ? "tag-github-dark" : "tag-github-light";
  }
  if (theme.name.includes("One Dark")) {
    return "tag-one-dark";
  }
  if (theme.name.includes("Solarized")) {
    return "tag-solarized";
  }
  return theme.isDark ? "tag-dark" : "tag-light";
};
</script>

<style scoped>
.toolbar {
  height: 48px;
  min-height: 48px;
  padding: 0 8px;
  background-color: var(--toolbar-bg);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  position: relative;
  z-index: 100;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-shrink: 1;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.logo-container:hover {
  background-color: var(--hover-color);
}

.logo {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.app-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-color);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-color);
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background-color: var(--hover-color);
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--border-color);
  margin: 0 4px;
  flex-shrink: 0;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .app-title {
    display: none;
  }

  .toolbar {
    padding: 0 4px;
  }

  .toolbar-left,
  .toolbar-right {
    gap: 4px;
  }

  .btn-text {
    display: none;
  }

  .toolbar-btn {
    padding: 6px;
  }

  .theme-name {
    display: none;
  }
}

@media (max-width: 480px) {
  .divider {
    display: none;
  }
}

.theme-indicator {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  margin-right: 12px;
  background-color: var(--bg-color);
  box-shadow: var(--shadow-light);
}

.theme-indicator:hover {
  border-color: var(--primary-color);
  background-color: var(--hover-color);
  box-shadow: var(--shadow-base);
}

.theme-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-block {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.theme-name {
  font-size: 13px;
  color: var(--text-color);
}

.theme-preview .el-icon {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.theme-indicator:hover .el-icon {
  color: var(--primary-color);
}

.custom-theme-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* 确保下拉菜单有合适的最大高度和滚动 */
:deep(.el-dropdown-menu) {
  max-height: 400px;
  overflow-y: auto;
}

.dropdown-section-title {
  color: var(--text-secondary);
  font-size: 12px;
  padding: 0 12px;
}

.theme-tag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  background-color: var(--el-color-primary);
  color: white;
  margin-left: 8px;
}

/* 调整下拉菜单项的样式 */
:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  line-height: 1.4;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
}

.custom-theme-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
}

.color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.section-header {
  pointer-events: none;
  cursor: default;
}

.theme-item {
  height: auto !important;
  padding: 8px 16px !important;
}

.custom-theme-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  padding: 4px 0;
}

.theme-preview-colors {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.preview-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.theme-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.theme-name {
  font-weight: 500;
  font-size: 13px;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-type {
  font-size: 11px;
  color: var(--text-secondary);
}

.theme-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  background-color: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  flex-shrink: 0;
  font-weight: 500;
}

/* 修改下拉菜单样式 */
:deep(.el-dropdown-menu) {
  padding: 4px !important;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 12px !important;
  border-radius: 4px;
  margin: 2px 0;
}

:deep(.el-dropdown-menu__item:not(.el-dropdown-menu__item--divided):hover) {
  background-color: var(--el-color-primary-light-9);
}

.dropdown-section-title {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  padding: 0 4px;
}

/* 主题指示器样式优化 */
.theme-indicator {
  padding: 4px 8px;
  border-radius: 6px;
  background-color: var(--bg-color-light);
}

.theme-preview {
  gap: 10px;
}

.color-block {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

/* 添加主题标签样式 */
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

/* 当工具栏在底部时的样式 */
:deep(.toolbar-bottom) .toolbar {
  border-top: 1px solid var(--border-color);
  border-bottom: none;
  box-shadow: var(--shadow-light);
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .toolbar {
    padding: 0 4px;
  }
  
  /* 确保在底部时也保持正确的样式 */
  :deep(.toolbar-bottom) .toolbar {
    position: sticky;
    bottom: 0;
  }
}
</style>
