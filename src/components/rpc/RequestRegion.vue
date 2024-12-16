<template>
  <div class="request-workspace">
    <!-- 添加面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb separator="/">
        <template v-if="folderPath.length">
          <el-breadcrumb-item>
            <el-icon><Folder /></el-icon>
            {{ folderPath[folderPath.length - 1].name }}
          </el-breadcrumb-item>
        </template>
        <el-breadcrumb-item>
          <el-icon>
            <component
              :is="getRequestIcon(requestForm.type).component"
              :style="{ color: getRequestIcon(requestForm.type).color }"
            />
          </el-icon>
          <span v-if="!isEditing" @dblclick="startEditing" class="request-name">
            {{ currentRequest?.name || "New Request" }}
          </span>
          <div v-else class="editing-container">
            <el-input
              v-model="editingName"
              size="small"
              ref="editInput"
              @keyup.enter="finishEditing"
              @keyup.esc="cancelEditing"
              @blur="finishEditing"
            />
          </div>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- RPC 请求区域 -->
    <div class="request-section">
      <div class="request-content">
        <div class="request-form">
          <RPCMethodSelector
            :url="requestForm.url"
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
                  :message="requestForm.params"
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
      </div>
    </div>

    <!-- 分线 -->
    <div class="resize-handle" @mousedown="startResize">
      <div class="resize-handle-line"></div>
      <div class="resize-handle-icon">
        <el-icon><ArrowUp /></el-icon>
      </div>
    </div>

    <!-- 下半部分：响应区域 -->
    <div class="response-section" :style="{ height: responseHeight }">
      <ResponseViewer
        :response="responseInfo.response"
        :response-time="responseInfo.responseTime"
        :headers="responseInfo.responseHeaders"
        :debug-logs="responseInfo.debugLogs"
        :debug-command="responseInfo.debugCommand"
        :status="responseInfo.status"
        @clear="clearResponse"
        @collapse-change="handleResponseCollapse"
        @resize="startResize"
      />
    </div>
    <EditorConfig />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, h, nextTick } from "vue";
import type { RpcService } from "../../services/RpcService";
import type { Header } from "../HeadersManager.vue";
import { useRequestHistory } from "../../composables/useRequestHistory";
import { ElMessage } from "element-plus";
import RPCMethodSelector from "./RPCMethodSelector.vue";
import RpcClient from "../../services/RpcService";
import RPCMessageEditor from "./RPCMessageEditor.vue";
import AuthorizationManager from "../auth/AuthorizationManager.vue";
import MetadataEditor from "./MetadataEditor.vue";
import ResponseViewer from "../response/ResponseViewer.vue";
import { ArrowUp, Folder, Link, Document } from "@element-plus/icons-vue";
import EditorConfig from '../editor/EditorConfig.vue';

const emit = defineEmits(["update:unsaved", "save", "name-change"]);

class RequestForm {
  type: "rpc";
  url: string;
  method: string;
  params: Record<string, any>;

  constructor() {
    this.type = "rpc";
    this.url = "";
    this.method = "";
    this.params = {};
  }

  static create() {
    return new RequestForm();
  }
}

interface Response {
  response: string;
  responseTime: number | null;
  responseHeaders: Record<string, string[]>;
  debugLogs: string;
  debugCommand: string;
  status: number;
}

class Response implements Response {
  response: string;
  responseTime: number | null;
  responseHeaders: Record<string, string[]>;

  constructor() {
    this.response = "";
    this.responseTime = null;
    this.responseHeaders = {};
  }

  static create() {
    return new Response();
  }
}

// 表单
const requestForm = ref<RequestForm>(RequestForm.create());
const responseInfo = ref<Response>(Response.create());

// 基础状态
const loading = ref(false);

// RPC 相关状态
const rpcServices = ref<RpcService[]>([]);
const selectedMethod = ref("");
const loadingServices = ref(false);
const loadingMethods = ref(false);

// 响应相关状态
const requestHeaders = ref<Header[]>([]);

// 标签���相关状态
const activePane = ref("message");

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
  history,
  addHistoryItem: addToHistory,
  getFolderPath,
  rename,
  loadHistory,
} = useRequestHistory();

const handleMethodChange = (method: any) => {
  selectedMethod.value = method;
  if (method) {
    requestForm.value.method = method.name;
    emit("update:unsaved", true);
    generateExample();
  }
};

const updateMessage = (message: any) => {
  console.log("Updating message, marking as unsaved"); // 添加日志
  if (requestForm.value) {
    requestForm.value.params = message;
    emit("update:unsaved", true);
  }
};

const updateMetadata = (metadata: Record<string, string>) => {
  requestHeaders.value = Object.entries(metadata).map(([name, value]) => ({
    enabled: true,
    name,
    value,
  }));
  emit("update:unsaved", true);
};

const handleAuthChange = (authData: any) => {
  authType.value = authData.type;
  if (authData.type === "basic") {
    auth.basic = authData.basicAuth;
  } else if (authData.type === "bearer") {
    auth.bearer.token = authData.bearerToken;
  }
  emit("update:unsaved", true);
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

    if (example && requestForm.value) {
      const exampleStr = JSON.stringify(example, null, 2);
      console.log("Example string:", exampleStr);
      requestForm.value.params = JSON.parse(exampleStr);
      updateMessage(requestForm.value.params);
      emit("update:unsaved", true);
    } else {
      console.log("No example or no current tab:", {
        example,
        currentTab: requestForm.value,
      });
    }
  } catch (error) {
    console.error("Failed to generate example:", error);
    ElMessage.error("Failed to generate example");
  }
};

const clearResponse = () => {
  responseInfo.value = Response.create();
};

const sendRequest = async () => {
  if (!requestForm.value) return;

  loading.value = true;
  const startTime = Date.now();

  try {
    if (requestForm.value.type === "rpc") {
      const client = new RpcClient(requestForm.value.url);
      const methodParts = selectedMethod.value.split(".");
      const serviceName = methodParts.slice(0, -1).join(".");
      const methodName = methodParts[methodParts.length - 1];

      // 保数是可序列化的对象
      let params;
      try {
        params =
          typeof requestForm.value.params === "string"
            ? JSON.parse(requestForm.value.params)
            : JSON.parse(JSON.stringify(requestForm.value.params));
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
      if (requestForm.value) {
        // 确保响应数据是格式化的 JSON 字符串
        const formattedResponse =
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data, null, 2);

        responseInfo.value.response = formattedResponse;
        responseInfo.value.responseTime = Date.now() - startTime;
        responseInfo.value.responseHeaders = Object.entries(
          response.headers || {}
        ).reduce((acc, [key, value]) => {
          acc[key] = Array.isArray(value) ? value : [value];
          return acc;
        }, {} as Record<string, string[]>);

        // 确保调试信息被正确设置
        responseInfo.value.debugLogs = response.debug || "";
        responseInfo.value.debugCommand = response.command || "";
        responseInfo.value.status = 200;

        console.log("Debug info:", {
          logs: responseInfo.value.debugLogs,
          command: responseInfo.value.debugCommand,
        });
      }

      // 添加到历史记录
      addToHistory({
        id: String(Date.now()),
        type: "rpc",
        url: requestForm.value.url,
        method: selectedMethod.value,
        params: params,
        response: response.data,
        timestamp: Date.now(),
        debugInfo: response.debug || "",
        debugCommand: response.command || "",
        requestMessage: JSON.stringify(params),
        name: `${selectedMethod.value} Request`,
      });
    }
  } catch (error: any) {
    console.error("Request failed:", error);
    ElMessage.error(`Request failed: ${error.message}`);

    // 清空响应，但保错误信息
    if (requestForm.value) {
      responseInfo.value.response = "";
      responseInfo.value.responseTime = null;
      responseInfo.value.responseHeaders = {};
      responseInfo.value.debugLogs = error.debug || error.message || "";
      responseInfo.value.debugCommand = "";
      responseInfo.value.status = 500;
    }
  } finally {
    loading.value = false;
  }
  console.log("Request sent, marking as saved"); // 添加日志
  emit("update:unsaved", false);
};

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

const updateUrl = (url: string) => {
  console.log("Updating URL, marking as unsaved"); // 添加日志
  if (requestForm.value) {
    requestForm.value.url = url;
    emit("update:unsaved", true);
  }
};

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

// 响应区域高度控制
const responseHeight = ref("50%");
const isResizing = ref(false);
const minResponseHeight = 40;

onMounted(() => {
  const workspace = document.querySelector(".request-workspace") as HTMLElement;
  if (workspace) {
    const workspaceHeight = workspace.getBoundingClientRect().height;
    responseHeight.value = `${workspaceHeight / 2}px`;
  }
});

const startResize = (e: MouseEvent) => {
  isResizing.value = true;
  const workspace = (e.target as HTMLElement).closest(
    ".request-workspace"
  ) as HTMLElement;
  const workspaceRect = workspace.getBoundingClientRect();
  const startY = e.clientY;

  const currentHeight =
    parseInt(responseHeight.value.replace("px", "")) ||
    workspaceRect.height / 2;
  const startHeight = currentHeight;

  console.log("Initial startHeight:", startHeight);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.value) return;

    const deltaY = startY - e.clientY;
    const newHeight = Math.min(
      Math.max(startHeight + deltaY, minResponseHeight),
      workspaceRect.height - 200
    );

    if (
      newHeight >= minResponseHeight &&
      newHeight <= workspaceRect.height - 200
    ) {
      responseHeight.value = `${newHeight}px`;
    }

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

// 获取当前请求
const currentRequest = computed(() => {
  return history.value.find((item) => item.id === props.tabId);
});

// 获取文件夹路径
const folderPath = computed(() => {
  const path = getFolderPath(currentRequest.value?.folderId);
  return path.length > 0 ? [path[path.length - 1]] : [];
});

const props = defineProps<{
  tabId: string;
  requestType: string;
}>();

// 自定义 gRPC 图标组件
const GrpcIcon = {
  name: "GrpcIcon",
  render() {
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 16 16",
        width: "1em",
        height: "1em",
        fill: "currentColor",
      },
      [
        // 居中字母 g
        h(
          "text",
          {
            x: "8",
            y: "10",
            "font-size": "14",
            "font-weight": "bold",
            "font-family": "Arial",
            "text-anchor": "middle",
            "dominant-baseline": "central",
          },
          "g"
        ),
      ]
    );
  },
};

// 获取请求图标的方法
function getRequestIcon(type: string) {
  switch (type) {
    case "http":
      return {
        component: Link,
        color: "#67c23a",
      };
    case "rpc":
      return {
        component: GrpcIcon,
        color: "#409eff",
      };
    default:
      return {
        component: Document,
        color: "var(--text-color-secondary)",
      };
  }
}

// 添加重命名相关的状态
const isEditing = ref(false);
const editingName = ref("");
const editInput = ref<HTMLInputElement | null>(null);

// 开始编辑
const startEditing = () => {
  if (!currentRequest.value) return;
  isEditing.value = true;
  editingName.value = currentRequest.value.name;
  nextTick(() => {
    editInput.value?.focus();
  });
};

// 完成编辑
const finishEditing = async () => {
  if (!currentRequest.value || !editingName.value.trim()) {
    cancelEditing();
    return;
  }

  const newName = editingName.value.trim();

  // 先更新本地状态
  if (currentRequest.value) {
    currentRequest.value.name = newName;
  }

  // 调用 rename 方法更新名称
  rename(currentRequest.value.id, newName, false);
  isEditing.value = false;
  editingName.value = "";
  emit("update:unsaved", true);

  // 强制更新视图
  nextTick(async () => {
    try {
      await loadHistory();
      // 触发父组件更新，添加非空断言
      if (currentRequest.value) {
        emit("name-change", {
          id: currentRequest.value.id,
          name: newName,
        });
      }
    } catch (error) {
      console.error("Failed to sync name change:", error);
    }
  });
};

// 取消编辑
const cancelEditing = () => {
  isEditing.value = false;
  editingName.value = "";
};
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-color);
}

.content-layout {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  position: relative;
}

.left-section {
  display: flex;
  flex-direction: column;
  min-width: 48px;
  border-right: 1px solid var(--border-color);
  background-color: var(--bg-color);
  flex-shrink: 0;
  transition: width 0.3s;
}

.left-section.is-collapsed {
  width: 48px !important;
  .new-area,
  .collections-sidebar {
    display: none;
  }
}

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
}

.sidebar-container {
  flex: 1;
  display: flex;
  width: 100%;
  overflow: hidden;
  position: relative;
}

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

.collections-sidebar {
  position: relative;
  background-color: var(--bg-color);
  border-right: 1px solid var(--border-color);
  overflow: hidden;
  flex-shrink: 0;
  flex: 1;
}

.collections-sidebar.is-collapsed {
  width: 0;
  padding: 0;
  margin: 0;
  border-right: none;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--header-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  overflow: auto;
  height: calc(100% - v-bind(responseHeight));
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

.request-response-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  overflow: hidden;
}

.response-section {
  height: 100%;
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

.response-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

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
}

.resizer:hover {
  background-color: var(--el-color-primary);
}

:deep(.response-viewer) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.sidebar-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
}

.sidebar-content {
  padding: 8px;
  height: calc(100% - 41px);
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  bottom: v-bind(responseHeight);
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

.resize-handle:hover {
  .resize-handle-line {
    background-color: var(--el-color-primary);
  }
  .resize-handle-icon {
    opacity: 1;
  }
}

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
}

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

.breadcrumb-container {
  padding: 8px 16px;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-color);
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--text-color);
  font-weight: 500;
}

:deep(.el-breadcrumb__item:not(:last-child) .el-breadcrumb__inner) {
  color: var(--text-color-secondary);
}

:deep(.el-icon) {
  margin-right: 4px;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

/* 调整 gRPC 图标大小 */
:deep(svg) {
  width: 16px;
  height: 16px;
  overflow: visible;
  transform-origin: center;
  transform: scale(1.2); /* 稍微放大一点 */
}

:deep(svg text) {
  fill: currentColor;
  dominant-baseline: central;
  transform-origin: center;
  font-style: italic;
}

.request-name {
  cursor: text;
  &:hover {
    color: var(--el-color-primary);
  }
}

.editing-container {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-input) {
  width: 200px;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-input__inner) {
  height: 24px;
  font-size: inherit;
}

.request-region {
  background-color: var(--bg-color);
  color: var(--text-color);
}

.request-header {
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
}

.invoke-button {
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.invoke-button:hover {
  background-color: var(--primary-dark);
}

.invoke-button:disabled {
  background-color: var(--text-color-disabled);
  cursor: not-allowed;
}

.request-body {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-color-light);
}

.response-panel {
  background-color: var(--bg-color-light);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.response-header {
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
}

.status-success {
  color: var(--success-color);
}

.status-error {
  color: var(--danger-color);
}
</style>
