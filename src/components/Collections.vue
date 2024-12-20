<template>
  <div v-if="workspaceStore.collectionList.length > 0">
    <el-tree :data="treeData" :props="defaultProps">
      <template #default="{ node, data }">
        <div class="flex items-center flex-1 justify-between size-3 pr-2 text-[12px] group">
          <div class="flex flex-grow items-center" @click="handleNodeClick(data)">
            <el-icon class="mr-1"><Files /></el-icon>
            <span class="flex-grow">{{ data.name }}</span>
          </div>

          <div class="flex opacity-0 group-hover:opacity-100">
            <el-icon class="mr-2" @click.stop="addRequest(data)"><Plus /></el-icon>
            <el-popover placement="bottom-start" :width="200" trigger="hover">
              <template #reference>
                <el-icon @click.stop><MoreFilled /></el-icon>
              </template>
              <div class="flex flex-col space-y-1">
                <span
                  v-for="(item, index) in menuItems"
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { MoreFilled, Plus, Files } from '@element-plus/icons-vue'
import { useWorkspaceStore } from '../stores/workspace'
import { ElMessage } from 'element-plus'

const workspaceStore = useWorkspaceStore()

const treeData = computed(() => {
  return workspaceStore.collectionList
})

const defaultProps = {
  children: 'children',
  label: 'name',
}

// 定义菜单项数组，每个项都有一个事件
const menuItems = [
  { name: '添加接口', event: () => console.log('添加接口 clicked') },
  { name: '重命名', event: () => console.log('重命名 clicked') },
  { name: '复制', event: () => console.log('复制 clicked') },
  { name: '导出', event: () => console.log('导出 clicked') },
  { name: '添加子目录', event: (data: any) => setFolderId(data) },
  { name: '删除', event: () => console.log('删除 clicked') },
]

const formRef = ref(null)

const addRequest = (data: any) => {
  console.log('add request', data)
}

const handleNodeClick = (data: any) => {
  console.log('node clicked', data)
}
const setFolderId = (data: any) => {
  workspaceStore.dialogVisible.addFolder = true
  workspaceStore.selectedCollectionInfo.id = data.id
  workspaceStore.selectedCollectionInfo.collection_id = data.collection_id
  workspaceStore.selectedCollectionInfo.folder_id = data.folder_id || ''
}

const AddFolder = () => {
  workspaceStore.handleAddFolder()
}
</script>
