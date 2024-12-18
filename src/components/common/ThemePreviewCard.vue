<template>
  <div class="theme-preview-card group/card">
    <!-- 主卡片内容 -->
    <div 
      class="w-full h-full relative transition-all duration-500 group-hover/card:scale-[1.02] group-hover/card:shadow-xl rounded-lg overflow-hidden"
      :style="{
        backgroundColor: theme.colors['surface-1'],
      }"
    >
      <!-- 顶部工具栏 -->
      <div 
        class="h-7 flex items-center justify-between px-3 border-b transition-all duration-300"
        :style="{ 
          backgroundColor: theme.colors['surface-2'],
          borderColor: theme.colors['border-color']
        }"
      >
        <div class="flex items-center gap-2">
          <!-- 窗口控制按钮使用主题的实际颜色 -->
          <div class="flex gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover/card:scale-110" 
                 :style="{ backgroundColor: theme.colors['danger'] }"></div>
            <div class="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover/card:scale-110 delay-75" 
                 :style="{ backgroundColor: theme.colors['warning'] }"></div>
            <div class="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover/card:scale-110 delay-150" 
                 :style="{ backgroundColor: theme.colors['success'] }"></div>
          </div>
          <div 
            class="text-[8px] font-medium transition-colors duration-300"
            :style="{ 
              color: theme.isDark ? '#fff' : theme.colors['text-color'],
              opacity: theme.isDark ? 0.9 : 0.8
            }"
          >
            <span class="opacity-60">{{ theme.isDark ? '● ' : '' }}</span>
            <span class="group-hover/card:text-primary-color transition-colors duration-300">RPC Master</span>
          </div>
        </div>
      </div>

      <!-- 主界面 -->
      <div class="flex h-[calc(100%-28px)]">
        <!-- 侧边栏 -->
        <div 
          class="w-10 h-full border-r flex flex-col py-1.5 px-1 gap-1 transition-colors duration-300"
          :style="{ 
            backgroundColor: theme.colors['surface-2'],
            borderColor: theme.colors['border-color']
          }"
        >
          <!-- 活动栏图标 -->
          <div 
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/card:shadow-md"
            :style="{ backgroundColor: theme.colors['surface-3'] }"
          >
            <div 
              class="w-6 h-4 rounded-sm transition-all duration-300 group-hover/card:scale-110"
              :style="{ backgroundColor: theme.colors['primary-color'] }"
            ></div>
          </div>
          <!-- 次要图标 -->
          <div 
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/card:translate-x-0.5"
            :style="{ backgroundColor: theme.colors['surface-3'] }"
          >
            <div 
              class="w-6 h-4 rounded-sm transition-opacity duration-300 group-hover/card:opacity-60"
              :style="{ backgroundColor: theme.isDark ? '#fff' : theme.colors['text-color'], opacity: 0.4 }"
            ></div>
          </div>
          <!-- 次要图标 -->
          <div 
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover/card:translate-x-0.5"
            :style="{ backgroundColor: theme.colors['surface-3'] }"
          >
            <div 
              class="w-6 h-4 rounded-sm transition-opacity duration-300 group-hover/card:opacity-60"
              :style="{ backgroundColor: theme.isDark ? '#fff' : theme.colors['text-color'], opacity: 0.4 }"
            ></div>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="flex-1">
          <!-- 工具栏 -->
          <div 
            class="h-7 flex items-center px-3 border-b transition-colors duration-300"
            :style="{ 
              backgroundColor: theme.colors['surface-1'],
              borderColor: theme.colors['border-color']
            }"
          >
            <div class="flex items-center gap-2">
              <div 
                class="w-20 h-5 rounded transition-all duration-300 group-hover/card:shadow-sm"
                :style="{ 
                  backgroundColor: theme.colors['surface-2'],
                  border: `1px solid ${theme.colors['border-color']}`
                }"
              ></div>
              <div 
                class="w-16 h-5 rounded transition-all duration-300 group-hover/card:shadow-sm"
                :style="{ 
                  backgroundColor: theme.colors['surface-2'],
                  border: `1px solid ${theme.colors['border-color']}`
                }"
              ></div>
            </div>
          </div>

          <!-- 内容区 -->
          <div class="p-3">
            <!-- 内容预览 -->
            <div class="flex flex-col gap-1.5 mb-3">
              <div 
                class="h-2.5 rounded transition-all duration-300 group-hover/card:w-[85%]"
                :style="{ 
                  width: '80%',
                  backgroundColor: theme.isDark ? '#fff' : theme.colors['text-color'],
                  opacity: 0.1
                }"
              ></div>
              <div 
                class="h-2.5 rounded transition-all duration-300 group-hover/card:w-[70%]"
                :style="{ 
                  width: '65%',
                  backgroundColor: theme.isDark ? '#fff' : theme.colors['text-color'],
                  opacity: 0.1
                }"
              ></div>
            </div>

            <!-- 按钮组 -->
            <div class="flex gap-2">
              <div 
                class="w-10 h-6 rounded-md shadow-sm transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-md"
                :style="{ backgroundColor: theme.colors['primary-color'] }"
              ></div>
              <div 
                class="w-10 h-6 rounded-md shadow-sm transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-md delay-75"
                :style="{ backgroundColor: theme.colors['success'] }"
              ></div>
              <div 
                class="w-10 h-6 rounded-md shadow-sm transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-md delay-150"
                :style="{ backgroundColor: theme.colors['warning'] }"
              ></div>
              <div 
                class="w-10 h-6 rounded-md shadow-sm transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-md delay-200"
                :style="{ backgroundColor: theme.colors['danger'] }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 悬停时的光晕效果 -->
      <div 
        class="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
        :style="{
          background: `linear-gradient(120deg, ${theme.colors['primary-color']}10, ${theme.colors['primary-color']}05, transparent)`
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Theme } from '../../types/theme';

defineProps<{
  theme: Theme;
}>();
</script>

<style scoped>
.theme-preview-card {
  @apply w-full h-full p-2 rounded-lg transition-all duration-500;
  perspective: 1000px;
}

.theme-preview-card:hover {
  @apply -translate-y-1;
}
</style> 