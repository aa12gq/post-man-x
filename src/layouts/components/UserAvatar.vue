<template>
  <el-dropdown trigger="click" @command="handleCommand">
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
import { useRouter } from 'vue-router'

const isLoggedIn = ref(false)
const userAvatar = ref('')
const router = useRouter()

const handleAvatarError = () => {
  // 使用默认头像或显示用户图标
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      // TODO 原有的登出逻辑
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