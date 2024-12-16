<template>
  <div class="settings-container">
    <SettingsPanel />
  </div>
</template>

<script setup lang="ts">
import SettingsPanel from "./SettingsPanel.vue";
</script>

<style scoped>
.settings-container {
  height: 100%;
  background-color: var(--background);
}
</style>
