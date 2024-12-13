<template>
  <div class="toolbar-icons">
    <el-tooltip content="收藏夹" placement="bottom">
      <el-button text @click="emit('show-favorites')">
        <el-icon><Star /></el-icon>
      </el-button>
    </el-tooltip>

    <el-tooltip content="历史记录" placement="bottom">
      <el-button text @click="emit('show-history')">
        <el-icon><Clock /></el-icon>
      </el-button>
    </el-tooltip>

    <el-tooltip content="环境" placement="bottom">
      <el-button text @click="emit('show-environment')">
        <el-icon><Setting /></el-icon>
      </el-button>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Star, Clock, Setting } from '@element-plus/icons-vue'

const emit = defineEmits<{
  (e: 'show-favorites'): void
  (e: 'show-history'): void
  (e: 'show-environment'): void
}>()
</script>

<style scoped>
.toolbar-icons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.toolbar-icons .el-button {
  font-size: 18px;
  padding: 8px;
  color: var(--text-color);
}

.toolbar-icons .el-button:hover {
  color: var(--el-color-primary);
}
</style> 