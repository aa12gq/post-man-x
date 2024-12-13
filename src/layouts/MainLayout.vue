<template>
  <div class="app-container">
    <AppHeader />
    <div class="content-wrapper">
      <RequestPanel :current-workspace="currentWorkspace" />
    </div>
    <AppDialogs />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppDialogs from './components/AppDialogs.vue'
import RequestPanel from '../components/RequestPanel.vue'

const currentWorkspace = ref('Default Workspace')
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 48px);
}
</style> 