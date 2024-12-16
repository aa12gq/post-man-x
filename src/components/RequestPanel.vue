<template>
  <div
    class="request-panel"
    :class="{
      [`layout-${layoutStore.settings.currentLayout}`]: true,
      'sidebar-collapsed': layoutStore.settings.isCollapsed,
      [`toolbar-${layoutStore.settings.toolbarPosition}`]: true,
      [`tabs-${layoutStore.settings.tabsPosition}`]: true,
      'hide-sidebar': !layoutStore.settings.showSidebar,
      'hide-toolbar': !layoutStore.settings.showToolbar,
      'hide-tabs': !layoutStore.settings.showTabs,
      'compact-mode': layoutStore.settings.compactMode,
      'show-borders': layoutStore.settings.showBorders,
      'show-shadows': layoutStore.settings.showShadows,
    }"
  >
    <!-- 主要内容区域 -->
    <div class="content-layout">
      <!-- 左侧区域 -->
      <div
        v-if="layoutStore.settings.showSidebar"
        class="left-section"
        :class="{
          'is-collapsed': layoutStore.settings.isCollapsed,
          'is-collapsible': layoutStore.settings.isCollapsible,
          'position-right': layoutStore.settings.sidebarPosition === 'right',
        }"
        :style="{
          width: layoutStore.settings.isCollapsed
            ? '48px'
            : `${layoutStore.settings.sidebarWidth}px`,
        }"
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
                layoutStore.settings.isCollapsed ||
                activeView !== 'collections',
              'is-hidden': activeView !== 'collections',
            }"
          >
            <!-- 动条和折叠按钮 -->
            <div class="sidebar-controls">
              <div
                class="sidebar-resizer"
                @mousedown="startSidebarResize"
              ></div>
              <div class="sidebar-toggle" @click="toggleSidebar">
                <el-icon
                  :class="{ 'is-collapsed': layoutStore.settings.isCollapsed }"
                >
                  <CaretLeft />
                </el-icon>
              </div>
            </div>

            <!-- 内容区域 -->
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
              'is-collapsed':
                layoutStore.settings.isCollapsed || activeView !== 'apis',
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

      <!-- 右侧主内容 -->
      <div
        class="main-content"
        :class="{
          'tabs-left': layoutStore.settings.tabsPosition === 'left',
          'tabs-bottom': layoutStore.settings.tabsPosition === 'bottom',
          'no-sidebar': !layoutStore.settings.showSidebar,
        }"
      >
        <!-- 标签页管理器 -->
        <TabManager
          v-model="activeTab"
          :tabs="tabs"
          :unsaved-tabs="unsavedTabsSet"
          :position="layoutStore.settings.tabsPosition"
          @add="addTab"
          @remove="removeTab"
        />

        <!-- 请求和响应区域包装器 -->
        <div
          class="request-response-wrapper"
          :class="{
            'toolbar-bottom': layoutStore.settings.toolbarPosition === 'bottom',
          }"
        >
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
import { useLayoutStore } from "../stores/layout";

const layoutStore = useLayoutStore();

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
  if (layoutStore.settings.isCollapsible) {
    layoutStore.toggleSidebar();
  }
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

  // 检查是否未保存的更改
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
      // 如果只有个标签页,清空���活标签页
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

  // 除签页后，清理相关状态
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

//  toggleView 函数
const toggleView = (view: string) => {
  if (activeView.value === view) {
    // 如果点击当前活动的视图，切换边栏的展开/收起状态
    layoutStore.toggleSidebar();
  } else {
    // 如果切换到新的视图，展开边栏并更新活动视图
    if (layoutStore.settings.isCollapsed) {
      layoutStore.updateSettings({ isCollapsed: false });
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
  // 保存当前视图到本地存储
  localStorage.setItem("activeView", activeView.value || "");
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

  // 更改宽度值
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
    // 如宽度度阈值，清除计时器
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
  const startWidth = layoutStore.settings.sidebarWidth;

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    const newWidth = startWidth + deltaX;

    // 使用 layoutStore 中的最小和最大宽度限制
    const minWidth = layoutStore.settings.minSidebarWidth;
    const maxWidth = layoutStore.settings.maxSidebarWidth;

    // 当宽度接近收起阈值时添加视觉提示
    const leftSection = document.querySelector(".left-section") as HTMLElement;
    if (newWidth < minWidth + 50) {
      leftSection?.classList.add("near-collapse");
    } else {
      leftSection?.classList.remove("near-collapse");
    }

    // 如果宽度小于最小宽度且允许折叠，则自动折叠
    if (newWidth < minWidth && layoutStore.settings.isCollapsible) {
      leftSection?.classList.remove("near-collapse");
      layoutStore.updateSettings({ isCollapsed: true });
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      return;
    }

    // 限制宽度在最小和最大值之间
    const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    layoutStore.updateSettings({ sidebarWidth: clampedWidth });
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
    console.error("Error creating folder:", error); // 加误日志
    if (error !== "cancel") {
      ElMessage.error("Failed to create folder");
    }
  }
};

// 处理在文件夹中创建新请求
const handleCreateRequest = (folderId: string) => {
  showRequestTypeDialog.value = true;
  // 存储当前选的文件夹ID，用于新建请求时设置文件夹
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

// 处理保存状态变化
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
/* 基础布局样式 */
.request-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--background);
  border: 1px solid var(--border);
}

/* 经典布局 */
.layout-classic {
  .content-layout {
    display: flex;
  }

  .left-section {
    border-right: 1px solid var(--border);
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

/* 现代布局 */
.layout-modern {
  .content-layout {
    display: flex;
  }

  .left-section {
    border-right: 1px solid var(--border);
  }

  .main-content {
    flex: 1;
    display: flex;

    &.tabs-left {
      flex-direction: row;

      .tab-manager {
        width: 200px;
        border-right: 1px solid var(--border);
      }

      .request-response-wrapper {
        flex: 1;
      }
    }
  }
}

/* 紧凑布局 */
.layout-compact {
  .content-layout {
    display: flex;
  }

  .left-section {
    width: 180px;
  }

  .main-content {
    flex: 1;
  }

  .toolbar-bottom {
    flex-direction: column-reverse;
  }
}

/* 简约布局 */
.layout-minimal {
  .left-section {
    display: none;
  }

  .main-content {
    flex: 1;
  }
}

/* 标签页位置样式 */
.tabs-left {
  flex-direction: row;

  .tab-manager {
    width: 200px;
    border-right: 1px solid var(--border);
  }
}

.tabs-bottom {
  flex-direction: column-reverse;
}

/* 工具栏位样式 */
.toolbar-bottom {
  .request-toolbar {
    order: 1;
  }
}

/* 响应式布局 */
@media (max-width: 768px) {
  .left-section:not(.is-collapsed) {
    position: absolute;
    z-index: 100;
    height: 100%;
    background-color: var(--background);
    box-shadow: var(--shadow);
  }

  .layout-modern .tabs-left {
    flex-direction: column;

    .tab-manager {
      width: 100%;
      height: auto;
    }
  }
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--background);
}

/* 主要内容区域布局 */
.content-layout {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* 左侧区域样式 */
.left-section {
  display: flex;
  flex-direction: column;
  min-width: 48px; /* 最小宽度改为活栏宽度 */
  border-right: 1px solid var(--border);
  background-color: var(--background);
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
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
}

.new-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text);
  font-size: 13px;

  &:hover {
    background-color: var(--background-light);
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
  background-color: var(--header);
  border-right: 1px solid var(--border);
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
  color: var(--text);
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
  background-color: var(--background);
  border-right: 1px solid var(--border);
  transition: none;
  overflow: hidden;
  flex-shrink: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sidebar-controls {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background-color: var(--header);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

/* 当边栏折叠时样式 */
.collections-sidebar.is-collapsed {
  width: 0;
  padding: 0;
  margin: 0;
  border-right: none;
  overflow: hidden;
}

.collections-sidebar.is-hidden {
  display: none;
}

/* 拖动条样式 */
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

/* 折叠按钮样式 */
.sidebar-toggle {
  position: absolute;
  right: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle .el-icon {
  transition: transform 0.3s;
}

.sidebar-toggle .el-icon.is-collapsed {
  transform: rotate(180deg);
}

/* 右侧内容区域 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.tabs-container {
  flex-shrink: 0;
  border-bottom: 1px solid var(--border);
  background-color: var(--background);
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
  background-color: var(--background);
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
  background-color: var(--background);
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
  background-color: var(--background);
  border-color: var(--border);
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  background-color: var(--header);
  border-bottom: 1px solid var(--border);
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
  background-color: var(--background);
  border-right-color: var(--border);
  border-left-color: var(--border);
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
  background-color: var(--background);
  border-top: 1px solid var(--border);
  transition: none;
  position: relative;
  z-index: 1;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 分线样式 */
.resizer {
  height: 4px;
  background-color: var(--border);
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
  border-bottom: 1px solid var(--border);
  background-color: var(--header);
}

.sidebar-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
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
  color: var(--text);
  font-size: 16px;
}

:deep(.el-tabs--border-card) {
  background-color: var(--background);
  border-color: var(--border);
}

:deep(.el-tabs--border-card > .el-tabs__header) {
  background-color: var(--header);
  border-bottom: 1px solid var(--border);
}

:deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
  background-color: var(--background);
  border-right-color: var(--border);
  border-left-color: var(--border);
}

:deep(.el-tree) {
  background-color: var(--background);
  color: var(--text);
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
  background-color: var(--border);
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
  background-color: var(--background);
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
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
  border-right: 1px solid var(--border);
  height: 40px;
  line-height: 40px;
  font-size: 13px;
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  background-color: var(--background);
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
  background-color: var(--border);
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
  background-color: var(--background);
  border: 1px solid var(--border);

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
  background-color: var(--background);
  padding: 20px;
}

:deep(.el-empty) {
  padding: 40px;
}

/* 添加新样式 */
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
  background-color: var(--border);
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

/* 调整活动栏样式确保 Home 图标位置正确 */
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
  background-color: var(--header);
}

.activity-item:first-child:hover {
  background-color: var(--hover-color);
}

.request-panel {
  background-color: var(--background);
  border: 1px solid var(--border);
}

.panel-header {
  background-color: var(--header);
  color: var(--text);
  border-bottom: 1px solid var(--border);
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

.left-section.is-collapsible .sidebar-resizer {
  display: block;
}

.left-section:not(.is-collapsible) .sidebar-resizer {
  display: none;
}

.left-section.near-collapse {
  background-color: var(--el-color-danger-light-9);
}

/* 折叠按钮样式 */
.sidebar-toggle {
  display: none;
  position: absolute;
  right: -24px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background-color: var(--background);
  border: 1px solid var(--border);
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  z-index: 99;
}

.left-section.is-collapsible .sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle .el-icon {
  transition: transform 0.3s;
}

.sidebar-toggle .el-icon.is-collapsed {
  transform: rotate(180deg);
}

/* 隐藏侧边栏时的样式 */
.hide-sidebar .left-section {
  display: none;
}

.hide-sidebar .main-content {
  margin-left: 0;
}

/* 侧边栏位置样式 */
.left-section.position-right {
  order: 2;
  border-right: none;
  border-left: 1px solid var(--border);
}

/* 主内容区域在没有侧边栏时的样式 */
.main-content.no-sidebar {
  margin-left: 0;
  margin-right: 0;
}

/* 隐藏工具栏和标签页时的样式 */
.hide-toolbar .toolbar {
  display: none;
}

.hide-tabs .tab-manager {
  display: none;
}

/* 紧凑模式样式 */
.compact-mode {
  --header-height: 40px;
  --toolbar-height: 36px;
  --tabs-height: 32px;
}

/* 显示边框样式 */
.show-borders {
  border: 1px solid var(--border);
}

/* 显示阴影样式 */
.show-shadows {
  box-shadow: var(--shadow-base);
}

.show-shadows .left-section {
  box-shadow: 2px 0 4px var(--shadow-color);
}

.show-shadows .main-content {
  box-shadow: 0 2px 4px var(--shadow-color);
}
</style>
