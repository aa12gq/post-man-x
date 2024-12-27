<template>
  <div class="p-4">
    <!-- 统计信息 -->
    <div class="flex justify-around items-center bg-gray-100 w-full h-44 rounded-md mb-4">
      <div class="text-center">
        <h2 class="text-5xl font-bold">1</h2>
        <p>成员</p>
      </div>
      <div class="text-center">
        <h2 class="text-5xl font-bold">0</h2>
        <p>游客</p>
      </div>
      <div class="text-center">
        <h2 class="text-5xl font-bold">0</h2>
        <p>待定</p>
      </div>
    </div>

    <!-- 搜索和邀请按钮 -->
    <div class="flex justify-end space-x-2 items-center mb-4">
      <el-input v-model="search" placeholder="搜索" style="width: 200px">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary">
        <template #icon>
          <el-icon><Plus /></el-icon>
        </template>
        邀请成员
      </el-button>
    </div>

    <!-- 成员列表 -->
    <el-table :data="members" stripe style="width: 100%">
      <el-table-column prop="nickname" label="昵称" width="150">
        <template #default="scope">
          <div class="flex items-center">
            <img :src="scope.row.avatar" alt="avatar" class="w-8 h-8 rounded-full mr-2" />
            <span>{{ scope.row.nickname }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="团队权限">
        <template #default="scope">
          <el-tag type="success">{{ scope.row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastModified" label="最近修改" />
      <el-table-column label="操作" width="100">
        <el-icon><Setting /></el-icon>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Plus, Search, Setting } from '@element-plus/icons-vue'

const search = ref('')
const members = ref([
  {
    nickname: 'akita',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 替换为实际头像路径
    email: 'akita@example.com',
    role: '团队所有者',
    lastModified: '10个月前',
  },
  {
    nickname: 'akita',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 替换为实际头像路径
    email: 'akita@example.com',
    role: '团队所有者',
    lastModified: '10个月前',
  },
  {
    nickname: 'akita',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 替换为实际头像路径
    email: 'akita@example.com',
    role: '团队所有者',
    lastModified: '10个月前',
  },
])
</script>
