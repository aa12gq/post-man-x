<template>
  <div class="vue-devtools-wrapper">
    <!-- DevTools 将自动注入到这里 -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Vue DevTools 已加载')
})
</script>

<style scoped>
.vue-devtools-wrapper {
  display: none; /* 在生产环境中隐藏 */
}
</style> 