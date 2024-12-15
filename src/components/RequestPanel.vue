<template>
  <div class="main-layout">
    <!-- 主要内容区域 -->
    <div class="content-layout">
      <!-- 左侧区域 -->
      <div
        class="left-section"
        :class="{ 'is-collapsed': isSidebarCollapsed }"
        :style="{ width: isSidebarCollapsed ? '48px' : `${sidebarWidth}px` }"
      >
        <!-- New 按钮区域 -->
        <div class="new-area">
          <div class="new-button" @click="showNewRequestDialog">
            <el-icon><Plus /></el-icon>
            <span>New</span>
          </div>
        </div>

        <!-- 活动栏和边栏容器 -->
        <div class="sidebar-container">
          <!-- 活动栏 -->
          <div class="activity-bar">
            <div
              class="activity-item"
              :class="{ active: activeView === 'collections' }"
              @click="toggleView('collections')"
            >
              <el-tooltip content="Collections" placement="right">
                <el-icon><Collection /></el-icon>
              </el-tooltip>
            </div>
            <div
              class="activity-item"
              :class="{ active: activeView === 'apis' }"
              @click="toggleView('apis')"
            >
              <el-tooltip content="APIs" placement="right">
                <el-icon><Connection /></el-icon>
              </el-tooltip>
            </div>

            <!-- 历史记录视图 -->
            <div
              class="activity-item"
              :class="{ active: activeView === 'history' }"
              @click="toggleView('history')"
            >
              <el-tooltip content="History" placement="right">
                <el-icon><Timer /></el-icon>
              </el-tooltip>
            </div>

            <!-- 环境变量管理 -->
            <div
              class="activity-item"
              :class="{ active: activeView === 'environments' }"
              @click="toggleView('environments')"
            >
              <el-tooltip content="Environments" placement="right">
                <el-icon><Monitor /></el-icon>
              </el-tooltip>
            </div>

            <div class="activity-divider"></div>

            <!-- 导入导出功能 -->
            <div
              class="activity-item"
              :class="{ active: activeView === 'import-export' }"
              @click="toggleView('import-export')"
            >
              <el-tooltip content="Import/Export" placement="right">
                <el-icon><Upload /></el-icon>
              </el-tooltip>
            </div>

            <!-- 全局设置 -->
            <div
              class="activity-item"
              :class="{ active: activeView === 'settings' }"
              @click="toggleView('settings')"
            >
              <el-tooltip content="Settings" placement="right">
                <el-icon><Tools /></el-icon>
              </el-tooltip>
            </div>
          </div>

          <!-- Collections 边栏 -->
          <div
            class="collections-sidebar"
            :class="{
              'is-collapsed':
                isSidebarCollapsed || activeView !== 'collections',
              'is-hidden': activeView !== 'collections',
            }"
          >
            <!-- 拖动条 -->
            <div class="sidebar-resizer" @mousedown="startSidebarResize"></div>

            <!-- 折叠按钮 -->
            <div class="sidebar-toggle" @click="toggleSidebar">
              <el-icon :class="{ 'is-collapsed': isSidebarCollapsed }">
                <CaretLeft />
              </el-icon>
            </div>

            <div class="sidebar-header">
              <span class="sidebar-title">Collections</span>
              <div class="header-actions">
                <el-tooltip content="New Folder" placement="top">
                  <el-button link size="small" @click="handleAddFolder">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            <div class="sidebar-content">
              <FolderManager
                @create-request="handleCreateRequest"
                @open-request="handleOpenRequest"
                @delete-request="handleDeleteRequest"
              />
            </div>
          </div>

          <!-- APIs 边栏 -->
          <div
            class="collections-sidebar"
            :class="{
              'is-collapsed': isSidebarCollapsed || activeView !== 'apis',
              'is-hidden': activeView !== 'apis',
            }"
          >
            <!-- APIs 内容 -->
            <div class="sidebar-header">
              <span class="sidebar-title">APIs</span>
            </div>
            <div class="sidebar-content">
              <!-- APIs 相关内容 -->
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧主内容区 -->
      <div class="main-content">
        <!-- 标签页管理器 -->
        <TabManager
          v-model="activeTab"
          :tabs="tabs"
          :unsaved-tabs="unsavedTabsSet"
          @add="addTab"
          @remove="removeTab"
        />

        <!-- 请求和响应区域包装器 -->
        <div class="request-response-wrapper">
          <template v-if="tabs.length === 0">
            <!-- 空状态提示 -->
            <div class="empty-state">
              <el-empty description="No request yet">
                <el-button type="primary" @click="showNewRequestDialog">
                  Create New Request
                </el-button>
              </el-empty>
            </div>
          </template>
          <template v-else-if="currentTab && currentTab.type === 'rpc'">
            <div class="request-workspace">
              <keep-alive>
                <RpcRequestRegion
                  :key="currentTab.id"
                  :tab-id="currentTab.id"
                  :request-type="currentTab.type"
                  @update:unsaved="
                    (value) =>
                      currentTab?.id &&
                      handleUnsavedChange(currentTab.id, value)
                  "
                  @save="saveRequest"
                  @name-change="handleNameChange"
                />
              </keep-alive>
            </div>
          </template>
          <template v-else-if="currentTab && currentTab.type === 'http'">
          </template>
        </div>
      </div>

      <!-- 请求类型选择话框 -->
      <el-dialog
        v-model="showRequestTypeDialog"
        title="New Request"
        width="300px"
        :show-close="false"
        custom-class="request-type-dialog"
      >
        <div class="request-type-options">
          <div class="request-type-option" @click="createNewRequest('http')">
            <el-icon><Document /></el-icon>
            <span>HTTP Request</span>
          </div>
          <div class="request-type-option" @click="createNewRequest('rpc')">
            <el-icon><Connection /></el-icon>
            <span>gRPC Request</span>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  computed,
  onBeforeUnmount,
  watch,
  onMounted,
  nextTick,
} from "vue";
import {
  CaretLeft,
  Collection,
  Connection,
  Plus,
  Document,
  Timer,
  Monitor,
  Upload,
  Tools,
} from "@element-plus/icons-vue";
import TabManager from "./tabs/TabManager.vue";
import { ElMessageBox, ElMessage } from "element-plus";
import RpcRequestRegion from "../components/rpc/RequestRegion.vue";
import FolderManager from "./FolderManager.vue";
import { useRequestHistory } from "../composables/useRequestHistory";
import { storage } from "../services/storage";
import { HistoryItem } from "../types";

// 基础状态
const isSidebarCollapsed = ref(
  localStorage.getItem("sidebarCollapsed") === "true"
);
const sidebarWidth = ref(Number(localStorage.getItem("sidebarWidth")) || 300); // 如果没有存储值则使用默认的300
// 标签页相关状态
interface Tab {
  id: string;
  name: string;
  title: string;
  type: "http" | "rpc"; // 添加类型字段
}

const tabs = ref<Tab[]>([]); // 移除默认签页
const activeTab = ref("");

// 获取当前动的标签页
const currentTab = computed(() => {
  return tabs.value.find((tab) => tab.id === activeTab.value);
});

// 方法定义
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  if (!isSidebarCollapsed.value) {
    // 开时恢复之前的宽度或默认宽度
    sidebarWidth.value = Number(localStorage.getItem("sidebarWidth")) || 248;
  }
  localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.value.toString());
};

const addTab = () => {
  const newId = String(tabs.value.length + 1);
  tabs.value.push({
    id: newId,
    name: "New Request",
    title: "New Request",
    type: "http",
  });
  activeTab.value = newId;
};

// 用于跟踪标签页是否有未保存的更改
const hasUnsavedChanges = ref(new Map<string, boolean>());

const removeTab = async (targetId: string) => {
  const tab = tabs.value.find((tab) => tab.id === targetId);
  if (!tab) return;

  // 检查是否有未保存的更改
  if (hasUnsavedChanges.value.get(targetId)) {
    try {
      await ElMessageBox.confirm(
        "You have unsaved changes. Do you want to save before closing?",
        "Unsaved Changes",
        {
          confirmButtonText: "Save & Close",
          cancelButtonText: "Discard & Close",
          type: "warning",
          distinguishCancelAndClose: true,
          showClose: true,
        }
      );
      // 用户选择保存
      // TODO: 实现保存逻辑
      console.log("Save changes");
    } catch (action) {
      if (action === "close") {
        // 用户点 X 按钮,不关闭标签页
        return;
      }
      // 用户选择放弃更改,继续关闭
    }
  }

  // 移除标签页
  const targetIndex = tabs.value.findIndex((tab) => tab.id === targetId);
  if (targetIndex === -1) return;

  // 如果关闭的是当前标签页,需要激活其他标签页
  if (activeTab.value === targetId) {
    if (tabs.value.length === 1) {
      // 如果只有个标签页,清空激活标签页
      activeTab.value = "";
    } else if (targetIndex === tabs.value.length - 1) {
      // 如果闭的是最后一个标签页,激活前一个标签页
      activeTab.value = tabs.value[targetIndex - 1].id;
    } else {
      // 否则激活下一个标签页
      activeTab.value = tabs.value[targetIndex + 1].id;
    }
  }

  // 移除标签页
  tabs.value.splice(targetIndex, 1);
  // 清理未保存状态
  hasUnsavedChanges.value.delete(targetId);

  // 除标签页后，清理相关状态
  localStorage.removeItem(`request-state-${targetId}`);
  hasUnsavedChanges.value.delete(targetId);
};

// 添加全局样式
onMounted(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    body.is-resizing {
      cursor: row-resize !important;
      user-select: none !important;
    }
  `;
  document.head.appendChild(style);

  // 添加键盘事件监听
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  const style = document.querySelector("style");
  if (style && style.innerHTML.includes("is-resizing")) {
    style.remove();
  }

  // 移除键盘事件监听
  window.removeEventListener("keydown", handleKeyDown);
});

// 活动视图态
const activeView = ref<
  | "collections"
  | "apis"
  | "history"
  | "environments"
  | "import-export"
  | "settings"
  | null
>((localStorage.getItem("activeView") as any) || null);

// 切换视图
const toggleView = (view: string) => {
  if (activeView.value === view) {
    // 如果点击当前活动的视图，切换边栏的展开/收起状态
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  } else {
    // 如切换到新的视图保存栏展开
    if (isSidebarCollapsed.value) {
      isSidebarCollapsed.value = false;
      // 恢复之前保存的宽度或默认宽度
      sidebarWidth.value = Number(localStorage.getItem("sidebarWidth")) || 348;
    }
    activeView.value = view as
      | "collections"
      | "apis"
      | "history"
      | "environments"
      | "import-export"
      | "settings"
      | null;
  }
  localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.value.toString());
};

const minWidth = 200; // 最小宽度
const maxWidth = 600; // 最大宽度
let startX = 0;
let startWidth = 0;

const COLLAPSE_THRESHOLD = 100; // 将收起阈值改为 100px
let collapseTimer: number | null = null; // 跟踪持续拖拽时间

const handleSidebarResize = (e: MouseEvent) => {
  const deltaX = e.clientX - startX;
  const newWidth = startWidth + deltaX;

  // 更新宽度值
  sidebarWidth.value = Math.min(Math.max(newWidth, minWidth), maxWidth);

  // 如果宽度小于阈值，启动计时器
  if (newWidth < COLLAPSE_THRESHOLD) {
    if (!collapseTimer) {
      collapseTimer = window.setTimeout(() => {
        // 持续在阈值以下超过500ms才收起
        isSidebarCollapsed.value = true;
        document.removeEventListener("mousemove", handleSidebarResize);
        document.removeEventListener("mouseup", stopSidebarResize);
        document.body.style.cursor = "";
      }, 500);
    }
  } else {
    // 如宽度度于阈值，清除计时器
    if (collapseTimer) {
      clearTimeout(collapseTimer);
      collapseTimer = null;
    }
    if (isSidebarCollapsed.value) {
      // 如果宽度大于阈值且当前是收起状态，则展开
      isSidebarCollapsed.value = false;
    }
  }
};

const startSidebarResize = (e: MouseEvent) => {
  e.preventDefault();
  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    const newWidth = startWidth + deltaX;

    // 当宽度接近收起阈值时添加视觉提示
    const leftSection = document.querySelector(".left-section") as HTMLElement;
    if (newWidth < 150) {
      leftSection?.classList.add("near-collapse");
    } else {
      leftSection?.classList.remove("near-collapse");
    }

    // 如果宽度小于 100px 自动收起边栏
    if (newWidth < 100) {
      leftSection?.classList.remove("near-collapse");
      isSidebarCollapsed.value = true;
      localStorage.setItem("sidebarCollapsed", "true");
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      return;
    }

    // 只限制最大宽度，移除最小宽度限制
    sidebarWidth.value = Math.min(800, newWidth);
    localStorage.setItem("sidebarWidth", String(sidebarWidth.value));
  };

  const handleMouseUp = () => {
    const leftSection = document.querySelector(".left-section");
    leftSection?.classList.remove("near-collapse");
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  document.body.style.cursor = "col-resize";
};

const stopSidebarResize = () => {
  document.removeEventListener("mousemove", handleSidebarResize);
  document.removeEventListener("mouseup", stopSidebarResize);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";

  // 清除计时器
  if (collapseTimer) {
    clearTimeout(collapseTimer);
    collapseTimer = null;
  }
};

// 添加新的响应式变量
const showRequestTypeDialog = ref(false);

// 添加新的方法
const showNewRequestDialog = () => {
  showRequestTypeDialog.value = true;
};

const createNewRequest = (type: "http" | "rpc") => {
  const newId = String(Date.now());
  const newRequest: HistoryItem = {
    id: newId,
    type: type,
    url: "",
    method: type === "http" ? "GET" : "",
    name: `New ${type.toUpperCase()} Request`,
    timestamp: Date.now(),
    response: {
      status: 0,
      data: null,
      headers: {},
    },
    requestMessage: "",
    debugInfo: "",
    debugCommand: "",
    folderId: selectedFolderId.value || undefined,
  };

  // 果有选中文件夹，设置请求的文件夹ID
  if (selectedFolderId.value) {
    storage.saveRequestFolder(newId, selectedFolderId.value);
    selectedFolderId.value = null;
  }

  // 添加到历史记录
  addHistoryItem(newRequest);

  // 添加到标签页
  tabs.value.push({
    id: newId,
    name: newRequest.name,
    title: newRequest.name,
    type: type,
  });

  activeTab.value = newId;
  showRequestTypeDialog.value = false;
  hasUnsavedChanges.value.set(newId, false);

  // 自动触发刷新
  nextTick(async () => {
    try {
      await loadHistory();
      console.log("Auto-refreshed after creating new request");
    } catch (error) {
      console.error("Failed to auto-refresh:", error);
    }
  });
};

const { history, addFolder, addHistoryItem, loadHistory } = useRequestHistory();

// 监听历史记录变化，更新标签页名称
watch(
  history,
  (newHistory) => {
    // 遍历所有标签页
    tabs.value.forEach((tab) => {
      // 在历史记录中查找对应的请求
      const historyItem = newHistory.find((item) => item.id === tab.id);
      // 如果找到且名称不同，则更新标签页名称
      if (historyItem && historyItem.name !== tab.name) {
        tab.name = historyItem.name;
        tab.title = historyItem.name;
        // 强制更新视图
        tabs.value = [...tabs.value];
      }
    });
  },
  { deep: true }
);
const handleAddFolder = async () => {
  try {
    const { value: folderName } = await ElMessageBox.prompt(
      "Enter folder name",
      "New Folder",
      {
        confirmButtonText: "Create",
        cancelButtonText: "Cancel",
        inputValidator: (value) => {
          if (!value) {
            return "Folder name cannot be empty";
          }
          return true;
        },
      }
    );

    if (folderName) {
      const folder = addFolder(folderName.trim());
      console.log("Folder created:", folder); // 添加志
      ElMessage.success(`Folder "${folderName}" created successfully`);
    }
  } catch (error) {
    console.error("Error creating folder:", error); // 加错误日志
    if (error !== "cancel") {
      ElMessage.error("Failed to create folder");
    }
  }
};

// 处理在文件夹中创建新请求
const handleCreateRequest = (folderId: string) => {
  showRequestTypeDialog.value = true;
  // 存储当前选中的文件夹ID，用于新建请求时设置所文件夹
  selectedFolderId.value = folderId;
};

// 添加新的响应式变量
const selectedFolderId = ref<string | null>(null);

// 处理打开请求
const handleOpenRequest = (request: any) => {
  // 检查标签页是否已经存在
  const existingTab = tabs.value.find((tab) => tab.id === request.id);
  if (existingTab) {
    // 如果标签页已存在，更新名称并激活它
    existingTab.name = request.name || request.url;
    existingTab.title = request.name || request.url;
    activeTab.value = request.id;
  } else {
    // 如果标签页不在，创建新标签页
    tabs.value.push({
      id: request.id,
      name: request.name || request.url,
      title: request.name || request.url,
      type: request.type,
    });
    activeTab.value = request.id;
  }
};

// 将 Map 转换为 Set 以便于模板使用
const unsavedTabsSet = ref(new Set<string>());

// 标记未保存的方法
const markTabAsUnsaved = (tabId: string) => {
  console.log("Marking tab as unsaved:", tabId);
  hasUnsavedChanges.value.set(tabId, true);
  unsavedTabsSet.value.add(tabId);
  console.log(
    "Current unsaved changes map:",
    Array.from(hasUnsavedChanges.value.entries())
  );
};

// 标记已保存的方法
const markTabAsSaved = (tabId: string) => {
  console.log("Marking tab as saved:", tabId);
  hasUnsavedChanges.value.set(tabId, false);
  unsavedTabsSet.value.delete(tabId);
};

// 监听 hasUnsavedChanges 变化
watch(
  hasUnsavedChanges,
  () => {
    // 更新 unsavedTabsSet
    unsavedTabsSet.value.clear();
    hasUnsavedChanges.value.forEach((value, key) => {
      if (value) {
        unsavedTabsSet.value.add(key);
      }
    });
  },
  { deep: true }
);

// 处理未保存状态变化
const handleUnsavedChange = (tabId: string, isUnsaved: boolean) => {
  console.log("Handling unsaved change:", tabId, isUnsaved);
  if (isUnsaved) {
    markTabAsUnsaved(tabId);
  } else {
    markTabAsSaved(tabId);
  }
};

// 添加保存请求的方法
const saveRequest = () => {
  if (currentTab.value) {
    // 保存当前请求的逻辑
    markTabAsSaved(currentTab.value.id);
    ElMessage.success("Request saved");
  }
};

// 添加键盘快捷键监听
const handleKeyDown = (e: KeyboardEvent) => {
  // 检查否按下 Ctrl/Command + S
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault(); // 阻止浏览器默认保存行为
    saveRequest();
  }
};

// 处理请求删除
const handleDeleteRequest = (requestId: string) => {
  // 关闭对应的标签页
  removeTab(requestId);
};

// 处理名称变更
const handleNameChange = ({ id, name }: { id: string; name: string }) => {
  // 更新标签页名称
  const tab = tabs.value.find((tab) => tab.id === id);
  if (tab) {
    tab.name = name;
    tab.title = name;
    // 强制更新视图
    tabs.value = [...tabs.value];
  }

  // 更新历史记录中的名称
  const historyItem = history.value.find((item) => item.id === id);
  if (historyItem) {
    historyItem.name = name;
    // 强制更新历史记录视图
    history.value = [...history.value];
  }
};
</script>
<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-color);
}

/* 主要内容区域布局 */
.content-layout {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
}

/* 左侧区域样式 */
.left-section {
  display: flex;
  flex-direction: column;
  min-width: 48px; /* 最小宽度改为活栏宽度 */
  border-right: 1px solid var(--border-color);
  background-color: var(--bg-color);
  flex-shrink: 0;
  transition: width 0.3s;
  transition: background-color 0.2s;
}

.left-section.is-collapsed {
  width: 48px !important;

  /* 当折叠时隐藏 New 按钮区域和边栏 */
  .new-area,
  .collections-sidebar {
    display: none;
  }

  .activity-bar {
    border-right: none;
  }
}

.left-section.near-collapse {
  background-color: var(--el-color-danger-light-9);
}

/* New 按钮区域样式 */
.new-area {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

.new-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-color);
  font-size: 13px;

  &:hover {
    background-color: var(--hover-color);
  }

  .el-icon {
    font-size: 16px;
  }
}

/* 活动栏和边栏容器 */
.sidebar-container {
  flex: 1;
  display: flex;
  width: 100%;
  overflow: hidden;
  position: relative;
}

/* 活动栏样式 */
.activity-bar {
  width: 48px;
  height: 100%;
  background-color: var(--header-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.activity-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-color);
  position: relative;
}

.activity-item:hover {
  color: var(--el-color-primary);
}

.activity-item.active {
  color: var(--el-color-primary);
}

.activity-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 25%;
  height: 50%;
  width: 2px;
  background-color: var(--el-color-primary);
}

.activity-item :deep(.el-icon) {
  font-size: 20px;
}

/* Collections 边栏样式 */
.collections-sidebar {
  position: relative;
  background-color: var(--bg-color);
  border-right: 1px solid var(--border-color);
  transition: none;
  overflow: hidden;
  flex-shrink: 0;
  flex: 1;
}

/* 当边栏折叠时样式 */
.collections-sidebar.is-collapsed {
  width: 0;
  padding: 0;
  margin: 0;
  border-right: none;
}

.collections-sidebar.is-hidden {
  display: none;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 调整折叠按钮位置 */
.sidebar-toggle {
  right: -24px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  width: 24px;
  height: 48px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-left: none;
  border-radius: 0 4px 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-color);
}

/* 右侧内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tabs-container {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
}

.request-response-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.request-workspace {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: var(--bg-color);
}

.request-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.request-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background-color: var(--bg-color);
}

.request-form.expanded {
  flex: 1;
}

.request-response-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  overflow: hidden;
}

:deep(.el-tabs) {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 10px;
  height: 100%;
}

:deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 确保 tab-content 也能正确扩展 */
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-tabs--border-card) {
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
  background-color: var(--bg-color);
  border-right-color: var(--border-color);
  border-left-color: var(--border-color);
}

.request-response-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 响应域器 */
.response-container {
  display: flex;
  flex-direction: column;
  min-height: 40px;
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
  transition: none;
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 分割线样式 */
.resizer {
  height: 4px;
  background-color: var(--border-color);
  cursor: row-resize;
  transition: background-color 0.2s;
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  z-index: 2;

  &::after {
    content: "";
    position: absolute;
    top: -4px;
    bottom: -4px;
    left: 0;
    right: 0;
  }
}

.resizer:hover {
  background-color: var(--el-color-primary);
}

/* 响应查看器样式 */
:deep(.response-viewer) {
  flex: 1;
  overflow: hidden;
  margin-top: 4px;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg);
}

.sidebar-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.sidebar-content {
  padding: 8px;
  height: calc(100% - 41px); /* 41px is header height */
  overflow: auto;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

:deep(.el-tree-node__content) {
  height: 32px;
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--hover-color);
}

:deep(.el-icon) {
  color: var(--text-color);
  font-size: 16px;
}

:deep(.el-tabs--border-card) {
  background-color: var(--bg-color);
  border-color: var(--border-color);
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
  background-color: var(--bg-color);
  border-right-color: var(--border-color);
  border-left-color: var(--border-color);
}

:deep(.el-tree) {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.sidebar-resizer {
  position: absolute;
  top: 0;
  right: -3px;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 100;
  background-color: transparent;
  transition: background-color 0.2s;
}

.sidebar-resizer:hover,
.sidebar-resizer:active {
  background-color: var(--el-color-primary);
}

.resize-handle {
  position: absolute;
  left: 0;
  right: 0;
  height: 6px;
  background: transparent;
  cursor: row-resize;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translateY(-3px);
  bottom: 0;
  margin-bottom: 0;
}

.resize-handle:hover .resize-handle-line {
  background-color: var(--el-color-primary);
}

.resize-handle-line {
  width: 100%;
  height: 2px;
  background-color: var(--border-color);
  transition: background-color 0.2s;
}

.resize-handle-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--bg-color);
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  opacity: 0;
  transition: opacity 0.2s;
}

.resize-handle:hover .resize-handle-icon {
  opacity: 1;
}

/* 动时的样式 */
.is-resizing {
  user-select: none;
  cursor: row-resize;
}

.is-resizing .resize-handle-line {
  background-color: var(--el-color-primary);
}

.is-resizing .resize-handle-icon {
  opacity: 1;
}

/* TabManager 组样式调整 */
:deep(.el-tabs--card) {
  margin: 0;
}

:deep(.el-tabs--card > .el-tabs__header) {
  margin: 0;
  border-bottom: none;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__nav) {
  border: none;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  border: none;
  border-right: 1px solid var(--border-color);
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  background-color: var(--bg-color);
  border-bottom: 2px solid var(--el-color-primary);
}

/* 添加新的样式 */
.new-request {
  margin-bottom: 8px;
  color: var(--el-color-primary);
}

.activity-divider {
  height: 1px;
  margin: 8px 0;
  background-color: var(--border-color);
}

.request-type-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.request-type-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.request-type-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);

  &:hover {
    background-color: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }

  .el-icon {
    font-size: 20px;
  }

  span {
    font-size: 14px;
    font-weight: 500;
  }
}

/* 添加空状态样式 */
.empty-state {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-color);
  padding: 20px;
}

:deep(.el-empty) {
  padding: 40px;
}

/* 添加新的样式 */
.header-actions {
  display: flex;
  gap: 8px;
}

.collections-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-content {
  flex: 1;
  overflow: auto;
}

.sidebar-resizer {
  transition: background-color 0.2s;
}

.near-collapse .sidebar-resizer {
  background-color: var(--el-color-danger);
}

.activity-divider {
  width: 32px;
  height: 1px;
  margin: 8px auto;
  background-color: var(--border-color);
}

/* 底部图靠下对齐 */
.activity-bar {
  display: flex;
  flex-direction: column;
}

.activity-bar > :last-child {
  margin-top: auto;
  margin-bottom: 16px;
}

/* 调整活动栏样式，确保 Home 图标位置正确 */
.activity-bar {
  display: flex;
  flex-direction: column;
  padding-top: 0; /* 移除顶部padding */
}

.activity-item:first-child {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--header-bg);
}

.activity-item:first-child:hover {
  background-color: var(--hover-color);
}
</style>
