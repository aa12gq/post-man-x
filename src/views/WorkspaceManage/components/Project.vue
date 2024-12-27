<template>
  <div class="p-4 flex items-center justify-end w-full space-x-2">
    <!-- 搜索和添加按钮水平排列 -->
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
    <el-button type="primary">
      <template #icon>
        <el-icon><Plus /></el-icon>
      </template>
      新建项目
    </el-button>
  </div>

  <!-- 项目列表卡片展示 -->
  <div class="p-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    <div
      @click="handleProjectClick(project.id)"
      v-for="project in projects"
      :key="project.id"
      class="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-md p-4 flex flex-col justify-between h-44 cursor-pointer"
    >
      <div class="flex items-center mb-2">
        <div class="flex items-center justify-between gap-2 w-full">
          <div class="flex items-center gap-2">
            <h4 class="font-semibold">{{ project.name }}</h4>
            <p
              class="text-[10px] text-gray-500 bg-orange-200 w-[40px] h-[15px] flex items-center justify-center rounded-md p-1"
            >
              {{ project.type }}
            </p>
          </div>
          <el-dropdown>
            <el-icon><MoreFilled /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showDeleteDialog(project.id)">删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <p class="text-sm text-gray-600 mb-2">{{ project.description }}</p>
      <div class="text-xs text-gray-400">
        <p>所有者: {{ project.owner }}</p>
        <p>成员数: {{ project.memberCount }}</p>
        <p>创建日期: {{ project.creationDate }}</p>
      </div>
    </div>
  </div>

  <el-dialog
    title="确认删除"
    v-model="isDeleteDialogVisible"
    width="30%"
    @close="handleDialogClose"
  >
    <span>您确定要删除这个项目吗？</span>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isDeleteDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDelete">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { Plus, Search, MoreFilled } from '@element-plus/icons-vue'
import { displayNotification } from '../../../utils/message'
const search = ref('')
const projectToDelete = ref<number | null>(null)
const router = useRouter()
function handleDialogClose() {
  isDeleteDialogVisible.value = false
  projectToDelete.value = null
}
const isDeleteDialogVisible = ref(false)
const handleDelete = () => {
  isDeleteDialogVisible.value = false
  displayNotification('删除成功', 'success')
}

function handleProjectClick(projectId: number) {
  console.log('点击了项目', projectId)
  router.push("/request")
}

// 示例项目数据
const projects = ref([
  {
    id: 1,
    name: '集成测试项目',
    type: 'HTTP',
    description: '此项目涉及多个模块的集成与测试，旨在确保系统的整体功能。',
    creationDate: '2023-01-01',
    owner: '张三',
    memberCount: 5,
  },
  {
    id: 2,
    name: '跨平台通信项目',
    type: 'gRPC',
    description: '该项目主要用于实现跨平台通信，提升系统的互操作性。',
    creationDate: '2023-02-01',
    owner: '李四',
    memberCount: 8,
  },
  {
    id: 3,
    name: '前端优化项目',
    type: 'HTTP',
    description: '专注于前端性能优化，提升用户体验和页面加载速度。',
    creationDate: '2023-03-01',
    owner: '王五',
    memberCount: 10,
  },
  {
    id: 4,
    name: '大数据处理项目',
    type: 'gRPC',
    description: '涉及大数据处理，旨在提高数据分析和处理能力。',
    creationDate: '2023-04-01',
    owner: '赵六',
    memberCount: 12,
  },
  {
    id: 5,
    name: '用户体验提升项目',
    type: 'HTTP',
    description: '重点在于提升用户体验，优化界面设计和交互流程。',
    creationDate: '2023-05-01',
    owner: '孙七',
    memberCount: 15,
  },
  {
    id: 6,
    name: '实时传输项目',
    type: 'gRPC',
    description: '提供实时数据传输服务，确保数据的及时性和准确性。',
    creationDate: '2023-06-01',
    owner: '周八',
    memberCount: 20,
  },
  {
    id: 7,
    name: '安全增强项目',
    type: 'HTTP',
    description: '涉及到安全性增强，保护系统免受潜在威胁。',
    creationDate: '2023-07-01',
    owner: '吴九',
    memberCount: 25,
  },
  {
    id: 8,
    name: '高并发处理项目',
    type: 'gRPC',
    description: '专注于高并发处理，提升系统的响应能力和稳定性。',
    creationDate: '2023-08-01',
    owner: '郑十',
    memberCount: 30,
  },
  {
    id: 9,
    name: '移动端优化项目',
    type: 'HTTP',
    description: '主要用于移动端优化，提升移动设备上的用户体验。',
    creationDate: '2023-09-01',
    owner: '冯十一',
    memberCount: 35,
  },
  {
    id: 10,
    name: '人工智能应用项目',
    type: 'gRPC',
    description: '涉及到人工智能应用，探索AI技术在实际场景中的应用。',
    creationDate: '2023-10-01',
    owner: '陈十二',
    memberCount: 40,
  },
])

function showDeleteDialog(projectId: number) {
  projectToDelete.value = projectId
  isDeleteDialogVisible.value = true
}
</script>
