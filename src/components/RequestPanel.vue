<template>
  <div
    class="request-panel"
    :class="{
      [`layout-${settings.currentLayout}`]: true,
      'sidebar-collapsed': settings.isCollapsed,
      [`toolbar-${settings.toolbarPosition}`]: true,
      [`tabs-${settings.tabsPosition}`]: true,
      'hide-sidebar': !settings.showSidebar,
      'hide-toolbar': !settings.showToolbar,
      'hide-tabs': !settings.showTabs,
      'compact-mode': settings.compactMode,
      'show-borders': settings.showBorders,
      'show-shadows': settings.showShadows,
    }"
  >
    <div class="content-layout">
      <template v-if="settings.sidebarPosition === 'left'">
        <!-- 左侧区域 -->
        <div
          v-if="settings.showSidebar"
          class="left-section"
          :class="{
            'is-collapsed': settings.isCollapsed,
            'is-collapsible': settings.isCollapsible,
          }"
          :style="{
            width: settings.isCollapsed ? '48px' : `${settings.sidebarWidth}px`,
          }"
        >
          <!-- New 按钮区域 -->
          <div class="new-area">
            <div class="new-button" @click="showNewRequestDialog">
              <el-icon><Plus /></el-icon>
              <span>{{
                t("request.panel.sidebar.collections.newRequest")
              }}</span>
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
                <el-tooltip
                  :content="t('request.panel.sidebar.collections.title')"
                  placement="right"
                >
                  <el-icon><Collection /></el-icon>
                </el-tooltip>
              </div>
              <div
                class="activity-item"
                :class="{ active: activeView === 'apis' }"
                @click="toggleView('apis')"
              >
                <el-tooltip
                  :content="t('request.panel.sidebar.apis')"
                  placement="right"
                >
                  <el-icon><Connection /></el-icon>
                </el-tooltip>
              </div>

              <!-- 历史记录视图 -->
              <div
                class="activity-item"
                :class="{ active: activeView === 'history' }"
                @click="toggleView('history')"
              >
                <el-tooltip
                  :content="t('request.panel.sidebar.history')"
                  placement="right"
                >
                  <el-icon><Timer /></el-icon>
                </el-tooltip>
              </div>

              <!-- 环境变量管理 -->
              <div
                class="activity-item"
                :class="{ active: activeView === 'environments' }"
                @click="toggleView('environments')"
              >
                <el-tooltip
                  :content="t('request.panel.sidebar.environments')"
                  placement="right"
                >
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
                <el-tooltip
                  :content="t('request.panel.sidebar.importExport')"
                  placement="right"
                >
                  <el-icon><Upload /></el-icon>
                </el-tooltip>
              </div>

              <!-- 全局设置 -->
              <div
                class="activity-item"
                :class="{ active: activeView === 'settings' }"
                @click="toggleView('settings')"
              >
                <el-tooltip
                  :content="t('request.panel.sidebar.settings')"
                  placement="right"
                >
                  <el-icon><Tools /></el-icon>
                </el-tooltip>
              </div>
            </div>

            <!-- Collections 边栏 -->
            <div
              class="collections-sidebar"
              :class="{
                'is-collapsed':
                  settings.isCollapsed || activeView !== 'collections',
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
                  <el-icon :class="{ 'is-collapsed': settings.isCollapsed }">
                    <CaretLeft />
                  </el-icon>
                </div>
              </div>

              <!-- 内容区域 -->
              <div class="sidebar-header">
                <span class="sidebar-title">{{
                  t("request.panel.sidebar.collections.title")
                }}</span>
                <div class="header-actions">
                  <el-tooltip
                    :content="t('request.panel.sidebar.collections.newFolder')"
                    placement="top"
                  >
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
          </div>
        </div>

        <!-- 右侧主内容 -->
        <div class="main-content">
          <!-- 标签页管理器 -->
          <TabManager
            v-model="activeTab"
            :tabs="tabs"
            :unsaved-tabs="unsavedTabsSet"
            :position="settings.tabsPosition"
            @add="addTab"
            @remove="removeTab"
          />

          <!-- 请求和响应区域包装器 -->
          <div class="request-response-wrapper">
            <template v-if="tabs.length === 0">
              <!-- 空状态提示 -->
              <div class="empty-state">
                <el-empty>
                  <template #description>
                    <h3>{{ t("request.panel.emptyState.title") }}</h3>
                    <p>{{ t("request.panel.emptyState.description") }}</p>
                  </template>
                  <template #default>
                    <el-button type="primary" @click="createNewRequest">
                      {{ t("request.panel.emptyState.createNew") }}
                    </el-button>
                  </template>
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
      </template>

      <template v-else>
        <div class="main-content">
          <!-- 标签页管理器 -->
          <TabManager
            v-model="activeTab"
            :tabs="tabs"
            :unsaved-tabs="unsavedTabsSet"
            :position="settings.tabsPosition"
            @add="addTab"
            @remove="removeTab"
          />

          <!-- 请求和响应区域包装器 -->
          <div class="request-response-wrapper">
            <template v-if="tabs.length === 0">
              <!-- 空状态提示 -->
              <div class="empty-state">
                <el-empty>
                  <template #description>
                    <h3>{{ t("request.panel.emptyState.title") }}</h3>
                    <p>{{ t("request.panel.emptyState.description") }}</p>
                  </template>
                  <template #default>
                    <el-button type="primary" @click="createNewRequest">
                      {{ t("request.panel.emptyState.createNew") }}
                    </el-button>
                  </template>
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

        <!-- 右侧区域 -->
        <div
          v-if="settings.showSidebar"
          class="left-section position-right"
          :class="{
            'is-collapsed': settings.isCollapsed,
            'is-collapsible': settings.isCollapsible,
          }"
          :style="{
            width: settings.isCollapsed ? '48px' : `${settings.sidebarWidth}px`,
          }"
        >
          <!-- New 按钮区域 -->
          <div class="new-area">
            <div class="new-button" @click="showNewRequestDialog">
              <el-icon><Plus /></el-icon>
              <span>{{
                t("request.panel.sidebar.collections.newRequest")
              }}</span>
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
                <el-tooltip
                  :content="t('request.panel.sidebar.collections.title')"
                  placement="right"
                >
                  <el-icon><Collection /></el-icon>
                </el-tooltip>
              </div>
              <div
                class="activity-item"
                :class="{ active: activeView === 'apis' }"
                @click="toggleView('apis')"
              >
                <el-tooltip
                  :content="t('request.panel.sidebar.apis')"
                  placement="right"
                >
                  <el-icon><Connection /></el-icon>
                </el-tooltip>
              </div>

              <!-- 历史记录视图 -->
              <div
                class="activity-item"
                :class="{ active: activeView === 'history' }"
                @click="toggleView('history')"
              >
                <el-tooltip
                  :content="t('request.panel.sidebar.history')"
                  placement="right"
                >
                  <el-icon><Timer /></el-icon>
                </el-tooltip>
              </div>

              <!-- 环境变量管理 -->
              <div
                class="activity-item"
                :class="{ active: activeView === 'environments' }"
                @click="toggleView('environments')"
              >
                <el-tooltip
                  :content="t('request.panel.sidebar.environments')"
                  placement="right"
                >
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
                <el-tooltip
                  :content="t('request.panel.sidebar.importExport')"
                  placement="right"
                >
                  <el-icon><Upload /></el-icon>
                </el-tooltip>
              </div>

              <!-- 全局设置 -->
              <div
                class="activity-item"
                :class="{ active: activeView === 'settings' }"
                @click="toggleView('settings')"
              >
                <el-tooltip
                  :content="t('request.panel.sidebar.settings')"
                  placement="right"
                >
                  <el-icon><Tools /></el-icon>
                </el-tooltip>
              </div>
            </div>

            <!-- Collections 边栏 -->
            <div
              class="collections-sidebar"
              :class="{
                'is-collapsed':
                  settings.isCollapsed || activeView !== 'collections',
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
                  <el-icon :class="{ 'is-collapsed': settings.isCollapsed }">
                    <CaretLeft />
                  </el-icon>
                </div>
              </div>

              <!-- 内容区域 -->
              <div class="sidebar-header">
                <span class="sidebar-title">{{
                  t("request.panel.sidebar.collections.title")
                }}</span>
                <div class="header-actions">
                  <el-tooltip
                    :content="t('request.panel.sidebar.collections.newFolder')"
                    placement="top"
                  >
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
          </div>
        </div>
      </template>
    </div>

    <!-- 请类型选择对话框 -->
    <el-dialog
      v-model="showRequestTypeDialog"
      :title="t('request.panel.requestType.title')"
      width="500px"
    >
      <div class="request-type-options">
        <div class="request-type-option" @click="selectRequestType('grpc')">
          <el-icon><Connection /></el-icon>
          <div class="option-content">
            <h4>{{ t("request.panel.requestType.grpc.title") }}</h4>
            <p>{{ t("request.panel.requestType.grpc.description") }}</p>
          </div>
        </div>
        <div class="request-type-option" @click="selectRequestType('http')">
          <el-icon><Link /></el-icon>
          <div class="option-content">
            <h4>{{ t("request.panel.requestType.http.title") }}</h4>
            <p>{{ t("request.panel.requestType.http.description") }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
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
  Timer,
  Monitor,
  Upload,
  Tools,
  Link,
} from "@element-plus/icons-vue";
import TabManager from "./tabs/TabManager.vue";
import { ElMessageBox, ElMessage } from "element-plus";
import RpcRequestRegion from "../components/rpc/RequestRegion.vue";
import FolderManager from "./FolderManager.vue";
import { useRequestHistory } from "../composables/useRequestHistory";
import { storage } from "../services/storage";
import { HistoryItem } from "../types";
import { useLayoutStore } from "../stores/layout";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const layoutStore = useLayoutStore();
const { settings } = storeToRefs(layoutStore);

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
  if (settings.value.isCollapsible) {
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

  // 检查否未保存的更改
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
      // TODO: 实现存逻辑
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
      // 如果只有���标签页,清空活标签页
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

  // 除签页，清理相关状态
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
    // 如果点击当前活跃的视图，切换边栏的展开/折叠状态
    layoutStore.toggleSidebar();
  } else {
    // 如果切换到新的视图，展开边栏并新活动视图
    if (settings.value.isCollapsed) {
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

const minWidth = 200; // 最小度
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
    // 如宽度度值，清除计时器
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
  const startWidth = settings.value.sidebarWidth;

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX;
    const newWidth = startWidth + deltaX;

    // 使用 settings 中的最小和最大宽度限制
    const minWidth = settings.value.minSidebarWidth;
    const maxWidth = settings.value.maxSidebarWidth;

    // 当宽度接近收起阈值时添加视觉提示
    const leftSection = document.querySelector(".left-section") as HTMLElement;
    if (newWidth < minWidth + 50) {
      leftSection?.classList.add("near-collapse");
    } else {
      leftSection?.classList.remove("near-collapse");
    }

    // 如果宽度小于最小宽度且允许折叠，则自折叠
    if (newWidth < minWidth && settings.value.isCollapsible) {
      leftSection?.classList.remove("near-collapse");
      layoutStore.updateSettings({ isCollapsed: true });
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      return;
    }

    // 限制宽度在小和最大值之间
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

const showNewRequestDialog = () => {
  showRequestTypeDialog.value = true;
};

const createNewRequest = () => {
  showRequestTypeDialog.value = true;
};

const selectRequestType = (type: "http" | "grpc") => {
  const newId = String(Date.now());
  const newRequest: HistoryItem = {
    id: newId,
    type: type === "grpc" ? "rpc" : "http", // 保持类型一致
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

  // 如果有选中文件夹，设置请求文件夹ID
  if (selectedFolderId.value) {
    storage.saveRequestFolder(newId, selectedFolderId.value);
    selectedFolderId.value = null;
  }

  // 添加到历史记录
  addHistoryItem(newRequest);

  // 添加到标签页
  const newTab = {
    id: newId,
    name: `New ${type.toUpperCase()} Request`,
    title: `New ${type.toUpperCase()} Request`,
    type: type === "grpc" ? "rpc" : "http",
  };

  tabs.value.push(newTab as Tab);
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
      t("request.panel.sidebar.collections.newFolder"),
      t("request.panel.sidebar.collections.addFolder"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        inputValidator: (value) => {
          if (!value) {
            return t("common.validation.required");
          }
          return true;
        },
      }
    );

    if (folderName) {
      const folder = addFolder(folderName.trim());
      console.log("Folder created:", folder);
      ElMessage.success(t("common.success"));
    }
  } catch (error) {
    console.error("Error creating folder:", error);
    if (error !== "cancel") {
      ElMessage.error(t("common.error"));
    }
  }
};

// 处理在件夹中创建新请
const handleCreateRequest = (folderId: string) => {
  showRequestTypeDialog.value = true;
  // 存储当前选的文件夹ID，用于新建请求时设置文件夹
  selectedFolderId.value = folderId;
};

// 添加新的响应式变量
const selectedFolderId = ref<string | null>(null);

// 处理打开请求
const handleOpenRequest = (request: any) => {
  const existingTab = tabs.value.find((tab) => tab.id === request.id);
  if (existingTab) {
    existingTab.name = request.name || request.url;
    existingTab.title = request.name || request.url;
    activeTab.value = request.id;
  } else {
    tabs.value.push({
      id: request.id,
      name: request.name || request.url,
      title: request.name || request.url,
      type: request.type, // 直接使用请求的类型，因为历史记录中已经是正确的 'rpc' 或 'http' 类型
    });
    activeTab.value = request.id;
  }
};

// 将 Map 转为 Set 以便于模板使用
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

// 处理保存状态化
const handleUnsavedChange = (tabId: string, isUnsaved: boolean) => {
  console.log("Handling unsaved change:", tabId, isUnsaved);
  if (isUnsaved) {
    markTabAsUnsaved(tabId);
  } else {
    markTabAsSaved(tabId);
  }
};

// 添加存请求的方法
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
  // 关对应的标签页
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

// 监听布局变化
watch(
  () => settings.value,
  (newSettings) => {
    // 保存到本地存储
    localStorage.setItem("layoutSettings", JSON.stringify(newSettings));

    // 应用布相关的 CSS 变量
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${newSettings.sidebarWidth}px`
    );
    document.documentElement.style.setProperty(
      "--header-height",
      newSettings.compactMode ? "40px" : "48px"
    );
    document.documentElement.style.setProperty(
      "--toolbar-height",
      newSettings.compactMode ? "36px" : "40px"
    );
  },
  { deep: true }
);
</script>
<style scoped>
/* 原有的基础样式 */
.request-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--surface-2);
}

.content-layout {
  flex: 1;
  display: flex;
  min-height: 0;
  overflow: hidden;
  position: relative;
  background-color: transparent;
}

/* 左侧区域样式 */
.left-section {
  display: flex;
  flex-direction: column;
  min-width: 48px;
  background-color: var(--surface-3);
  flex-shrink: 0;
  transition: all 0.3s;
}

/* 左侧边栏样式 */
.left-section:not(.position-right) {
  border-right: 1px solid var(--border);
}

/* 右侧边栏样式 */
.left-section.position-right {
  border-left: 1px solid var(--border);
  border-right: none;
}

/* 确保主内容区域正确响应侧边栏位置 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* 动画过渡 */
.content-layout > * {
  transition: all 0.3s ease;
}

/* New 按钮区域样式 */
.new-area {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: var(--surface-3);
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
  color: var(--text-secondary);
  font-size: 13px;
}

.new-button:hover {
  background-color: var(--surface-1);
  color: var(--text);
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
  background-color: var(--surface-4);
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
  color: var(--text-secondary);
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
  background-color: var(--surface-2);
  border-right: 1px solid var(--border);
  transition: none;
  overflow: hidden;
  flex-shrink: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  overflow-y: auto;
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
  background-color: var(--surface-3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  color: var(--text);
}

.sidebar-content {
  flex: 1;
  overflow: auto;
  padding: 8px;
  color: var(--text-secondary);
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
  background-color: var(--surface-1);
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

/* 主内容区域样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

/* 请求类型对话框样式 */
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
  background-color: var(--surface-1);
  border: 1px solid var(--border);
}

.request-type-option:hover {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

/* 请求响应区域样式 */
.request-response-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0;
  background-color: var(--surface-1);
}

/* 空状态样式 */
.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-1);
}

/* 空状态内容样式 */
:deep(.el-empty) {
  padding: 40px;
  margin-bottom: 40px; /* 添加一些底部边距，让内容视觉上更居中 */
}

:deep(.el-empty__image) {
  width: 120px;
  height: 120px;
}

:deep(.el-empty__description) {
  margin-top: 16px;
  margin-bottom: 20px;
  font-size: 14px;
  color: var(--text-secondary);
}

:deep(.el-empty__bottom) {
  margin-top: 20px;
}

/* 工作区样式 */
.request-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

/* 布局相关的新样式 */
.main-content.tabs-left {
  flex-direction: row;
}

.main-content.tabs-bottom {
  flex-direction: column-reverse;
}

.compact-mode {
  .new-area {
    height: 40px;
  }

  .activity-item {
    height: 40px;
  }

  .tab-manager {
    height: 36px;
  }

  .toolbar {
    height: 36px;
  }
}

/* 阴影和边框样式 */
.show-shadows {
  box-shadow: var(--shadow-base);
}

.show-borders {
  border: 1px solid var(--border);
}

/* 分隔线样式 */
.activity-divider {
  width: 32px;
  height: 1px;
  margin: 8px auto;
  background-color: var(--border);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .left-section:not(.is-collapsed) {
    position: absolute;
    height: 100%;
    z-index: 100;
  }

  .main-content.tabs-left {
    flex-direction: column;

    .tab-manager {
      width: 100%;
      height: auto;
    }
  }
}

/* 动画过渡 */
.left-section,
.main-content,
.tab-manager,
.toolbar {
  transition: all 0.3s ease;
}

/* 右侧布局时的样式调整 */
.position-right {
  order: 2;
}

.content-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 布局相关的样式 */
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
    position: relative;
  }

  /* 标签页在顶部 */
  :deep(.tab-manager) {
    width: 100%;
    height: 40px;
    border-bottom: 1px solid var(--border);
  }

  .request-response-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

/* 现代布局 */
.layout-modern {
  .content-layout {
    display: flex;
    height: 100%;
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: row;
    min-width: 0;
    position: static;
    overflow: visible;
  }

  /* 标签页在左侧 */
  :deep(.tab-manager) {
    width: 200px;
    height: 100% !important;
    border-right: 1px solid var(--border);
    flex-shrink: 0;
    position: relative;
    z-index: 1;
  }

  .request-response-wrapper {
    flex: 1;
    min-width: 0;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* 当侧栏在右侧时的样式 */
  .left-section.position-right {
    order: 2;
    border-left: 1px solid var(--border);
    border-right: none;
  }

  .main-content {
    order: 1;
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

/* 文件夹和请求项的样式 */
:deep(.folder-item),
:deep(.request-item) {
  color: var(--text);
  opacity: 0.6;
  transition: all 0.2s ease;
}

:deep(.folder-item:hover),
:deep(.request-item:hover) {
  background-color: var(--surface-3);
  color: var(--text);
  opacity: 1;
}

:deep(.folder-item.active),
:deep(.request-item.active) {
  background-color: var(--surface-3);
  color: var(--text);
  opacity: 1;
}

/* 文件夹和请求项的图标 */
:deep(.folder-item .el-icon),
:deep(.request-item .el-icon) {
  color: var(--text-secondary);
  opacity: 0.8;
  transition: all 0.2s ease;
}

:deep(.folder-item:hover .el-icon),
:deep(.request-item:hover .el-icon),
:deep(.folder-item.active .el-icon),
:deep(.request-item.active .el-icon) {
  color: var(--text);
  opacity: 1;
}

/* 文件夹和请求项的名称 */
:deep(.folder-item .folder-name),
:deep(.request-item .request-name) {
  font-size: 13px;
  transition: all 0.2s ease;
}
</style>
