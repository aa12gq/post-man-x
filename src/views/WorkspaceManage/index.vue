<template>
  <div class="h-100% bg-gray-100">
    <el-row>
      <el-col :span="4" class="h-screen flex flex-col bg-white shadow-md p-4">
        <!-- logo区域 -->
        <div class="flex items-center justify-center h-10 text-white font-bold">
          <!-- Logo -->
          <div
            class="flex items-center gap-2 flex-shrink-0 cursor-pointer p-1 rounded transition-colors"
            @click="goHome"
          >
            <LogoIcon
              class="w-10 h-10 flex-shrink-0"
              :style="{
                color: `${themeStore.currentTheme.colors.primary}`,
                filter: 'brightness(1.1)',
              }"
            />
            <span
              class="font-semibold text-base hidden sm:block gradient-text"
              :style="{
                background: `linear-gradient(45deg, ${themeStore.currentTheme.colors.primary}, ${themeStore.currentTheme.colors.success})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }"
            >
              RPC Master
            </span>
          </div>
        </div>
        <!-- 工作空间列表 -->
        <el-collapse v-model="activeWorkspace" accordion class="mt-4">
          <el-collapse-item title="我的空间" name="1">
            <div class="p-1 rounded-md flex justify-center hover:bg-gray-100 mb-2">
              <div class="flex items-center w-[150px] justify-start">
                <el-icon><Shop /></el-icon>
                <span class="ml-2 text-left">yug科技</span>
              </div>
            </div>
            <div class="p-1 rounded-md flex justify-center hover:bg-gray-100 mb-2">
              <div class="flex items-center w-[150px] justify-start">
                <el-icon><Shop /></el-icon>
                <span class="ml-2 text-left">个人空间</span>
              </div>
            </div>
            <el-button type="primary" class="mt-2 w-full">
              <template #icon>
                <el-icon><Plus /></el-icon>
              </template>
              创建新空间
            </el-button>
          </el-collapse-item>
        </el-collapse>
        <!-- 功能区域 -->
        <div class="text-sm flex flex-col items-center justify-center h-16 mt-auto">
          <!-- 收藏 -->
          <div class="flex items-center w-full justify-center hover:bg-gray-100 rounded-md p-1">
            <div class="flex items-center w-[150px] justify-start">
              <el-icon><Star /></el-icon>
              <span class="ml-2 text-left">收藏</span>
            </div>
          </div>
          <!-- 最近访问 -->
          <div class="flex items-center w-full justify-center hover:bg-gray-100 rounded-md p-1">
            <div class="flex items-center w-[150px] justify-start">
              <el-icon><Clock /></el-icon>
              <span class="ml-2 text-left">最近访问</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="20" class="border-l border-gray-200 bg-white p-4">
        <!-- 头部 -->
        <header class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">yug科技</h1>
        </header>
        <!-- tab页 -->
        <el-tabs v-model="activeTab" class="mt-4">
          <el-tab-pane label="空间项目" name="project">
            <ProjectTab />
          </el-tab-pane>
          <el-tab-pane label="成员/权限" name="members">
            <MembersPermissions />
          </el-tab-pane>
          <el-tab-pane label="团队设置" name="settings">
            <TeamSettings />
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Plus, Star, Clock, Search, MoreFilled, Shop } from '@element-plus/icons-vue'
import { useThemeStore } from '../../stores/theme'
import ProjectTab from './components/Project.vue'
import MembersPermissions from './components/MembersPermissions.vue'
import TeamSettings from './components/TeamSettings.vue'
const themeStore = useThemeStore()
const activeWorkspace = ref('1')
const activeTab = ref('project')
</script>
