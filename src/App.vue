<template>
  <div
    class="min-h-screen bg-surface-1 text-text-color"
    :class="{
      [`layout-${layoutStore.settings.currentLayout}`]: true,
      'sidebar-collapsed': layoutStore.settings.isCollapsed,
      [`toolbar-${layoutStore.settings.toolbarPosition}`]: true,
      [`tabs-${layoutStore.settings.tabsPosition}`]: true,
      'has-background': hasBackgroundImage,
    }"
  >
    <MainLayout />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import MainLayout from "./layouts/MainLayout.vue";
import { useThemeStore } from "./stores/theme";
import { useSettings } from "./stores/settings";
import type { Settings } from "./stores/settings";
import { useLayoutStore } from "./stores/layout";

const themeStore = useThemeStore();
const settingsStore = useSettings();
const layoutStore = useLayoutStore();

const hasBackgroundImage = computed(() => {
  return (
    themeStore.currentTheme?.backgroundImage?.enabled &&
    themeStore.currentTheme?.backgroundImage?.image
  );
});

themeStore.initializeTheme();

onMounted(async () => {
  window.addEventListener("settings-changed", ((
    event: CustomEvent<Settings>
  ) => {
    const settings = event.detail;
    applyGlobalSettings(settings);
  }) as EventListener);

  applyGlobalSettings(settingsStore.settings);
});

function applyGlobalSettings(settings: Settings) {
  document.documentElement.style.setProperty(
    "--editor-font-size",
    `${settings.general.fontSize}px`
  );
  document.documentElement.style.setProperty(
    "--editor-font-family",
    settings.general.fontFamily
  );
  document.documentElement.style.setProperty(
    "--editor-tab-size",
    `${settings.general.tabSize}`
  );
  document.documentElement.style.setProperty(
    "--editor-word-wrap",
    settings.general.wordWrap ? "break-word" : "normal"
  );
}
</script>

<style>
/* 仅保留背景图相关样式 */
.has-background::before {
  @apply content-[''] fixed inset-0 pointer-events-none z-0;
  background-image: var(--background-overlay), var(--background-image);
  background-blend-mode: var(--background-blend-mode);
  background-size: var(--background-size);
  background-position: var(--background-position);
  background-repeat: var(--background-repeat);
  background-attachment: var(--background-attachment);
}

.has-background > * {
  @apply relative z-10;
}
</style>
