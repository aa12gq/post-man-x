<template>
  <div
    class="main-layout"
    :class="{
      'toolbar-bottom': layoutStore.currentSettings.toolbarPosition === 'bottom',
      'sidebar-collapsed':
        layoutStore.currentSettings.isCollapsed || !layoutStore.currentSettings.showSidebar,
      'hide-sidebar': !layoutStore.currentSettings.showSidebar,
    }"
  >
    <!-- 通过路由元数据判断是否显示头部,如果为false则不显示 -->
    <AppHeader
      v-if="layoutStore.currentSettings.toolbarPosition === 'top' && route.meta.showHeader"
    />
    <div class="main-content">
      <router-view></router-view>
    </div>
    <AppHeader v-if="layoutStore.currentSettings.toolbarPosition === 'bottom'" />
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import { useLayoutStore } from '../stores/layout'
import { useUserStore } from '../stores/user'
import { useRoute } from 'vue-router'

const route = useRoute()
const layoutStore = useLayoutStore()
const userStore = useUserStore()
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 100vh;
  background-color: rgba(var(--background-rgb), 0.8);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background-color: transparent;
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
