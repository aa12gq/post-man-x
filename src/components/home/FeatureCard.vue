<template>
  <div
    class="p-5 rounded-2xl bg-surface-2 transition-all duration-300 border border-border-color hover:translate-y-[-4px] hover:shadow-lg hover:border-primary-color h-full flex flex-col items-center text-center"
  >
    <div 
      class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      :style="{
        background: `linear-gradient(to bottom right, ${themeStore.currentTheme.colors.primary}20, var(--surface-1))`
      }"
    >
      <el-icon 
        class="text-3xl"
        :style="{ color: themeStore.currentTheme.colors.primary }"
      >
        <component :is="IconComponent" />
      </el-icon>
    </div>
    <div class="flex-1 flex flex-col justify-center">
      <h3 class="text-xl mb-2 text-text-color">{{ title }}</h3>
      <p class="text-sm text-text-secondary leading-relaxed">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Connection,
  Link,
  Collection,
  Box,
  Document,
  Monitor,
} from "@element-plus/icons-vue";
import { useThemeStore } from '../../stores/theme';

const themeStore = useThemeStore();

const props = defineProps<{
  icon: string;
  title: string;
  description: string;
}>();

const IconComponent = computed(() => {
  switch (props.icon) {
    case "Connection":
      return Connection;
    case "Link":
      return Link;
    case "Collection":
      return Collection;
    case "Box":
      return Box;
    case "Document":
      return Document;
    case "Monitor":
      return Monitor;
    default:
      return Document;
  }
});
</script>

<style scoped>
.el-icon {
  transition: all 0.3s ease;
}

/* 卡片悬停效果 */
.rounded-2xl {
  transition: all 0.3s ease;
}

.rounded-2xl:hover {
  transform: scale(1.05);
}

/* 确保图标区域的渐变效果平滑 */
.w-16 {
  transition: background 0.3s ease;
}
</style> 