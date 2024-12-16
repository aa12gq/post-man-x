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

      <!-- 主题切换按钮 -->
      <button class="toolbar-btn" @click="showThemeDrawer = true">
        <div class="theme-indicator">
          <div 
            class="color-block" 
            :style="{ backgroundColor: themeStore.currentTheme.colors.primary }"
          ></div>
          <span class="theme-name">{{ currentThemeDisplay }}</span>
        </div>
      </button>

      <SettingsDropdown ref="settingsDropdownRef" />
      <UserAvatar />
    </div>
  </div>

  <!-- 主题选择抽屉 -->
  <el-drawer
    v-model="showThemeDrawer"
    title="选择主题"
    size="400px"
    :with-header="true"
  >
    <div class="theme-drawer-content">
      <div class="theme-section">
        <h3 class="section-title">官方主题</h3>
        <div class="theme-list">
          <div
            v-for="theme in themeStore.officialCustomThemes"
            :key="theme.id"
            class="theme-item"
            :class="{ active: themeStore.currentTheme.id === theme.id }"
            @click="applyTheme(['custom', theme.id])"
          >
            <ThemePreviewCard :theme="theme" />
            <div class="theme-info">
              <span class="theme-name">{{ theme.name }}</span>
              <span class="theme-type">{{ getThemeStyle(theme) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="theme-section">
        <div class="section-header">
          <h3 class="section-title">自定义主题</h3>
          <el-button type="primary" link @click="showThemeEditor = true">
            <el-icon><Plus /></el-icon>
            创建新主题
          </el-button>
        </div>
        <div class="theme-list">
          <div
            v-for="theme in themeStore.customThemes"
            :key="theme.id"
            class="theme-item"
            :class="{ active: themeStore.currentTheme.id === theme.id }"
            @click="applyTheme(['custom', theme.id])"
          >
            <ThemePreviewCard :theme="theme" />
            <div class="theme-info">
              <span class="theme-name">{{ theme.name }}</span>
              <span class="theme-type">{{ getThemeStyle(theme) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-drawer>

  <!-- 主题编辑器对话框 -->
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
const showThemeDrawer = ref(false);

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
const applyTheme = (command: [string, string]) => {
  if (Array.isArray(command)) {
    const [type, id] = command;
    if (type === "custom") {
      themeStore.switchTheme("custom", id);
    }
  } else if (command === "customize") {
    showThemeEditor.value = true;
  }
};

// 处理保存新主题
const handleSaveTheme = (theme: Omit<Theme, "id">) => {
  const newTheme = themeStore.addCustomTheme(theme);
  themeStore.switchTheme("custom", newTheme.id);
  showThemeEditor.value = false;
};

// 当前主题显示计算属性
const currentThemeDisplay = computed(() => {
  const theme = themeStore.currentTheme;
  return theme.name;
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

// 获取主题风格描述
const getThemeStyle = (theme: Theme) => {
  const styleMap: Record<string, string> = {
    // 官方主题
    'light': '素雅清风',
    'dark': '暗夜星河',
    'github_light': '晴空雅境',
    'github_dark': '墨韵沉香',
    'one_dark': '玄黛之美',
    'catppuccin_latte': '奶茶物语',
    'rose_pine_dawn': '曦光微醺',
    'everforest_light': '青松翠竹',
    'rainbow': '绚烂霓虹',
    'high_contrast': '黑白交响',
    'eye_care': '青玉护目',
  };

  // 自定义主题名称池
  const customThemeNames = [
    '流云幻境', '碧海潮声', '紫气东来', '春日暖阳',
    '秋水伊人', '月华流转', '山岚雾霭', '江南烟雨',
    '琉璃光影', '竹影清风', '梅雪飘香', '夏夜星辰'
  ];
  
  // 如果是自定义主题，从名称池中选择一个（基于主题ID的哈希）
  if (theme.id.startsWith('custom_')) {
    const index = Math.abs(hashCode(theme.id)) % customThemeNames.length;
    return customThemeNames[index];
  }
  
  // 返回映射中的名称，如果没有找到则返回主题原名
  return styleMap[theme.id] || theme.name;
};

// 简单的字符串哈希函数
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
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
  background-color: var(--background);
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
  padding: 4px 12px !important;
}

.custom-theme-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
  padding: 2px 0;
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
  gap: 1px;
  min-width: 0;
}

.theme-name {
  font-size: 12px;
  line-height: 1.2;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.theme-type {
  font-size: 11px;
  line-height: 1.2;
  color: var(--text-secondary);
}

.theme-tag {
  font-size: 10px;
  padding: 1px 6px;
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

/* 调整主题项样式 */
.theme-item {
  height: auto !important;
  padding: 4px 12px !important;
}

.custom-theme-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
  padding: 2px 0;
}

/* 调整预览卡片大小 */
:deep(.theme-preview-card) {
  transform: scale(0.7);
  transform-origin: left center;
  margin: -8px 0;
}

.theme-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.theme-name {
  font-size: 12px;
  line-height: 1.2;
}

.theme-type {
  font-size: 11px;
  line-height: 1.2;
}

.theme-tag {
  font-size: 10px;
  padding: 1px 6px;
  line-height: 1.2;
}

/* 调整下拉菜单的最大高度 */
:deep(.el-dropdown-menu) {
  max-height: 360px;
  padding: 2px !important;
}

.theme-drawer-content {
  padding: 16px;
}

.theme-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 16px;
}

.theme-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.theme-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-item:hover {
  background: var(--hover-color);
}

.theme-item.active {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.theme-info {
  margin-top: 8px;
  text-align: center;
}

.theme-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
}

.theme-type {
  font-size: 12px;
  color: var(--text-secondary);
}
</style>
