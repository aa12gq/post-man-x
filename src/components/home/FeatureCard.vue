<template>
  <div
    class="p-5 rounded-2xl bg-surface-2 transition-all duration-300 border border-border-color hover:translate-y-[-4px] hover:shadow-lg hover:border-primary-color h-full flex flex-col items-center text-center"
  >
    <div
      class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-light to-surface-1 flex items-center justify-center mb-4"
    >
      <el-icon class="text-3xl text-primary-color">
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