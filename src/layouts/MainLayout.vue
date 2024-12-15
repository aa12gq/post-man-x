<template>
  <div class="main-layout">
    <AppHeader />
    <router-view v-if="$route.path === '/'" class="content"></router-view>
    <RequestPanel v-else></RequestPanel>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "./components/AppHeader.vue";
import RequestPanel from "../components/RequestPanel.vue";
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  overflow: auto;
}
</style> 