<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="logo-container" @click="goHome">
        <LogoIcon class="logo" />
        <span class="app-title">RPC Master</span>
      </div>
      <WorkspaceSelector />
    </div>
    <div class="toolbar-right">
      <div class="divider"></div>
      <el-dropdown trigger="click" @command="handleLanguageChange">
        <button class="toolbar-btn action-btn">
          <div class="current-lang">
            <span class="lang-flag">{{
              locale === "zh-CN" ? "🇨🇳" : "🇺🇸"
            }}</span>
            <span class="btn-text">{{
              $t(`header.language.${locale === "zh-CN" ? "zh" : "en"}`)
            }}</span>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </div>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="lang-dropdown">
            <el-dropdown-item command="en-US">
              <span class="lang-item">
                <span class="lang-flag">🇺🇸</span>
                <span class="lang-label">
                  <span class="lang-name">{{ $t("header.language.en-US") }}</span>
                </span>
                <el-icon v-if="locale === 'en-US'" class="check-icon"
                  ><Check
                /></el-icon>
              </span>
            </el-dropdown-item>
            <el-dropdown-item command="zh-CN">
              <span class="lang-item">
                <span class="lang-flag">🇨🇳</span>
                <span class="lang-label">
                  <span class="lang-name">{{ $t("header.language.zh-CN") }}</span>
                </span>
                <el-icon v-if="locale === 'zh-CN'" class="check-icon"
                  ><Check
                /></el-icon>
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 主题切换按钮 -->
      <button class="toolbar-btn action-btn" @click="showThemeDrawer = true">
        <div class="current-lang">
          <div
            class="color-block"
            :style="{ backgroundColor: themeStore.currentTheme.colors.primary }"
          ></div>
          <span class="theme-name">{{ $t("header.theme.title") }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>
      </button>

      <!-- 设置按钮 -->
      <SettingsDropdown ref="settingsDropdownRef" />
      <UserAvatar />
    </div>
  </div>

  <!-- 主题选择抽屉 -->
  <el-drawer
    v-model="showThemeDrawer"
    :title="t('header.theme.title')"
    size="400px"
    :with-header="true"
  >
    <div class="theme-drawer-content">
      <div class="theme-section">
        <h3 class="section-title">{{ t('settings.theme.officialThemes') }}</h3>
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
              <span class="theme-type">{{ t(`settings.theme.${theme.isDark ? 'dark' : 'light'}`) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="theme-section">
        <div class="section-header">
          <h3 class="section-title">{{ t('settings.theme.customThemes') }}</h3>
          <el-button type="primary" link @click="showThemeEditor = true">
            <el-icon><Plus /></el-icon>
            {{ t('settings.theme.createTheme') }}
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
import SettingsDropdown from "./SettingsDropdown.vue";
import UserAvatar from "./UserAvatar.vue";
import { useRouter, useRoute } from "vue-router";
import { ref, nextTick } from "vue";
import { Plus, ArrowDown, Check } from "@element-plus/icons-vue";
import { useThemeStore } from "../../stores/theme";
import ThemeEditor from "../../components/settings/ThemeEditor.vue";
import { Theme } from "../../types/theme";
import ThemePreviewCard from "../../components/common/ThemePreviewCard.vue";
import WorkspaceSelector from "./WorkspaceSelector.vue";
import { useI18n } from "vue-i18n";
import { LanguageType, setLanguage } from "../../i18n";

const router = useRouter();
const route = useRoute();
const themeStore = useThemeStore();
const settingsDropdownRef = ref();
const showThemeEditor = ref(false);
const showThemeDrawer = ref(false);
const { locale, t } = useI18n();

const goHome = () => {
  if (route.path !== "/") {
    router.push("/");
  }
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

// 获取主题风格描述
const getThemeStyle = (theme: Theme) => {
  const styleMap: Record<string, string> = {
    // 官方主题
    light: "素雅清风",
    dark: "暗夜星河",
    github_light: "晴空雅境",
    github_dark: "墨韵沉香",
    one_dark: "玄黛之美",
    catppuccin_latte: "奶茶物语",
    rose_pine_dawn: "曦光微醺",
    everforest_light: "青松翠竹",
    rainbow: "绚烂霓虹",
    high_contrast: "黑白交响",
    eye_care: "青玉护目",
  };

  // 自定义主题名称池
  const customThemeNames = [
    "流云幻境",
    "碧海潮声",
    "紫气东来",
    "春日暖阳",
    "秋水伊人",
    "月华流转",
    "山岚雾霭",
    "江南烟雨",
    "琉璃光影",
    "竹影清风",
    "梅雪飘香",
    "夏夜星辰",
  ];

  // 如果是自定义主题，从名称池中选择一个（基于题ID的哈希）
  if (theme.id.startsWith("custom_")) {
    const index = Math.abs(hashCode(theme.id)) % customThemeNames.length;
    return customThemeNames[index];
  }

  // 返回映射中的名称如果没找到则返回主题原名
  return styleMap[theme.id] || theme.name;
};

// 简单的字符串哈希函数
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};

const handleLanguageChange = (lang: LanguageType) => {
  try {
    setLanguage(lang);
    // 强制刷新组件
    nextTick(() => {
      window.location.reload();
    });
  } catch (error) {
    console.error("Failed to change language:", error);
  }
};
</script>

<style scoped>
.toolbar {
  height: 48px;
  min-height: 48px;
  padding: 0 8px;
  background-color: var(--surface-1);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow);
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
  color: var(--text);
}

.logo-container:hover {
  background-color: var(--surface-2);
}

.logo {
  width: 24px;
  height: 24px;
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.app-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text);
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toolbar-btn:hover {
  background-color: var(--surface-2);
  color: var(--text);
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--border);
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

.current-lang {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-flag,
.color-block {
  width: 16px;
  height: 16px;
  line-height: 1;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.color-block {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.btn-text,
.theme-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-btn {
  min-width: 100px;
  padding: 5px 10px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  background-color: var(--surface-2);
  color: var(--text);
}

.arrow-icon {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.action-btn:hover .arrow-icon {
  transform: translateY(2px);
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .action-btn {
    min-width: unset;
    padding: 6px;
  }

  .btn-text,
  .theme-name,
  .arrow-icon {
    display: none;
  }
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
  color: var(--text);
  margin: 0 0 16px;
}

.theme-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.theme-item {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-item:hover {
  background: var(--surface-2);
}

.theme-item.active {
  border-color: var(--el-color-primary);
  background: var(--surface-2);
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

/* 添加言切换相关样式 */
.lang-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-icon {
  font-size: 16px;
}

/* 语言切换按钮样式 */
.action-btn {
  min-width: 100px;
  padding: 5px 10px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.current-lang,
.theme-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-flag,
.color-block {
  width: 16px;
  height: 16px;
  line-height: 1;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.color-block {
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.btn-text,
.theme-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-icon {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.action-btn:hover .arrow-icon {
  transform: translateY(2px);
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .action-btn {
    min-width: unset;
    padding: 6px;
  }

  .btn-text,
  .theme-name,
  .arrow-icon {
    display: none;
  }
}

/* 工作区选择器样式 */
:deep(.workspace-selector) {
  .el-dropdown-link {
    color: var(--text-secondary);
    transition: all 0.2s ease;
    
    &:hover {
      color: var(--text);
      background-color: var(--surface-2);
    }
  }

  .workspace-name {
    color: var(--text-secondary);
  }

  &:hover .workspace-name {
    color: var(--text);
  }

  /* 下拉菜单样式 */
  .el-dropdown-menu {
    background-color: var(--surface-1);
    border-color: var(--border);
  }

  .el-dropdown-menu__item {
    color: var(--text-secondary);

    &:hover {
      background-color: var(--surface-2);
      color: var(--text);
    }

    &.is-active {
      color: var(--el-color-primary);
      background-color: var(--surface-2);
    }
  }
}

/* 全局下拉菜单样式覆盖 */
:deep(.el-dropdown-menu) {
  background-color: var(--surface-1) !important;
  border-color: var(--border) !important;

  .el-dropdown-menu__item {
    color: var(--text-secondary);

    &:hover, &:focus {
      background-color: var(--surface-2);
      color: var(--text);
    }

    &.is-active {
      color: var(--el-color-primary);
      background-color: var(--surface-2);
    }
  }
}
</style>
