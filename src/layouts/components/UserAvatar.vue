<template>
  <el-dropdown trigger="click" @command="handleUserCommand">
    <div class="user-avatar">
      <el-avatar :size="32" :src="userAvatar" @error="handleAvatarError">
        <el-icon><User /></el-icon>
      </el-avatar>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">
          <el-icon><UserFilled /></el-icon>
          Profile
        </el-dropdown-item>
        <el-dropdown-item command="settings">
          <el-icon><Setting /></el-icon>
          Settings
        </el-dropdown-item>
        <el-dropdown-item divided command="login" v-if="!isLoggedIn">
          <el-icon><Key /></el-icon>
          Sign In
        </el-dropdown-item>
        <el-dropdown-item command="logout" v-else>
          <el-icon><SwitchButton /></el-icon>
          Sign Out
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { User, UserFilled, Key, Setting, SwitchButton } from '@element-plus/icons-vue'

const isLoggedIn = ref(false)
const userAvatar = ref('')

const handleAvatarError = () => {
  // 使用默认头像或显示用户图标
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // 处理查看个人信息
      break
    case 'settings':
      // 处理设置
      break
    case 'login':
      // 处理登录
      break
    case 'logout':
      // 处理退出登录
      break
  }
}
</script>

<style scoped>
.user-avatar {
  cursor: pointer;
  transition: opacity 0.2s;
}

.user-avatar:hover {
  opacity: 0.8;
}
</style> 