<template>
  <el-switch
    v-model="isDarkMode"
    inline-prompt
    :active-icon="Moon"
    :inactive-icon="Sunny"
    @change="toggleTheme"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Moon, Sunny } from '@element-plus/icons-vue'

const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

const toggleTheme = (value: boolean) => {
  const theme = value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  isDarkMode.value = savedTheme === 'dark'
  document.documentElement.setAttribute('data-theme', savedTheme)
})
</script> 