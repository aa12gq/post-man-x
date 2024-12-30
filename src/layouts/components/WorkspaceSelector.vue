<template>
  <el-dropdown placement="bottom-start" trigger="click" @command="handleWorkspaceChange">
    <div
      class="workspace-selector flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all duration-200 ease-in-out text-secondary hover:bg-surface-2 hover:text"
    >
      <span class="workspace-name text-sm font-medium"
        >{{ currentWorkspaceName }} / {{ currentProjectName }}</span
      >
      <el-icon class="text-sm transition-transform duration-200 ease-in-out hover:translate-y-0.5"
        ><ArrowDown
      /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu class="w-[400px] h-[400px] bg-surface-1">
        <!-- title -->
        <div class="px-4 py-2 flex justify-between items-center">
          <h3 class="text-md font-semibold">团队/项目</h3>
          <!-- 管理中心 -->
          <div class="flex items-center gap-1 cursor-pointer" @click="goManage">
            <i class="iconfont icon-APIfuwu"></i>
            管理中心
          </div>
        </div>
        <!-- 搜索 -->
        <div class="px-4 py-2">
          <el-input v-model="search" placeholder="搜索团队/项目" @click.stop>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- 折叠面板展示团队/项目 -->
        <el-collapse class="w-full max-h-[300px] overflow-y-auto scrollbar-hide">
          <el-collapse-item class="px-4" name="1" @click.stop>
            <template #title>
              <div class="flex items-center text-[12px] gap-2">
                <i class="iconfont icon-gongzuokongjian2"></i>
                yug科技
              </div>
            </template>
            <div
              class="px-2 py-1 rounded-md flex justify-start items-center gap-1 hover:bg-gray-100 mb-2"
            >
              <i class="iconfont icon-xiangmuguanli"></i>
              rpc-master
            </div>
            <div
              class="px-2 py-1 rounded-md flex justify-start items-center gap-1 hover:bg-gray-100 mb-2"
            >
              <i class="iconfont icon-xiangmuguanli"></i>
              yug-api
            </div>
            <!-- 其他项目项 -->
          </el-collapse-item>

          <el-collapse-item class="px-4" name="2" @click.stop>
            <template #title>
              <div class="flex items-center text-[12px] gap-2">
                <i class="iconfont icon-gongzuokongjian2"></i>
                个人空间
              </div>
            </template>
            <div
              class="px-2 py-1 rounded-md flex justify-start items-center gap-1 hover:bg-gray-100 mb-2"
            >
              <i class="iconfont icon-xiangmuguanli"></i>
              rpc-master
            </div>
            <div
              class="px-2 py-1 rounded-md flex justify-start items-center gap-1 hover:bg-gray-100 mb-2"
            >
              <i class="iconfont icon-xiangmuguanli"></i>
              yug-api
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { ArrowDown, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useWorkspaceStore } from '../../stores/workspace'

const workspaceStore = useWorkspaceStore()
const router = useRouter()
// interface Workspace {
//   id: string
//   name: string
//   description?: string
// }

const goManage = () => {
  router.push('/workspace-manage')
}

const search = ref('')

const handleWorkspaceChange = (command: string) => {
  console.log(command)
}

const currentWorkspaceName = ref('')
const currentProjectName = ref('')

// 监听路由，更新当前workspace和project
watch(
  () => router.currentRoute.value,
  () => {
    if (router.currentRoute.value.path === '/request') {
      currentProjectName.value = workspaceStore.currentProjectInfo.name
      const workspaceId = workspaceStore.currentProjectInfo.workspace_id
      const workspace = workspaceStore.workspaceList.find(w => w.id == workspaceId)
      console.log(workspace)
      if (workspace) {
        currentWorkspaceName.value = workspace.name
      }
    }
  },
  { immediate: true },
)

// const workspaceStore = useWorkspaceStore()

// const handleWorkspaceChange = (command: string) => {
// 	if (command === "create") {
// 		// 触发创建工作空间事件
// 		router.push("/workspace-setup");
// 	} else if (command === "manage") {
// 		// 触发管理工作空间事件
// 	} else {
// 		const workspace = workspaceStore.workspaceList.find(
// 			(w) => w.id === command
// 		);
// 		if (workspace) {
// 			workspaceStore.currentWorkspaceInfo.id = workspace.id;
// 			workspaceStore.currentWorkspaceInfo.name = workspace.name;
// 		}
// 	}
// };
</script>
