<template>
  <el-dropdown trigger="click" @command="handleSettingCommand">
    <el-button text>
      <el-icon :size="18"><Setting /></el-icon>
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="preferences">
          <el-icon><Tools /></el-icon>
          Preferences
        </el-dropdown-item>
        <el-dropdown-item command="keyboard">
          <el-icon><Position /></el-icon>
          Keyboard Shortcuts
        </el-dropdown-item>
        <el-dropdown-item command="appearance">
          <el-icon><Brush /></el-icon>
          Appearance
        </el-dropdown-item>
        <el-dropdown-item divided command="about">
          <el-icon><InfoFilled /></el-icon>
          About
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { Setting, Tools, Position, Brush, InfoFilled } from '@element-plus/icons-vue'

const handleSettingCommand = (command: string) => {
  switch (command) {
    case 'preferences':
      // 处理偏好设置
      break
    case 'keyboard':
      // 处理快捷键设置
      break
    case 'appearance':
      // 处理外观设置
      break
    case 'about':
      // 处理关于信息
      break
  }
}
</script> 