<template>
  <el-collapse v-model="activeWorkspace" accordion class="mt-4">
    <el-collapse-item title="我的团队" name="1">
      <div
        class="p-1 rounded-md flex justify-center hover:bg-gray-100 mb-2"
        :class="{ 'bg-gray-100': workspaceStore.currentWorkspaceInfo.id === workspace.id }"
        v-for="workspace in workspaceStore.workspaceList"
        :key="workspace.id"
        @click="workspaceStore.handleGetCollectionList(workspace.id, workspace.name)"
      >
        <div class="flex items-center w-[150px] justify-between">
          <div class="w-[130px] flex items-center">
            <el-icon><Shop /></el-icon>
            <span
              class="ml-2 text-left overflow-hidden whitespace-nowrap text-ellipsis"
              :contenteditable="editableWorkspace === workspace.id"
              @click.stop="enableEditing(workspace.id, $event)"
              @keydown.stop="handleKeydown(workspace.id, $event)"
            >
              {{ workspace.name }}
            </span>
          </div>
          <div class="flex-grow"></div>

          <el-dropdown trigger="hover" placement="bottom-start">
            <el-icon><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu class="w-[100px]">
                <el-dropdown-item @click="editWorkspace(workspace.id)">重命名</el-dropdown-item>
                <el-dropdown-item @click="workspaceStore.handleDeleteWorkspace(workspace.id)"
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-collapse-item>
    <el-button
      type="primary"
      class="mt-2 w-full"
      @click="workspaceStore.dialogVisible.createWorkspace = true"
    >
      <template #icon>
        <el-icon><Plus /></el-icon>
      </template>
      创建团队
    </el-button>
  </el-collapse>
  <el-dialog v-model="workspaceStore.dialogVisible.editWorkspace" title="重命名" width="30%">
    <el-form label-position="top" :model="workspaceStore.editWorkspaceData">
      <el-form-item label="名称" prop="name">
        <el-input maxlength="20" show-word-limit v-model="workspaceStore.editWorkspaceData.name" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="workspaceStore.dialogVisible.editWorkspace = false">取消</el-button>
      <el-button type="primary" @click="workspaceStore.handleEditWorkspace">确定</el-button>
    </template>
  </el-dialog>
  <el-dialog v-model="workspaceStore.dialogVisible.createWorkspace" title="创建新空间" width="30%">
    <el-form label-position="top" :model="workspaceStore.createWorkspaceData">
      <el-form-item label="名称" prop="name">
        <el-input
          maxlength="20"
          show-word-limit
          v-model="workspaceStore.createWorkspaceData.name"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="workspaceStore.dialogVisible.createWorkspace = false">取消</el-button>
      <el-button type="primary" @click="workspaceStore.handleCreateWorkspace">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { MoreFilled, Plus, Shop } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useWorkspaceStore } from '../../../stores/workspace'

const activeWorkspace = ref('1')
const workspaceStore = useWorkspaceStore()
const editableWorkspace = ref<string>('')

function enableEditing(id: string, event: MouseEvent) {
  editableWorkspace.value = id
  const target = event.target as HTMLSpanElement
  // 立即进入编辑模式
  setTimeout(() => {
    target.focus()
    document.execCommand('selectAll', false, null)
  }, 0)
}

const editWorkspace = (id: string) => {
  workspaceStore.dialogVisible.editWorkspace = true
  workspaceStore.editWorkspaceData.id = String(id)
}

function handleKeydown(workspaceId: string, event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    console.log(workspaceId)
    const target = event.target as HTMLSpanElement
    console.log(target.textContent)
    editableWorkspace.value = null // 结束编辑
  }
}
</script>
