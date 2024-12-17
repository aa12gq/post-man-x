<template>
  <div
    class="main-layout"
    :class="{
      'toolbar-bottom':
        layoutStore.currentSettings.toolbarPosition === 'bottom',
      'sidebar-collapsed':
        layoutStore.currentSettings.isCollapsed ||
        !layoutStore.currentSettings.showSidebar,
      'hide-sidebar': !layoutStore.currentSettings.showSidebar,
    }"
  >
    <AppHeader v-if="layoutStore.currentSettings.toolbarPosition === 'top'" />
    <div class="main-content">
      <!-- <router-view
				v-if="$route.path === '/'"
				class="content"
			></router-view>
			<RequestPanel v-else></RequestPanel> -->
      <router-view></router-view>
    </div>
    <AppHeader
      v-if="layoutStore.currentSettings.toolbarPosition === 'bottom'"
    />
  </div>
</template>

<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import { useLayoutStore } from "../stores/layout";

const layoutStore = useLayoutStore();
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.main-layout.toolbar-bottom {
  flex-direction: column;
}

.main-layout.toolbar-bottom .main-content {
  flex: 1;
  min-height: 0;
}

.content {
  flex: 1;
  overflow: auto;
  height: 100%;
}

:deep(.request-panel) {
  flex: 1;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
