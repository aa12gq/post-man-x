<template>
  <div class="main-layout">
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
    </div>

    <!-- Collections 边栏 -->
    <div
      class="collections-sidebar"
      :class="{
        'is-collapsed': isSidebarCollapsed || activeView !== 'collections',
        'is-hidden': activeView !== 'collections',
      }"
      :style="{ width: `${sidebarWidth}px` }"
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
        <el-button text size="small" @click="handleAddCollection">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      <div class="sidebar-content">
        <el-tree
          :data="collectionsData"
          :props="defaultProps"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <el-icon><Folder /></el-icon>
              <span>{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
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

    <!-- 右侧主内容区 -->
    <div class="main-content">
      <!-- 标签页-->
      <div class="tabs-container">
        <TabManager
          v-model="activeTab"
          :tabs="tabs"
          @add="addTab"
          @remove="removeTab"
        />
      </div>

      <!-- 请求和响应区域包装器 -->
      <div class="request-response-wrapper">
        <template v-if="currentTab">
          <div class="request-workspace">
            <!-- 上半部分：请求区域 -->
            <div
              class="request-section"
              :style="{ height: `calc(100% - ${responseHeight})` }"
            >
              <div class="request-type-switch">
                <el-radio-group v-model="currentTab.form.type" size="small">
                  <el-radio-button value="http">HTTP</el-radio-button>
                  <el-radio-button value="rpc">RPC</el-radio-button>
                </el-radio-group>
              </div>

              <div class="request-content">
                <!-- RPC 请求区域 -->
                <div v-if="currentTab.form.type === 'rpc'" class="request-form">
                  <RPCMethodSelector
                    :url="currentTab.form.url"
                    :loading="loading"
                    :loading-methods="loadingMethods"
                    :loading-services="loadingServices"
                    :services="rpcServices"
                    @update:url="updateUrl"
                    @method-change="handleMethodChange"
                    @send="sendRequest"
                    @load-methods="loadServiceMethods"
                    @load-services="loadServices"
                  />

                  <div class="request-response-panel">
                    <el-tabs v-model="activePane" type="border-card">
                      <!-- Message 选项卡 -->
                      <el-tab-pane label="Message" name="message">
                        <RPCMessageEditor
                          :message="currentTab.form.params"
                          :has-method="true"
                          @update:message="updateMessage"
                          @generate-example="generateExample"
                        />
                      </el-tab-pane>

                      <!-- Authorization 选项卡 -->
                      <el-tab-pane label="Authorization" name="auth">
                        <AuthorizationManager
                          :initial-auth-type="authType"
                          :initial-basic-auth="auth.basic"
                          :initial-bearer-token="auth.bearer.token"
                          @auth-change="handleAuthChange"
                        />
                      </el-tab-pane>

                      <!-- Metadata 选项卡 -->
                      <el-tab-pane label="Metadata" name="metadata">
                        <MetadataEditor
                          :initial-metadata="headersToRecord(requestHeaders)"
                          @update:metadata="updateMetadata"
                        />
                      </el-tab-pane>
                    </el-tabs>
                  </div>
                </div>

                <!-- HTTP 请求区域 -->
                <div v-else class="request-form">
                  <HTTPRequestForm
                    :initial-method="currentTab.form.method"
                    :initial-url="currentTab.form.url"
                    :initial-headers="headersToRecord(requestHeaders)"
                    :initial-params="queryParams"
                    :initial-body="currentTab.form.params"
                    :loading="loading"
                    @update:method="updateMethod"
                    @update:url="updateUrl"
                    @update:headers="updateHeaders"
                    @update:params="updateParams"
                    @update:body="updateBody"
                    @send="sendRequest"
                  />
                </div>
              </div>
            </div>

            <!-- 分割线 -->
            <div class="resize-handle" @mousedown="startResize">
              <div class="resize-handle-line"></div>
              <div class="resize-handle-icon">
                <el-icon><ArrowUp /></el-icon>
              </div>
            </div>

            <!-- 下半部分：响应区域 -->
            <div class="response-section" :style="{ height: responseHeight }">
              <ResponseViewer
                :response="currentTab.response"
                :response-time="currentTab.responseTime"
                :headers="currentTab.responseHeaders"
                :debug-logs="currentTab.debugLogs"
                :debug-command="currentTab.debugCommand"
                :status="currentTab.status"
                @clear="clearResponse"
                @collapse-change="handleResponseCollapse"
                @resize="startResize"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 请求详情抽屉 -->
    <RequestDetailsDrawer
      v-model="showRequestDetailsDrawer"
      :details="currentRequestDetails"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  reactive,
  computed,
  onBeforeUnmount,
  watch,
  onMounted,
} from "vue";
import {
  CaretLeft,
  Folder,
  Collection,
  Connection,
  Plus,
  ArrowDown,
  ArrowUp,
} from "@element-plus/icons-vue";
import TabManager from "./tabs/TabManager.vue";
import RPCMethodSelector from "./rpc/RPCMethodSelector.vue";
import RPCMessageEditor from "./rpc/RPCMessageEditor.vue";
import AuthorizationManager from "./auth/AuthorizationManager.vue";
import MetadataEditor from "./rpc/MetadataEditor.vue";
import ResponseViewer from "./response/ResponseViewer.vue";
import HTTPRequestForm from "./http/HTTPRequestForm.vue";
import RequestDetailsDrawer from "./request/RequestDetailsDrawer.vue";
import { useRequestHistory } from "../composables/useRequestHistory";
import RpcClient from "../services/RpcService";
import type { RpcService } from "../services/RpcService";
import type { Header } from "./HeadersManager.vue";
import type { FavoriteRequest } from "../services/FavoriteService";
import { ElMessage } from "element-plus";

// 基础状态
const loading = ref(false);
const isSidebarCollapsed = ref(
  localStorage.getItem("sidebarCollapsed") === "true"
);
const sidebarWidth = ref(Number(localStorage.getItem("sidebarWidth")) || 300); // 如果没有存储值则使用默认值300

// 请求表单的基本构造
const baseForm = {
  type: "http",
  method: "GET",
  url: "",
  params: {},
  headers: {},
  response: null,
  responseTime: 0,
  responseHeaders: {},
};

// 标签页相关状态
interface Tab {
  id: string;
  name: string;
  title: string;
  form: typeof baseForm;
  response: string;
  responseTime: number | null;
  responseHeaders: Record<string, string>;
  debugLogs?: string;
  debugCommand?: string;
  status?: number | string;
}

const tabs = ref<Tab[]>([
  {
    id: "1",
    name: "New Request",
    title: "New Request",
    form: reactive({ ...baseForm }),
    response: "",
    responseTime: null,
    responseHeaders: {},
  },
]);

const activeTab = ref("1");
const activePane = ref("message");

// 获取当前活动的标签页
const currentTab = computed(() => {
  return tabs.value.find((tab) => tab.id === activeTab.value);
});

// 当前请求表单的引用
const requestForm = computed(() => currentTab.value?.form || baseForm);

// 响应相关状态
const requestHeaders = ref<Header[]>([]);
const showRequestDetailsDrawer = ref(false);

// RPC 相关状态
const rpcServices = ref<RpcService[]>([]);
const selectedMethod = ref("");
const loadingServices = ref(false);
const loadingMethods = ref(false);

// 授权相关状态
const authType = ref<"noauth" | "apikey" | "bearer" | "basic">("noauth");
const auth = reactive({
  apiKey: {
    key: "",
    value: "",
    in: "header",
  },
  bearer: {
    token: "",
  },
  basic: {
    username: "",
    password: "",
  },
});

// 历史记录相关
const { historyItems: requestHistory, addHistoryItem: addToHistory } =
  useRequestHistory();

// 方法定义
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  // 保存状态到 localStorage
  localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.value.toString());
};

const addTab = () => {
  const newId = String(tabs.value.length + 1);
  tabs.value.push({
    id: newId,
    name: "New Request",
    title: "New Request",
    form: reactive({ ...baseForm }),
    response: "",
    responseTime: null,
    responseHeaders: {},
  });
  activeTab.value = newId;
};

const removeTab = (tabId: string) => {
  const index = tabs.value.findIndex((tab) => tab.id === tabId);
  if (index > -1) {
    tabs.value.splice(index, 1);
    if (tabs.value.length === 0) {
      addTab();
    } else if (activeTab.value === tabId) {
      activeTab.value = tabs.value[Math.min(index, tabs.value.length - 1)].id;
    }
  }
};

const loadFromFavorite = (favorite: FavoriteRequest) => {
  if (currentTab.value) {
    Object.assign(currentTab.value.form, {
      type: favorite.type,
      url: favorite.url,
      method: favorite.method,
      params: favorite.params,
    });
  }
};

const handleUrlUpdate = (url: string) => {
  if (currentTab.value) {
    currentTab.value.form.url = url;
    if (currentTab.value.form.type === "rpc") {
      loadServices();
    }
  }
};

const handleMethodChange = (method: any) => {
  selectedMethod.value = method;
  if (currentTab.value) {
    currentTab.value.form.method = method.name;
    generateExample();
  }
};

const updateMessage = (message: any) => {
  if (currentTab.value) {
    currentTab.value.form.params = message;
  }
};

const updateMetadata = (metadata: Record<string, string>) => {
  requestHeaders.value = Object.entries(metadata).map(([name, value]) => ({
    enabled: true,
    name,
    value,
  }));
};

const handleAuthChange = (authData: any) => {
  authType.value = authData.type;
  if (authData.type === "basic") {
    auth.basic = authData.basicAuth;
  } else if (authData.type === "bearer") {
    auth.bearer.token = authData.bearerToken;
  }
};

const loadServices = async () => {
  if (!requestForm.value.url || loadingServices.value) return;

  loadingServices.value = true;
  try {
    const client = new RpcClient(requestForm.value.url);
    const services = await client.listServices();
    console.log("Services loaded:", services);
    rpcServices.value = services;
  } catch (error) {
    console.error("Failed to load services:", error);
    ElMessage.error("Failed to load services");
  } finally {
    loadingServices.value = false;
  }
};

const generateExample = async () => {
  try {
    if (!selectedMethod.value || !requestForm.value.url) return;

    const client = new RpcClient(requestForm.value.url);
    const example = await client.generateExample(selectedMethod.value);
    console.log("Generated example:", example);

    if (example && currentTab.value) {
      const exampleStr = JSON.stringify(example, null, 2);
      console.log("Example string:", exampleStr);
      currentTab.value.form.params = exampleStr;
      updateMessage(exampleStr);
    } else {
      console.log("No example or no current tab:", {
        example,
        currentTab: currentTab.value,
      });
    }
  } catch (error) {
    console.error("Failed to generate example:", error);
    ElMessage.error("Failed to generate example");
  }
};

const clearResponse = () => {
  if (currentTab.value) {
    currentTab.value.response = "";
    currentTab.value.responseTime = null;
    currentTab.value.responseHeaders = {};
  }
};

const sendRequest = async () => {
  if (!currentTab.value) return;

  loading.value = true;
  const startTime = Date.now();

  try {
    if (requestForm.value.type === "rpc") {
      const client = new RpcClient(requestForm.value.url);
      const methodParts = selectedMethod.value.split(".");
      const serviceName = methodParts.slice(0, -1).join(".");
      const methodName = methodParts[methodParts.length - 1];

      // 确保参数是可序列化的对象
      let params;
      try {
        params =
          typeof currentTab.value.form.params === "string"
            ? JSON.parse(currentTab.value.form.params)
            : JSON.parse(JSON.stringify(currentTab.value.form.params));
      } catch (error) {
        console.error("Failed to parse params:", error);
        throw new Error("Invalid request parameters");
      }

      console.log("Sending request:", {
        serviceName,
        methodName,
        params,
      });

      const response = await client.invoke(serviceName, methodName, params);
      console.log("Full response:", response); // 添加日志以检查响应

      // 更新响应
      if (currentTab.value) {
        // 确保响应数据是格式化的 JSON 字符串
        const formattedResponse =
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data, null, 2);

        currentTab.value.response = formattedResponse;
        currentTab.value.responseTime = Date.now() - startTime;
        currentTab.value.responseHeaders = response.headers || {};

        // 确保调试信息被正确设置
        currentTab.value.debugLogs = response.debug || "";
        currentTab.value.debugCommand = response.command || "";
        currentTab.value.status = 200;

        console.log("Debug info:", {
          logs: currentTab.value.debugLogs,
          command: currentTab.value.debugCommand,
        });
      }

      // 添加到历史记录
      addToHistory({
        id: String(Date.now()),
        type: "rpc",
        url: requestForm.value.url,
        serviceMethod: selectedMethod.value,
        params: params,
        response: response.data,
        timestamp: Date.now(),
        debugInfo: response.debug,
        debugCommand: response.command,
        requestMessage: JSON.stringify(params),
      });
    }
  } catch (error: any) {
    console.error("Request failed:", error);
    ElMessage.error(`Request failed: ${error.message}`);

    // 清空响应，但保留错误信息
    if (currentTab.value) {
      currentTab.value.response = "";
      currentTab.value.responseTime = null;
      currentTab.value.responseHeaders = {};
      currentTab.value.debugLogs = error.debug || error.message || "";
      currentTab.value.debugCommand = "";
      currentTab.value.status = 500;
    }
  } finally {
    loading.value = false;
  }
};

// HTTP 相关方法
const updateMethod = (method: string) => {
  if (currentTab.value) {
    currentTab.value.form.method = method;
  }
};

const updateUrl = (url: string) => {
  if (currentTab.value) {
    currentTab.value.form.url = url;
  }
};

const updateHeaders = (headers: Record<string, string>) => {
  requestHeaders.value = Object.entries(headers).map(([name, value]) => ({
    enabled: true,
    name,
    value,
  }));
};

const updateParams = (params: Record<string, string>) => {
  if (currentTab.value) {
    currentTab.value.form.params = JSON.stringify(params);
  }
};

const updateBody = (body: string) => {
  if (currentTab.value) {
    currentTab.value.form.params = body;
  }
};

const currentRequestDetails = ref({
  type: "",
  url: "",
  method: "",
  requestMessage: "",
  headers: {},
  params: null,
});

const queryParams = ref<Record<string, string>>({});

const loadRequest = (historyItem: any) => {
  if (currentTab.value) {
    Object.assign(currentTab.value.form, {
      type: historyItem.type,
      url: historyItem.url,
      method: historyItem.method,
      params: historyItem.params,
    });

    if (historyItem.type === "rpc") {
      selectedMethod.value = historyItem.method;
      loadServices();
    }
  }
};

const openRequestDetails = (item: any) => {
  currentRequestDetails.value = {
    type: item.type,
    url: item.url,
    method: item.method || item.serviceMethod,
    requestMessage: item.requestMessage,
    headers: item.headers || {},
    params: item.params,
  };
  showRequestDetailsDrawer.value = true;
};

// 监听求类型变化
watch(
  () => requestForm.value.type,
  (newType) => {
    if (newType === "rpc" && requestForm.value.url) {
      loadServices();
    }
  }
);

const loadServiceMethods = async (serviceName: string) => {
  try {
    loadingMethods.value = true;
    const client = new RpcClient(requestForm.value.url);
    const methods = await client.getMethods(serviceName);
    console.log("Loaded methods for service:", serviceName, methods);

    // 更新服务的方法列表
    const serviceIndex = rpcServices.value.findIndex(
      (s) => s.name === serviceName
    );
    if (serviceIndex !== -1) {
      rpcServices.value[serviceIndex].methods = methods;
    }
  } catch (error) {
    console.error("Failed to load methods:", error);
    ElMessage.error("Failed to load service methods");
  } finally {
    loadingMethods.value = false;
  }
};

// 响应区域高度控制
const responseHeight = ref("50%");
const isResizing = ref(false);
const minResponseHeight = 40;
const maxResponseHeight = 800;

const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  const workspace = (e.target as HTMLElement).closest(
    ".request-workspace"
  ) as HTMLElement;
  const workspaceRect = workspace.getBoundingClientRect();
  const startY = e.clientY;
  const startHeight = parseInt(responseHeight.value);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return;

    const deltaY = startY - e.clientY;
    const newHeight = Math.min(
      Math.max(startHeight + deltaY, minResponseHeight),
      workspaceRect.height - 200
    );

    responseHeight.value = `${newHeight}px`;
    document.body.classList.add("is-resizing");
  };

  const handleMouseUp = () => {
    isResizing.value = false;
    document.body.classList.remove("is-resizing");
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const handleResponseCollapse = (collapsed: boolean) => {
  responseHeight.value = collapsed ? `${minResponseHeight}px` : "50%";
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
});

onBeforeUnmount(() => {
  const style = document.querySelector("style");
  if (style && style.innerHTML.includes("is-resizing")) {
    style.remove();
  }
});

// 树形结构的配置
const defaultProps = {
  children: "children",
  label: "name",
};

// Collections 数据
const collectionsData = ref([
  {
    name: "My Collections",
    children: [
      { name: "Project A" },
      { name: "Project B" },
      {
        name: "Project C",
        children: [{ name: "API v1" }, { name: "API v2" }],
      },
    ],
  },
]);

// History 文件夹
const historyFolders = ref([
  {
    name: "Today",
    children: [],
  },
  {
    name: "Yesterday",
    children: [],
  },
  {
    name: "Last 7 Days",
    children: [],
  },
]);

// Environment 文件夹
const environmentFolders = ref([
  {
    name: "Global",
    children: [],
  },
  {
    name: "Local",
    children: [],
  },
]);

// 处理节点点击
const handleNodeClick = (data: any) => {
  console.log(data);
};

const handleAddCollection = () => {
  // 处理添加合的逻辑
  console.log("Add collection clicked");
};

// 活动视图状态
const activeView = ref<"collections" | "apis" | null>(
  (localStorage.getItem("activeView") as "collections" | "apis" | null) || null
);

// 切换视图
const toggleView = (view: "collections" | "apis") => {
  if (activeView.value === view) {
    activeView.value = null;
  } else {
    activeView.value = view;
  }
  // 保存当前视图状态
  localStorage.setItem("activeView", activeView.value || "");
};

const minWidth = 200; // 最小宽度
const maxWidth = 600; // 最大宽度
let startX = 0;
let startWidth = 0;

const COLLAPSE_THRESHOLD = 100; // 收起阈值

const handleSidebarResize = (e: MouseEvent) => {
  const deltaX = e.clientX - startX;
  const newWidth = startWidth + deltaX;

  // 更新宽度值
  sidebarWidth.value = Math.min(Math.max(newWidth, minWidth), maxWidth);

  // 如果宽度小于阈值,立即收起边栏
  if (newWidth < COLLAPSE_THRESHOLD) {
    isSidebarCollapsed.value = true;
  } else if (isSidebarCollapsed.value) {
    // 如果宽度大于阈值且当前是收起状态，则展开
    isSidebarCollapsed.value = false;
  }
};

const startSidebarResize = (e: MouseEvent) => {
  startX = e.clientX;
  startWidth = sidebarWidth.value;

  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";

  document.addEventListener("mousemove", handleSidebarResize);
  document.addEventListener("mouseup", stopSidebarResize);
};

const stopSidebarResize = () => {
  document.removeEventListener("mousemove", handleSidebarResize);
  document.removeEventListener("mouseup", stopSidebarResize);

  document.body.style.cursor = "";
  document.body.style.userSelect = "";

  // 如果宽度小于阈值,直接收起边栏
  if (sidebarWidth.value < COLLAPSE_THRESHOLD) {
    isSidebarCollapsed.value = true;
  }

  // 保存宽度到 localStorage
  localStorage.setItem("sidebarWidth", sidebarWidth.value.toString());
  localStorage.setItem("sidebarCollapsed", isSidebarCollapsed.value.toString());
};

// 将 headers 数组转换为 Record<string, string>
const headersToRecord = (
  headers: { enabled: boolean; name: string; value: string }[]
): Record<string, string> => {
  return headers.reduce((acc, header) => {
    if (header.enabled) {
      acc[header.name] = header.value;
    }
    return acc;
  }, {} as Record<string, string>);
};
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: var(--bg-color);
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
}

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

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: none;
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

.request-section {
  flex: none;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow: hidden;
  transition: height 0.05s ease;
}

.request-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

.request-form {
  flex: 1;
  overflow: auto;
  background-color: var(--bg-color);
}

.request-form.expanded {
  flex: 1;
}

.request-type-switch {
  padding: 16px;
  display: flex;
  justify-content: center;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

.request-response-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding: 10px;
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

/* 响应区域容器 */
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

/* 拖动时的样式 */
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

/* TabManager 组件样式调整 */
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
</style>
