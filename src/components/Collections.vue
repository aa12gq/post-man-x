<template>
  <div v-if="workspaceStore.collectionList.length > 0">
    <el-tree :data="treeData" :props="defaultProps">
      <template #default="{ node, data }">
        <div class="flex items-center flex-1 justify-between text-xs pr-2 group">
          <div class="flex flex-grow items-center" @click="handleNodeClick(data)">
            <el-icon class="mr-1" v-if="data.kind !== 'request'"><Files /></el-icon>
            <el-icon class="mr-1" v-else><Connection /></el-icon>
            <span class="flex-grow">{{ data.name }}</span>
          </div>

          <div class="flex opacity-0 group-hover:opacity-100">
            <el-icon v-if="data.kind !== 'request'" class="mr-2" @click.stop="addRequest(data)"
              ><Plus
            /></el-icon>
            <el-popover placement="bottom-start" :width="200" trigger="hover">
              <template #reference>
                <el-icon @click.stop><MoreFilled /></el-icon>
              </template>
              <div class="flex flex-col space-y-1">
                <span
                  v-if="data.kind !== 'request'"
                  v-for="(item, index) in folderMenuItems"
                  :key="index"
                  class="hover:text-blue-500 hover:bg-gray-100 cursor-pointer p-2 rounded-md"
                  @click="item.event(data)"
                >
                  {{ item.name }}
                </span>
                <span
                  v-if="data.kind === 'request'"
                  v-for="(item, index) in requestMenuItems"
                  :key="index"
                  class="hover:text-blue-500 hover:bg-gray-100 cursor-pointer p-2 rounded-md"
                  @click="item.event(data)"
                >
                  {{ item.name }}
                </span>
              </div>
            </el-popover>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
  <!-- 添加目录 -->
  <el-dialog title="添加子目录" v-model="workspaceStore.dialogVisible.addFolder" width="30%">
    <el-form :model="{ folderName: workspaceStore.selectedCollectionInfo.name }" ref="formRef">
      <el-form-item label="文件夹名称" label-position="top" prop="folderName">
        <el-input
          v-model="workspaceStore.selectedCollectionInfo.name"
          placeholder="请输入文件夹名称"
        ></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="flex justify-end">
      <el-button @click="workspaceStore.dialogVisible.addFolder = false">取消</el-button>
      <el-button type="primary" @click="AddFolder()">确定</el-button>
    </span>
  </el-dialog>

  <!-- 添加接口 -->
  <el-dialog title="接口类型" v-model="workspaceStore.dialogVisible.addRequest" width="40%">
    <div class="flex flex-col items-center">
      <el-card
        class="w-[70%] h-16 cursor-pointer hover:bg-gray-100 m-1"
        v-for="(requestType, index) in requestTypes"
        :key="index"
      >
        <div
          @click="addRequest(requestType.type)"
          class="text-center gap-2 flex justify-center items-center"
        >
          <el-icon><Connection /></el-icon>
          <span class="mt-2">{{ requestType.name }}</span>
        </div>
      </el-card>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { Connection, Files, MoreFilled, Plus } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'

const workspaceStore = useWorkspaceStore()

const formRef = ref(null)
const treeData = computed(() => {
  return workspaceStore.collectionList
})

const defaultProps = {
  children: 'children',
  label: 'name',
}

const folderMenuItems = [
  { name: '添加接口', event: (data: any) => setRequestInfo(data) },
  { name: '重命名', event: () => console.log('重命名 clicked') },
  { name: '复制', event: () => console.log('复制 clicked') },
  { name: '导出', event: () => console.log('导出 clicked') },
  { name: '添加子目录', event: (data: any) => setFolderInfo(data) },
  { name: '删除', event: () => console.log('删除 clicked') },
]

const requestMenuItems = [
  { name: '重命名', event: () => console.log('重命名 clicked') },
  { name: '复制', event: () => console.log('复制 clicked') },
  { name: '删除', event: () => console.log('删除 clicked') },
]

const addRequest = (data: any) => {
  console.log(data)
  workspaceStore.selectedCollectionInfo.type = 'HTTP'
  workspaceStore.selectedCollectionInfo.collection_id = data.collection_id
  workspaceStore.selectedCollectionInfo.folder_id = data.folder_id || ''
  workspaceStore.handleCreateRequest()
}

const handleNodeClick = (data: any) => {
  console.log('node clicked', data)
}
const setFolderInfo = (data: any) => {
  workspaceStore.dialogVisible.addFolder = true
  workspaceStore.selectedCollectionInfo.id = data.id
  workspaceStore.selectedCollectionInfo.collection_id = data.collection_id
  workspaceStore.selectedCollectionInfo.folder_id = data.folder_id || ''
}

const setRequestInfo = (data: any) => {
  workspaceStore.dialogVisible.addRequest = true
  workspaceStore.selectedCollectionInfo.id = data.id
  workspaceStore.selectedCollectionInfo.collection_id = data.collection_id
  workspaceStore.selectedCollectionInfo.folder_id = data.folder_id || ''
}

const AddFolder = () => {
  workspaceStore.handleAddFolder()
}

const requestTypes = [
  { name: 'HTTP', iconClass: 'http-icon', type: 'HTTP' },
  { name: 'WebSocket', iconClass: 'websocket-icon', type: 'WebSocket' },
  { name: 'gRPC', iconClass: 'grpc-icon', type: 'gRPC' },
]
</script>
