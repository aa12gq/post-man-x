<template>
  <div>
    <!-- 收藏夹弹窗 -->
    <el-dialog
      v-model="showFavoritesDialog"
      title="收藏夹"
      width="60%"
      destroy-on-close
    >
      <FavoriteManager @load="handleFavoriteLoad" />
    </el-dialog>

    <!-- 历史记录弹窗 -->
    <el-dialog
      v-model="showHistoryDialog"
      title="历史记录"
      width="60%"
      destroy-on-close
    >
      <RequestHistory
        :history-list="requestHistory"
        @load-request="handleHistoryLoad"
        @view-details="handleViewDetails"
        @remove-item="handleRemoveHistoryItem"
        @clear-history="handleClearHistory"
      />
    </el-dialog>

    <!-- 环境弹窗 -->
    <el-dialog
      v-model="showEnvironmentDialog"
      title="环境管理"
      width="60%"
      destroy-on-close
    >
      <EnvironmentManager />
    </el-dialog>

    <!-- 创建工作空间对话框 -->
    <el-dialog
      v-model="showCreateWorkspaceDialog"
      title="Create Workspace"
      width="500px"
    >
      <el-form :model="newWorkspace" label-width="100px">
        <el-form-item label="Name">
          <el-input
            v-model="newWorkspace.name"
            placeholder="Enter workspace name"
          />
        </el-form-item>
        <el-form-item label="Description">
          <el-input
            v-model="newWorkspace.description"
            type="textarea"
            placeholder="Enter workspace description"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateWorkspaceDialog = false">Cancel</el-button>
        <el-button type="primary" @click="createWorkspace">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FavoriteManager from '../../components/FavoriteManager.vue'
import RequestHistory from '../../components/history/RequestHistory.vue'
import EnvironmentManager from '../../components/EnvironmentManager.vue'
import { useRequestHistory } from '../../composables/useRequestHistory'

const showFavoritesDialog = ref(false)
const showHistoryDialog = ref(false)
const showEnvironmentDialog = ref(false)
const showCreateWorkspaceDialog = ref(false)

const {
  historyItems: requestHistory,
  removeHistoryItem,
  clearHistory,
} = useRequestHistory()

const newWorkspace = ref({
  name: '',
  description: '',
})

// 处理方法...
const handleFavoriteLoad = (favorite: any) => {
  showFavoritesDialog.value = false
}

const handleHistoryLoad = (item: any) => {
  showHistoryDialog.value = false
}

const handleViewDetails = (item: any) => {
  // 处理查看详情
}

const handleRemoveHistoryItem = (item: any) => {
  removeHistoryItem(item)
}

const handleClearHistory = () => {
  clearHistory()
}

const createWorkspace = () => {
  if (!newWorkspace.value.name) return
  // 创建工作空间的逻辑
  showCreateWorkspaceDialog.value = false
  newWorkspace.value = { name: '', description: '' }
}
</script> 