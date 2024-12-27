<template>
  <div class="p-4 text-sm">
    <!-- 基础信息 -->
    <el-card class="mb-6">
      <h2 class="text-xl font-semibold mb-4">基础信息</h2>
      <div class="grid grid-cols-3 gap-4 border-b border-gray-200 pb-2">
        <div class="col-span-1">团队名称</div>
        <div class="col-span-1">个人空间</div>
        <div class="col-span-1 text-right">
          <el-button @click="openEditDialog('teamName')">编辑</el-button>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4 border-b border-gray-200 py-2">
        <div class="col-span-1">团队 ID</div>
        <div class="col-span-2">2335275</div>
      </div>
      <div class="grid grid-cols-3 gap-4 py-2">
        <div class="col-span-1">我的团队内昵称</div>
        <div class="col-span-2 text-right">
          <el-button @click="openEditDialog('nickName')">编辑</el-button>
        </div>
      </div>
    </el-card>
    <el-card>
      <h2 class="text-xl font-semibold mb-4">权限</h2>
      <div class="grid grid-cols-3 gap-4 border-b border-gray-200 pb-2">
        <div class="col-span-1">移交</div>
        <div class="col-span-1">将团队的所有者权限移交给其他成员</div>
        <div class="col-span-1 text-right">
          <el-button>移交</el-button>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-4 py-2">
        <div class="col-span-1">解散团队</div>
        <div class="col-span-1">务必谨慎，解散后无法找回</div>
        <div class="col-span-1 text-right">
          <el-button @click="openDisbandDialog">解散</el-button>
        </div>
      </div>
    </el-card>
  </div>
  <!-- 编辑对话框 -->
  <el-dialog v-model="isDialogVisible" :title="dialogTitle" width="400px">
    <el-form label-position="top" v-if="currentEditType === 'teamName'">
      <el-form-item required label="团队名称">
        <el-input v-model="teamName" />
      </el-form-item>
    </el-form>

    <el-form label-position="top" v-else-if="currentEditType === 'nickName'">
      <el-form-item required label="我的昵称">
        <el-input v-model="nickName" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="isDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveChanges">保存</el-button>
    </template>
  </el-dialog>

  <!-- 解散对话框 -->
  <el-dialog v-model="isDisbandDialogVisible" title="解散团队？" width="500px">
    <div class="text-center flex flex-col items-start justify-center mb-4">
      <p class="text-red-500 font-semibold">
        解散个人空间团队后，该团队下的所有项目都将被同步删除，且不可恢复！
      </p>
      <p class="text-gray-600">请输入团队名以确认操作：</p>
    </div>
    <el-input
      v-model="confirmTeamName"
      placeholder="请输入团队名"
      class="mb-4"
      clearable
    />
    <template #footer>
      <div class="flex justify-end">
        <el-button @click="isDisbandDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDisband" class="ml-2">
          我已了解后果，确定解散
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const isDialogVisible = ref(false)
const isDisbandDialogVisible = ref(false)
const currentEditType = ref('')

const teamName = ref('')
const nickName = ref('')
const confirmTeamName = ref('')

// 计算属性，用于动态设置对话框标题
const dialogTitle = computed(() => {
  return currentEditType.value === 'teamName' ? '修改团队' : '修改昵称'
})

const openEditDialog = (type: string) => {
  currentEditType.value = type
  isDialogVisible.value = true
}

const openDisbandDialog = () => {
  isDisbandDialogVisible.value = true
}

const saveChanges = () => {
  // 保存更改的逻辑
  isDialogVisible.value = false
}

const confirmDisband = () => {
  // 确认解散的逻辑
  isDisbandDialogVisible.value = false
}
</script>
