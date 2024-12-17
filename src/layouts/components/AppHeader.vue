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
            <span class="btn-text">{{ currentLanguageLabel }}</span>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </div>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="lang-dropdown">
            <el-dropdown-item command="en">
              <span class="lang-item">
                <span class="lang-flag">🇺🇸</span>
                <span class="lang-label">
                  <span class="lang-name">English</span>
                  <span class="lang-native">English</span>
                </span>
                <el-icon v-if="locale === 'en'" class="check-icon"
                  ><Check
                /></el-icon>
              </span>
            </el-dropdown-item>
            <el-dropdown-item command="zh-CN">
              <span class="lang-item">
                <span class="lang-flag">🇨🇳</span>
                <span class="lang-label">
                  <span class="lang-name">Chinese</span>
                  <span class="lang-native">简体中文</span>
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
          <span class="theme-name">{{ currentThemeDisplay }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
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
import SettingsDropdown from "./SettingsDropdown.vue";
import UserAvatar from "./UserAvatar.vue";
import { useRouter, useRoute } from "vue-router";
import { ref, computed } from "vue";
import { Plus, ArrowDown, Check } from "@element-plus/icons-vue";
import { useThemeStore } from "../../stores/theme";
import ThemeEditor from "../../components/settings/ThemeEditor.vue";
import { Theme } from "../../types/theme";
import ThemePreviewCard from "../../components/common/ThemePreviewCard.vue";
import WorkspaceSelector from "./WorkspaceSelector.vue";
import { useI18n } from "vue-i18n";
import { setLanguage } from "../../i18n";

const router = useRouter();
const route = useRoute();
const themeStore = useThemeStore();
const settingsDropdownRef = ref();
const showThemeEditor = ref(false);
const showThemeDrawer = ref(false);
const { locale } = useI18n();

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

// 当前主题显示计算属性
const currentThemeDisplay = computed(() => {
  const theme = themeStore.currentTheme;
  return theme.name;
});

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

  // 返回映射中的名称，如果没有找到则返回主题原名
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

const currentLanguageLabel = computed(() => {
  return locale.value === "zh-CN" ? "简体中文" : "English";
});

const handleLanguageChange = (lang: string) => {
  setLanguage(lang);
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
  transition: all 0.2s ease;
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
  color: var(--text-color);
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
  background-color: var(--hover-color);
}

.arrow-icon {
  font-size: 12px;
  color: var(--text-color-secondary);
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

/* 添加语言切换相关样式 */
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
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.arrow-icon {
  font-size: 12px;
  color: var(--text-color-secondary);
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

/* 删除重复的样式 */
- .theme-switch { }
- .theme-switch:hover { }
- .theme-indicator { }
- .color-block { }
- .theme-switch:hover .color-block { }
- .theme-name { }
- .arrow-icon { }
- .theme-switch:hover .arrow-icon { }
</style>
