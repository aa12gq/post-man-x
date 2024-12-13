<template>
  <div class="app-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="app-title">RPC Postman</span>

        <!-- 工作空间切换 -->
        <el-dropdown trigger="click" @command="handleWorkspaceChange">
          <div class="workspace-selector">
            <span class="workspace-name">{{ currentWorkspace }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="workspace in workspaces"
                :key="workspace.id"
                :command="workspace.id"
              >
                <el-icon><FolderOpened /></el-icon>
                {{ workspace.name }}
              </el-dropdown-item>
              <el-dropdown-item divided command="create">
                <el-icon><Plus /></el-icon>
                Create Workspace
              </el-dropdown-item>
              <el-dropdown-item command="manage">
                <el-icon><Management /></el-icon>
                Manage Workspaces
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 添加工具栏图标按钮 -->
        <div class="toolbar-icons">
          <el-tooltip content="收藏夹" placement="bottom">
            <el-button text @click="showFavoritesDialog = true">
              <el-icon><Star /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="历史记录" placement="bottom">
            <el-button text @click="showHistoryDialog = true">
              <el-icon><Clock /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="环境" placement="bottom">
            <el-button text @click="showEnvironmentDialog = true">
              <el-icon><Setting /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>
      <div class="toolbar-right">
        <!-- 设置下拉菜单 -->
        <el-dropdown trigger="click" @command="handleSettingCommand">
          <el-button text>
            <el-icon :size="18"><Setting /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="preferences">
                <el-icon><Tools /></el-icon>
                Preferences
              </el-dropdown-item>
              <el-dropdown-item command="keyboard">
                <el-icon><Position /></el-icon>
                Keyboard Shortcuts
              </el-dropdown-item>
              <el-dropdown-item command="appearance">
                <el-icon><Brush /></el-icon>
                Appearance
              </el-dropdown-item>
              <el-dropdown-item divided command="about">
                <el-icon><InfoFilled /></el-icon>
                About
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- 主题切换 -->
        <el-switch
          v-model="isDarkMode"
          inline-prompt
          :active-icon="Moon"
          :inactive-icon="Sunny"
          @change="toggleTheme"
        />

        <!-- 用户头像 -->
        <el-dropdown trigger="click" @command="handleUserCommand">
          <div class="user-avatar">
            <el-avatar :size="32" :src="userAvatar" @error="handleAvatarError">
              <el-icon><User /></el-icon>
            </el-avatar>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><UserFilled /></el-icon>
                Profile
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                Settings
              </el-dropdown-item>
              <el-dropdown-item divided command="login" v-if="!isLoggedIn">
                <el-icon><Key /></el-icon>
                Sign In
              </el-dropdown-item>
              <el-dropdown-item command="logout" v-else>
                <el-icon><SwitchButton /></el-icon>
                Sign Out
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content-wrapper">
      <RequestPanel :current-workspace="currentWorkspace" />
    </div>

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
import { ref, onMounted } from "vue";
import {
  Moon,
  Sunny,
  Star,
  Clock,
  Setting,
  User,
  UserFilled,
  Key,
  SwitchButton,
  Tools,
  Position,
  Brush,
  InfoFilled,
  ArrowDown,
  FolderOpened,
  Plus,
  Management,
} from "@element-plus/icons-vue";
import RequestPanel from "./components/RequestPanel.vue";
import FavoriteManager from "./components/FavoriteManager.vue";
import RequestHistory from "./components/history/RequestHistory.vue";
import EnvironmentManager from "./components/EnvironmentManager.vue";
import { useRequestHistory } from "./composables/useRequestHistory";

const isDarkMode = ref(localStorage.getItem("theme") === "dark");
const showFavoritesDialog = ref(false);
const showHistoryDialog = ref(false);
const showEnvironmentDialog = ref(false);

const {
  historyItems: requestHistory,
  removeHistoryItem,
  clearHistory,
} = useRequestHistory();

// 用户相关状态
const isLoggedIn = ref(false);
const userAvatar = ref("");

const toggleTheme = (value: boolean) => {
  const theme = value ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};
onMounted(() => {
  const savedTheme = localStorage.getItem("theme") || "light";
  isDarkMode.value = savedTheme === "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
});

// 处理收藏夹加载
const handleFavoriteLoad = (favorite: any) => {
  // 处理加载收藏项的逻辑
  showFavoritesDialog.value = false;
};

// 处理历史记录加载
const handleHistoryLoad = (item: any) => {
  // 处理加载历史记录的逻辑
  showHistoryDialog.value = false;
};

const handleViewDetails = (item: any) => {
  // 处理查看详情的逻辑
};

const handleRemoveHistoryItem = (item: any) => {
  removeHistoryItem(item);
};

const handleClearHistory = () => {
  clearHistory();
};

// 处理头像加载错误
const handleAvatarError = () => {
  // 使用默认头像或显示用户图标
};

// 处理用户菜单命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case "profile":
      // 处理查看个人信息
      break;
    case "settings":
      // 处理设置
      break;
    case "login":
      // 处理登录
      break;
    case "logout":
      // 处理退出登录
      break;
  }
};

// 处理设置菜单命令
const handleSettingCommand = (command: string) => {
  switch (command) {
    case "preferences":
      // 处理偏好设置
      break;
    case "keyboard":
      // 处理快捷键设置
      break;
    case "appearance":
      // 处理外观设置
      break;
    case "about":
      // 处理关于信息
      break;
  }
};

// 工作空间相关状态
interface Workspace {
  id: string;
  name: string;
  description?: string;
}

const workspaces = ref<Workspace[]>([
  { id: "default", name: "Default Workspace" },
  { id: "team", name: "Team Workspace" },
]);
const currentWorkspace = ref("Default Workspace");
const showCreateWorkspaceDialog = ref(false);
const newWorkspace = ref({
  name: "",
  description: "",
});

// 处理工作空间切换
const handleWorkspaceChange = (command: string) => {
  if (command === "create") {
    showCreateWorkspaceDialog.value = true;
  } else if (command === "manage") {
    // 处理管理工作空间
  } else {
    // 切换工作空间
    const workspace = workspaces.value.find((w) => w.id === command);
    if (workspace) {
      currentWorkspace.value = workspace.name;
    }
  }
};

// 创建工作空间
const createWorkspace = () => {
  if (!newWorkspace.value.name) return;

  const workspace: Workspace = {
    id: Date.now().toString(),
    name: newWorkspace.value.name,
    description: newWorkspace.value.description,
  };

  workspaces.value.push(workspace);
  showCreateWorkspaceDialog.value = false;
  newWorkspace.value = { name: "", description: "" };
};
</script>

<style>
html {
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-color);
  color: var(--text-color);
}

:root {
  /* 亮色主题变量 */
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #dcdfe6;
  --hover-color: #f5f7fa;
  --header-bg: #f5f7fa;
  --code-bg: #f8f9fa;
  --shadow-color: rgba(0, 0, 0, 0.1);
}

:root[data-theme="dark"] {
  /* 暗色主题变量 */
  --bg-color: #1e1e1e;
  --text-color: #e0e0e0;
  --border-color: #333333;
  --hover-color: #2c2c2c;
  --header-bg: #252525;
  --code-bg: #1e1e1e;
  --shadow-color: rgba(0, 0, 0, 0.3);
}

.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.toolbar {
  height: 48px;
  min-height: 48px;
  padding: 0 16px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-title {
  margin-right: 8px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 48px);
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: var(--bg-color);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(144, 147, 153, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(144, 147, 153, 0.5);
}

/* 确保所有元素的盒模型一致 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:deep(.main-layout) {
  height: 100%;
  position: relative;
}

.toolbar-icons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.toolbar-icons .el-button {
  font-size: 18px;
  padding: 8px;
  color: var(--text-color);
}

.toolbar-icons .el-button:hover {
  color: var(--el-color-primary);
}

/* 弹窗样式 */
:deep(.el-dialog) {
  --el-dialog-bg-color: var(--bg-color);
  --el-dialog-border-color: var(--border-color);
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border-color);
  margin-right: 0;
  padding-bottom: 16px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

.user-avatar {
  cursor: pointer;
  transition: opacity 0.2s;
}

.user-avatar:hover {
  opacity: 0.8;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 4px;
  font-size: 16px;
}

:deep(.el-avatar) {
  background-color: var(--el-color-primary);
  color: #fff;
}

:deep(.el-dropdown-menu) {
  --el-dropdown-menuItem-hover-fill: var(--hover-color);
  --el-dropdown-menu-box-shadow: 0 2px 12px 0 var(--shadow-color);
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}

:deep(.el-dropdown-menu__item) {
  color: var(--text-color);
}

:deep(.el-dropdown-menu__item:not(.is-disabled):hover) {
  background-color: var(--hover-color);
}

:deep(.el-dropdown-menu__item.is-disabled) {
  color: var(--el-text-color-disabled);
}

.toolbar-right .el-button {
  font-size: 18px;
  padding: 8px;
  color: var(--text-color);
}

.toolbar-right .el-button:hover {
  color: var(--el-color-primary);
}

/* 确保下拉菜单图标对齐 */
:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 8px;
  font-size: 16px;
  width: 16px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.workspace-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.workspace-selector:hover {
  background-color: var(--hover-color);
}

.workspace-name {
  font-size: 14px;
  color: var(--text-color);
}
</style>
