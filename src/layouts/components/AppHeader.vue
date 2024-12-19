<template>
  <div
    class="h-12 min-h-12 px-2 bg-surface-1 border-b border-border flex items-center justify-between flex-nowrap relative z-50 shadow-sm"
  >
    <!-- 左侧区域 -->
    <div class="flex items-center gap-2 min-w-0 flex-shrink-1">
      <!-- Logo -->
      <div
        class="flex items-center gap-2 flex-shrink-0 cursor-pointer p-1 rounded hover:bg-surface-2 transition-colors"
        @click="goHome"
      >
        <LogoIcon
          class="w-6 h-6 flex-shrink-0"
          :style="{
            color: `${themeStore.currentTheme.colors.primary}`,
            filter: 'brightness(1.1)',
          }"
        />
        <span
          class="font-semibold text-base hidden sm:block gradient-text"
          :style="{
            background: `linear-gradient(45deg, ${themeStore.currentTheme.colors.primary}, ${themeStore.currentTheme.colors.success})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }"
        >
          RPC Master
        </span>
      </div>
      <WorkspaceSelector />
    </div>

    <!-- 右侧区域 -->
    <div class="flex items-center gap-2 flex-shrink-0">
      <!-- 分隔线 -->
      <div class="w-px h-6 bg-border mx-1 flex-shrink-0 hidden sm:block"></div>

      <!-- 语言切换 -->
      <el-dropdown trigger="click" @command="handleLanguageChange">
        <button
          class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text transition-colors min-w-[100px] sm:min-w-fit"
        >
          <span class="w-4 h-4 leading-none">{{
            locale === "zh-CN" ? "🇨🇳" : "🇺🇸"
          }}</span>
          <span class="hidden sm:block">{{
            $t(`header.language.${locale === "zh-CN" ? "zh" : "en"}`)
          }}</span>
          <el-icon
            class="text-xs transition-transform group-hover:translate-y-0.5 hidden sm:block"
            ><ArrowDown
          /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="!bg-surface-1 !border-border">
            <el-dropdown-item command="en-US">
              <div class="flex items-center gap-2">
                <span class="w-4 h-4">🇺🇸</span>
                <span>{{ $t("header.language.en-US") }}</span>
                <el-icon v-if="locale === 'en-US'" class="ml-auto"
                  ><Check
                /></el-icon>
              </div>
            </el-dropdown-item>
            <el-dropdown-item command="zh-CN">
              <div class="flex items-center gap-2">
                <span class="w-4 h-4">🇨🇳</span>
                <span>{{ $t("header.language.zh-CN") }}</span>
                <el-icon v-if="locale === 'zh-CN'" class="ml-auto"
                  ><Check
                /></el-icon>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 主题切换 -->
      <button
        class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-2 text-text-secondary hover:text-text transition-colors min-w-[100px] sm:min-w-fit"
        @click="showThemeDrawer = true"
      >
        <div
          class="w-4 h-4 rounded shadow-inner"
          :style="{ backgroundColor: themeStore.currentTheme.colors.primary }"
        ></div>
        <span class="hidden sm:block text-sm">{{ $t("header.theme.title") }}</span>
        <el-icon
          class="text-xs transition-transform group-hover:translate-y-0.5 hidden sm:block"
          ><ArrowDown
        /></el-icon>
      </button>

      <!-- 设置和用户头像 -->
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
    class="theme-drawer"
  >
    <div class="p-6 overflow-y-auto">
      <!-- 官方主题 -->
      <div class="mb-10">
        <h3
          class="text-lg font-semibold text-text-color mb-6 flex items-center gap-2"
        >
          <div class="w-1 h-6 bg-primary-color rounded-full"></div>
          {{ t("settings.theme.officialThemes") }}
        </h3>
        <div class="grid grid-cols-1 gap-6">
          <div
            v-for="theme in themeStore.officialCustomThemes"
            :key="theme.id"
            class="group relative border border-border/50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br from-surface-1 to-surface-2"
            :class="{
              'ring-2 ring-primary-color ring-offset-4 ring-offset-surface-1':
                themeStore.currentTheme.id === theme.id,
            }"
            @click="applyTheme(['custom', theme.id])"
          >
            <!-- 悬停渐变效果 -->
            <div
              class="absolute -inset-[1px] bg-gradient-to-r from-primary-color/20 via-success/20 to-primary-color/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"
            ></div>

            <!-- 主题预览卡片 -->
            <div
              class="relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-primary-color/20"
            >
              <ThemePreviewCard
                :theme="theme"
                class="w-full aspect-[3/1] relative z-10"
              />
            </div>

            <!-- 主题信息 -->
            <div class="text-center mt-4 relative z-10">
              <span
                class="block text-base font-medium text-text-color mb-1.5 group-hover:text-primary-color transition-colors"
              >
                {{ theme.name }}
              </span>
              <span
                class="inline-block px-3 py-1 text-sm text-text-secondary bg-surface-1/80 rounded-full shadow-inner backdrop-blur-sm"
              >
                {{ t(`settings.theme.${theme.isDark ? "dark" : "light"}`) }}
              </span>
            </div>

            <!-- 选中指示器 -->
            <div
              v-if="themeStore.currentTheme.id === theme.id"
              class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary-color rounded-full shadow-lg flex items-center justify-center z-20"
            >
              <el-icon class="text-white text-sm"><Check /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 自定义主题 -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3
            class="text-lg font-semibold text-text-color flex items-center gap-2"
          >
            <div class="w-1 h-6 bg-primary-color rounded-full"></div>
            {{ t("settings.theme.customThemes") }}
          </h3>
          <el-button
            type="primary"
            class="!bg-gradient-to-r !from-primary-color !to-success hover:!opacity-90 border-none flex items-center gap-2 !px-4 !h-9"
            @click="showThemeEditor = true"
          >
            <el-icon><Plus /></el-icon>
            {{ t("settings.theme.createTheme") }}
          </el-button>
        </div>
        <div class="grid grid-cols-1 gap-6">
          <div
            v-for="theme in themeStore.customThemes"
            :key="theme.id"
            class="group relative border border-border/50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br from-surface-1 to-surface-2"
            :class="{
              'ring-2 ring-primary-color ring-offset-4 ring-offset-surface-1':
                themeStore.currentTheme.id === theme.id,
            }"
            @click="applyTheme(['custom', theme.id])"
          >
            <!-- 悬停渐变效果 -->
            <div
              class="absolute -inset-[1px] bg-gradient-to-r from-primary-color/20 via-success/20 to-primary-color/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm"
            ></div>

            <!-- 主题预览卡片 -->
            <div
              class="relative rounded-lg overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-primary-color/20"
            >
              <ThemePreviewCard
                :theme="theme"
                class="w-full aspect-[3/1] relative z-10"
              />
            </div>

            <!-- 主题信息 -->
            <div class="text-center mt-4 relative z-10">
              <span
                class="block text-base font-medium text-text-color mb-1.5 group-hover:text-primary-color transition-colors"
              >
                {{ theme.name }}
              </span>
              <span
                class="inline-block px-3 py-1 text-sm text-text-secondary bg-surface-1/80 rounded-full shadow-inner backdrop-blur-sm"
              >
                {{ t(`settings.theme.${theme.isDark ? "dark" : "light"}`) }}
              </span>
            </div>

            <!-- 选中指示器 -->
            <div
              v-if="themeStore.currentTheme.id === theme.id"
              class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-primary-color rounded-full shadow-lg flex items-center justify-center z-20"
            >
              <el-icon class="text-white text-sm"><Check /></el-icon>
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
import { ref } from "vue";
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

const handleLanguageChange = (lang: LanguageType) => {
  try {
    setLanguage(lang);
  } catch (error) {
    console.error("Failed to change language:", error);
  }
};
</script>

<style>
/* 仅保留必要的全局样式覆盖 */
:deep(.el-dropdown-menu) {
  background-color: var(--surface-1) !important;
  border-color: var(--border-color) !important;
}

:deep(.el-dropdown-menu__item) {
  color: var(--text-secondary);
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: var(--surface-2);
  color: var(--text-color);
}

:deep(.el-dropdown-menu__item.is-active) {
  color: var(--primary-color);
  background-color: var(--surface-2);
}

:deep(.workspace-selector .el-dropdown-link) {
  color: var(--text-secondary);
}

:deep(.workspace-selector .el-dropdown-link:hover) {
  color: var(--text-color);
  background-color: var(--surface-2);
}

/* 图标颜色过渡效果 */
:deep(svg) {
  transition: color 0.3s ease;
}

/* 图标和文字的颜色过渡效果 */
:deep(svg),
.font-semibold {
  transition: color 0.3s ease;
}

/* 渐变文字效果 */
:deep(svg),
.gradient-text {
  transition: all 0.3s ease;
  background-size: 200% auto;
  animation: shine 2s linear infinite;
}

@keyframes shine {
  to {
    background-position: 200% center;
  }
}

/* 确保渐变效果在 hover 时更明显 */
.cursor-pointer:hover :deep(svg),
.cursor-pointer:hover .gradient-text {
  filter: brightness(1.1);
  transform: scale(1.02);
}
</style>
