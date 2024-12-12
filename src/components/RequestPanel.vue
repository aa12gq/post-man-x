<template>
  <div class="main-layout">
    <!-- 折叠按钮 -->
    <div class="sidebar-toggle" @click="toggleSidebar">
      <el-icon :class="{ 'is-collapsed': isSidebarCollapsed }">
        <CaretLeft />
      </el-icon>
    </div>

    <!-- 左侧边栏 -->
    <div class="sidebar" :class="{ 'is-collapsed': isSidebarCollapsed }">
      <el-tabs type="border-card">
        <!-- 收藏夹 -->
        <el-tab-pane label="收藏夹" name="favorites">
          <div class="sidebar-content">
            <FavoriteManager @load="loadFromFavorite" />
          </div>
        </el-tab-pane>

        <!-- 历史记录 -->
        <el-tab-pane label="历史记录" name="history">
          <div class="sidebar-content">
            <RequestHistory
              :history-list="requestHistory"
              @load-request="loadRequest"
              @view-details="openRequestDetails"
              @remove-item="removeHistoryItem"
              @clear-history="clearHistory"
            />
          </div>
        </el-tab-pane>

        <!-- 环境变量 -->
        <el-tab-pane label="环境" name="environment">
          <div class="sidebar-content">
            <EnvironmentManager />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 右侧主内容区 -->
    <div class="main-content">
      <TabManager
        v-model="activeTab"
        :tabs="tabs"
        @add="addTab"
        @remove="removeTab"
      >
        <template v-for="tab in tabs" :key="tab.id" #[tab.id]>
          <div class="request-form">
            <!-- 请求类型切换 -->
            <div class="request-type-switch">
              <el-radio-group v-model="tab.form.type" size="small">
                <el-radio-button :value="'http'">HTTP</el-radio-button>
                <el-radio-button :value="'rpc'">RPC</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 内容区域 -->
            <div class="request-content">
              <!-- RPC 请求区域 -->
              <template v-if="tab.form.type === 'rpc'">
                <RPCMethodSelector
                  :url="tab.form.url"
                  :loading="loading"
                  :loading-methods="loadingMethods"
                  :loading-services="loadingServices"
                  :services="rpcServices"
                  @update:url="handleUrlUpdate"
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
                        :message="tab.form.params"
                        :has-method="!!selectedMethod"
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
                        :initial-metadata="requestHeaders"
                        @update:metadata="updateMetadata"
                      />
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </template>

              <!-- HTTP 请求区域 -->
              <template v-else>
                <HTTPRequestForm
                  :initial-method="tab.form.method"
                  :initial-url="tab.form.url"
                  :initial-headers="requestHeaders"
                  :initial-params="queryParams"
                  :initial-body="tab.form.params"
                  :loading="loading"
                  @update:method="updateMethod"
                  @update:url="updateUrl"
                  @update:headers="updateHeaders"
                  @update:params="updateParams"
                  @update:body="updateBody"
                  @send="sendRequest"
                />
              </template>

              <!-- 响应区域 -->
              <ResponseViewer
                v-if="currentTab"
                :response="currentTab.response"
                :response-time="currentTab.responseTime"
                :headers="currentTab.responseHeaders"
                :debug-logs="currentTab.debugLogs"
                :debug-command="currentTab.debugCommand"
                @clear="clearResponse"
              />
            </div>
          </div>
        </template>
      </TabManager>
    </div>

    <!-- 请求详情抽屉 -->
    <RequestDetailsDrawer
      v-model="showRequestDetailsDrawer"
      :details="currentRequestDetails"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onBeforeUnmount, watch } from "vue";
import { CaretLeft } from "@element-plus/icons-vue";
import TabManager from "./tabs/TabManager.vue";
import FavoriteManager from "./FavoriteManager.vue";
import RequestHistory from "./history/RequestHistory.vue";
import EnvironmentManager from "./EnvironmentManager.vue";
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

// 请求类型定义
type RequestType = "rpc" | "http";

// 基础状态
const loading = ref(false);
const responseTime = ref<number | null>(null);
const isSidebarCollapsed = ref(false);

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
  form: typeof baseForm;
  response: string;
  responseTime: number | null;
  responseHeaders: Record<string, string>;
  debugLogs?: string;
  debugCommand?: string;
}

const tabs = ref<Tab[]>([
  {
    id: "1",
    name: "New Request",
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
const response = ref("");
const responseHeaders = ref<Record<string, string>>({});
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
const {
  historyItems: requestHistory,
  addHistoryItem: addToHistory,
  removeHistoryItem,
  clearHistory,
} = useRequestHistory();

// 方法定义
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const addTab = () => {
  const newId = String(tabs.value.length + 1);
  tabs.value.push({
    id: newId,
    name: "New Request",
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
      currentTab.value.debugLogs = response.debug || '';
      currentTab.value.debugCommand = response.command || '';

      console.log("Response updated:", {
        response: currentTab.value.response,
        time: currentTab.value.responseTime,
        headers: currentTab.value.responseHeaders,
      });
    }

    // 添加到历史记录
    addToHistory({
      type: "rpc",
      url: requestForm.value.url,
      serviceMethod: selectedMethod.value,
      params: params,
      response: response.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Request failed:", error);
    ElMessage.error(`Request failed: ${error.message}`);

    // 清空响应
    if (currentTab.value) {
      currentTab.value.response = "";
      currentTab.value.responseTime = null;
      currentTab.value.responseHeaders = {};
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

// 监听 URL 变化
watch(
  () => requestForm.value.url,
  (newUrl) => {
    if (newUrl && requestForm.value.type === "rpc") {
      loadServices();
    }
  }
);

// 监听请求类型变化
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
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: var(--bg-color);
  position: relative;
}

.sidebar {
  position: relative;
  width: 300px;
  background-color: var(--bg-color);
  box-shadow: none;
  border-right: 1px solid var(--border-color);
  transition: all 0.3s ease;
  overflow: hidden;
}

.sidebar.is-collapsed {
  width: 0;
  padding: 0;
  margin: 0;
  border-right: none;
}

.sidebar-toggle {
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
  transition: left 0.3s ease;
  color: var(--text-color);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.request-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  overflow: hidden;
}

.request-type-switch {
  padding: 16px;
  display: flex;
  justify-content: center;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

.request-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  padding: 16px;
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
  padding: 16px;
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

/* 确保响应区域有足够的高度 */
.response-viewer {
  flex: 1;
  min-height: 200px;
  overflow: auto;
}
</style>
