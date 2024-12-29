<template>
  <div
    v-if="workspaceStore.isLoading"
    class="flex justify-center items-center w-full h-[calc(100vh-300px)]"
  >
    <LoadingSpinner />
  </div>

  <div v-else>
    <div class="p-4 flex items-center justify-end w-full space-x-2">
      <el-input v-model="search" placeholder="搜索" style="width: 200px">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="">
        <template #icon>
          <el-icon><Plus /></el-icon>
        </template>
        导入项目
      </el-button>
      <el-button type="primary" @click="workspaceStore.dialogVisible.createProject = true">
        <template #icon>
          <el-icon><Plus /></el-icon>
        </template>
        新建项目
      </el-button>
    </div>

    <div
      v-if="workspaceStore.collectionList.length > 0"
      class="p-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto h-[calc(100vh-200px)] scrollbar-none"
    >
      <div
        v-for="project in workspaceStore.collectionList"
        :key="project.id"
        class="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md p-4 flex flex-col justify-between h-44"
      >
        <div class="flex items-center mb-2">
          <div class="flex items-center justify-between gap-2 w-full">
            <div
              class="flex items-center cursor-pointer gap-2"
              @click="handleProjectClick(project.id)"
            >
              <h4 class="font-semibold">{{ project.name }}</h4>
              <p
                class="text-[10px] text-gray-500 bg-orange-200 w-[40px] h-[15px] flex items-center justify-center rounded-md p-1"
              >
                {{ project.protocol }}
              </p>
            </div>
            <el-dropdown trigger="hover">
              <el-icon><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="showDeleteDialog(project.id, project.name)"
                    >删除</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <p v-if="project.description" class="text-sm text-gray-600 mb-2">
          {{ project.description }}
        </p>
        <p v-else class="text-sm text-gray-600 mb-2">暂无描述</p>
        <div class="text-xs text-gray-400">
          <p>所有者: {{ project.owner }}</p>
          <p>成员数: {{ project.members_count }}</p>
          <p>创建日期: {{ project.created_at }}</p>
        </div>
      </div>
    </div>

    <div v-else class="flex justify-center items-center w-full h-[calc(100vh-300px)]">
      <img src="@/assets/images/nodata.png" alt="empty" class="w-[200px] h-[200px]" />
    </div>
  </div>

  <el-dialog
    title="确认删除"
    v-model="workspaceStore.dialogVisible.deleteProject"
    width="30%"
    @close="workspaceStore.dialogVisible.deleteProject = false"
  >
    <div class="text-center flex flex-col items-start justify-center mb-4">
      <p class="text-red-500 font-semibold">
        删除项目后，该项目下的所有请求都将被同步删除，且不可恢复！
      </p>
      <p class="text-gray-600">请输入项目名以确认操作：{{ currentProjectName }}</p>
    </div>
    <el-input v-model="deleteProjectName" placeholder="请输入项目名" class="mb-4" clearable />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="workspaceStore.dialogVisible.deleteProject = false">取 消</el-button>
        <el-button type="primary" @click="deleteProject">确 定</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog title="新建项目" v-model="workspaceStore.dialogVisible.createProject" width="40%">
    <el-row>
      <el-col :span="8" class="border-r pr-4">
        <div class="flex flex-col items-center justify-center gap-2 h-full">
          <div
            :class="[
              'flex items-center justify-center w-[60%] h-[25%] border rounded-md gap-1',
              workspaceStore.createProjectData.protocol === 'gRPC'
                ? 'border-[--primary-color] text-[--primary-color]'
                : '',
            ]"
            @click="workspaceStore.createProjectData.protocol = 'gRPC'"
          >
            <i class="iconfont icon-gRPC text-[40px] rounded-md p-1" />
          </div>
          <div
            :class="[
              'flex items-center justify-center w-[60%] h-[25%] border rounded-md gap-1',
              workspaceStore.createProjectData.protocol === 'HTTP'
                ? 'border-[--primary-color] text-[--primary-color]'
                : '',
            ]"
            @click="workspaceStore.createProjectData.protocol = 'HTTP'"
          >
            <i class="iconfont icon-http text-[40px] rounded-md p-1" />
          </div>
        </div>
      </el-col>

      <el-col :span="16" class="pl-4">
        <el-form label-position="top" :model="workspaceStore.createProjectData">
          <el-form-item label="名称" prop="name">
            <el-input
              maxlength="20"
              placeholder="请输入项目名称"
              show-word-limit
              v-model="workspaceStore.createProjectData.name"
            />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              type="textarea"
              :rows="4"
              placeholder="请输入项目描述"
              v-model="workspaceStore.createProjectData.description"
            />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <template #footer>
      <el-button @click="workspaceStore.dialogVisible.createProject = false">取消</el-button>
      <el-button type="primary" @click="workspaceStore.handleCreateCollection">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { MoreFilled, Plus, Search } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useWorkspaceStore } from '../../../stores/workspace'
import { displayNotification } from '../../../utils/message'
const search = ref('')
const deleteProjectName = ref('')
const currentProjectName = ref('')

const router = useRouter()

const workspaceStore = useWorkspaceStore()

function handleProjectClick(projectId: string) {
  router.push('/request')
}

function showDeleteDialog(projectId: string, projectName: string) {
  currentProjectName.value = projectName
  workspaceStore.deleteProjectId = projectId
  workspaceStore.dialogVisible.deleteProject = true
}

function deleteProject() {
  if (deleteProjectName.value === currentProjectName.value) {
    workspaceStore.handleDeleteCollection()
  } else {
    deleteProjectName.value = ''
    workspaceStore.dialogVisible.deleteProject = false
    displayNotification('项目名不匹配', 'error')
  }
}
</script>
