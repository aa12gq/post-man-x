<template>
  <div class="main-layout">
    <!-- 左侧边栏 -->
    <div class="sidebar">
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
            <el-table :data="requestHistory" style="width: 100%">
              <el-table-column prop="type" label="类型" width="60" />
              <el-table-column prop="url" label="URL" show-overflow-tooltip />
              <el-table-column label="操作" width="80">
                <template #default="scope">
                  <el-button @click="loadRequest(scope.row)" size="small">
                    加载
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
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
      <el-tabs
        v-model="activeTab"
        type="card"
        closable
        @tab-remove="removeTab"
        @tab-add="addTab"
      >
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.id"
          :label="tab.name"
          :name="tab.id"
        >
          <!-- 请求表单 -->
          <div class="request-form">
            <!-- 请求头部 -->
            <div class="request-header">
              <!-- 请求类型切换 -->
              <div class="request-type-switch">
                <el-radio-group v-model="requestForm.type" size="small">
                  <el-radio-button label="http">HTTP</el-radio-button>
                  <el-radio-button label="rpc">RPC</el-radio-button>
                </el-radio-group>
              </div>
            </div>

            <!-- 请求内容区域 -->
            <div class="request-content">
              <!-- RPC 请求区域 -->
              <template v-if="requestForm.type === 'rpc'">
                <div class="rpc-workspace">
                  <!-- 顶部工具栏 -->
                  <div class="rpc-toolbar">
                    <div class="toolbar-section">
                      <div class="url-section">
                        <el-input
                          v-model="requestForm.url"
                          placeholder="Enter gRPC Server URL"
                          class="server-url"
                        />
                      </div>
                      <div class="method-section">
                        <el-select
                          v-model="selectedMethod"
                          placeholder="Select Method"
                          class="method-select"
                          :loading="loadingMethods"
                          filterable
                        >
                          <!-- 服务分组 -->
                          <el-option-group
                            v-for="service in rpcServices"
                            :key="service.name"
                            :label="service.name"
                          >
                            <!-- 方法列表 -->
                            <el-option
                              v-for="method in service.methods"
                              :key="`${service.name}.${method.name}`"
                              :label="`${getSimpleServiceName(service.name)}/${
                                method.name
                              }`"
                              :value="`${service.name}|${method.name}`"
                            >
                              <div class="method-option">
                                <span class="method-name">{{
                                  method.name
                                }}</span>
                              </div>
                            </el-option>
                          </el-option-group>

                          <!-- 底部刷新按钮 -->
                          <template #footer>
                            <div class="select-footer">
                              <el-button
                                class="refresh-button"
                                :loading="loadingServices"
                                @click.stop="loadServices"
                                size="small"
                                text
                              >
                                Use server reflection
                                <el-icon
                                  class="refresh-icon"
                                  :class="{
                                    'is-loading': loadingServices,
                                  }"
                                  style="margin-left: 2px"
                                >
                                  <Refresh />
                                </el-icon>
                              </el-button>
                            </div>
                          </template>
                        </el-select>
                      </div>
                      <el-button
                        type="primary"
                        @click="sendRequest"
                        :loading="loading"
                        class="invoke-button"
                      >
                        <el-icon><CaretRight /></el-icon>
                        Invoke
                      </el-button>
                    </div>
                  </div>

                  <!-- 请求/响应区域 -->
                  <div class="request-response-panel">
                    <!-- 请求区域 -->
                    <div class="request-section">
                      <!-- 请求选项卡 -->
                      <el-tabs
                        type="border-card"
                        class="request-tabs"
                        v-model="activePane"
                      >
                        <!-- Message 选项卡 -->
                        <el-tab-pane label="Message" name="message">
                          <div class="tab-content">
                            <div class="content-header">
                              <span class="header-title">Request Message</span>
                            </div>
                            <div class="content-body">
                              <div class="editor-container">
                                <CodeEditor
                                  v-model="requestForm.params"
                                  language="json"
                                />
                              </div>
                              <!-- 底部示例按钮 -->
                              <div class="message-footer">
                                <el-button
                                  size="small"
                                  type="primary"
                                  link
                                  @click="generateExample"
                                  :disabled="!selectedMethod"
                                >
                                  Use example message
                                </el-button>
                              </div>
                            </div>
                          </div>
                        </el-tab-pane>

                        <!-- Authorization 选项卡 -->
                        <el-tab-pane label="Authorization" name="auth">
                          <div class="auth-container">
                            <!-- 左侧类型选择 -->
                            <div class="auth-type-sidebar">
                              <el-radio-group
                                v-model="authType"
                                class="auth-type-list"
                              >
                                <el-radio label="noauth">No Auth</el-radio>
                                <el-radio label="apikey">API Key</el-radio>
                                <el-radio label="bearer">Bearer Token</el-radio>
                                <el-radio label="basic">Basic Auth</el-radio>
                              </el-radio-group>
                            </div>

                            <!-- 右侧表单区域 -->
                            <div class="auth-form-container">
                              <!-- No Auth -->
                              <template v-if="authType === 'noauth'">
                                <div class="auth-info">
                                  <el-alert
                                    title="This request does not use any authorization"
                                    type="info"
                                    :closable="false"
                                  />
                                </div>
                              </template>

                              <!-- API Key -->
                              <template v-if="authType === 'apikey'">
                                <el-form label-position="top" class="auth-form">
                                  <el-form-item label="Key">
                                    <el-input
                                      v-model="auth.apiKey.key"
                                      placeholder="Parameter Key"
                                    />
                                  </el-form-item>
                                  <el-form-item label="Value">
                                    <el-input
                                      v-model="auth.apiKey.value"
                                      placeholder="Parameter Value"
                                    />
                                  </el-form-item>
                                  <el-form-item label="Added to">
                                    <el-radio-group v-model="auth.apiKey.in">
                                      <el-radio label="header">Header</el-radio>
                                      <el-radio label="query"
                                        >Query Params</el-radio
                                      >
                                    </el-radio-group>
                                  </el-form-item>
                                </el-form>
                              </template>

                              <!-- Bearer Token -->
                              <template v-if="authType === 'bearer'">
                                <el-form label-position="top" class="auth-form">
                                  <el-form-item label="Token">
                                    <el-input
                                      v-model="auth.bearer.token"
                                      type="textarea"
                                      :rows="3"
                                      placeholder="Bearer Token"
                                    />
                                  </el-form-item>
                                  <div class="auth-description">
                                    Adds an Authorization header: Bearer
                                    &lt;token&gt;
                                  </div>
                                </el-form>
                              </template>

                              <!-- Basic Auth -->
                              <template v-if="authType === 'basic'">
                                <el-form label-position="top" class="auth-form">
                                  <el-form-item label="Username">
                                    <el-input
                                      v-model="auth.basic.username"
                                      placeholder="Username"
                                    />
                                  </el-form-item>
                                  <el-form-item label="Password">
                                    <el-input
                                      v-model="auth.basic.password"
                                      type="password"
                                      show-password
                                      placeholder="Password"
                                    />
                                  </el-form-item>
                                  <div class="auth-description">
                                    Adds an Authorization header: Basic
                                    &lt;credentials&gt;
                                  </div>
                                </el-form>
                              </template>
                            </div>
                          </div>
                        </el-tab-pane>

                        <!-- Metadata 选项卡 -->
                        <el-tab-pane label="Metadata" name="metadata">
                          <div class="tab-content">
                            <div class="content-header">
                              <span class="header-title">Metadata</span>
                            </div>
                            <div class="content-body">
                              <HeadersManager v-model="requestHeaders" />
                            </div>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>

                    <!-- 响应区�� -->
                    <div class="response-section">
                      <div class="section-header">
                        <div class="header-title">Response</div>
                        <div class="header-info" v-if="responseTime">
                          <el-tag size="small" type="success"
                            >{{ responseTime }}ms</el-tag
                          >
                        </div>
                      </div>
                      <div class="section-content">
                        <CodeEditor
                          v-model="response"
                          language="json"
                          :readOnly="true"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- HTTP 请求区域 -->
              <template v-else>
                <!-- 原有的 HTTP 请求容 -->
              </template>
            </div>
          </div>
        </el-tab-pane>

        <!-- 添加新标签页的按钮 -->
        <el-button class="add-tab-button" size="small" circle @click="addTab">
          <i class="el-icon-plus"></i>
        </el-button>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, computed, onMounted } from "vue";
import axios from "axios";
import RpcClient, { RpcService, RpcMethod } from "../services/RpcService";
import { ElMessage } from "element-plus";
import EnvironmentManager from "./EnvironmentManager.vue";
import HeadersManager from "./HeadersManager.vue";
import EnvironmentService from "../services/EnvironmentService";
import type { Header } from "./HeadersManager.vue";
import ResponseViewer from "./ResponseViewer.vue";
import FavoriteManager from "./FavoriteManager.vue";
import ResponseHeaders from "./ResponseHeaders.vue";
import FavoriteService from "../services/FavoriteService";
import type { FavoriteRequest } from "../services/FavoriteService";
import { Refresh, CaretRight } from "@element-plus/icons-vue";
import CodeEditor from "./CodeEditor.vue";

// 基础状态
const loading = ref(false);
const responseTime = ref<number | null>(null);

// 请求表单的基本构
const baseForm = {
  type: "rpc",
  protocol: "http",
  url: "",
  method: "GET",
  rpcMethod: "",
  params: "",
};

// 标签页相关状态
interface Tab {
  id: string;
  name: string;
  form: typeof baseForm;
  response: string;
  responseTime: number | null;
  responseHeaders: Record<string, string>;
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

// 获取当前活动的标签页
const currentTab = computed(() => {
  return tabs.value.find((tab) => tab.id === activeTab.value);
});

// 当前请求表单的引用
const requestForm = computed(() => currentTab.value?.form || baseForm);

// 其他状态
const response = ref("");
const requestHistory = ref<any[]>([]);
const requestHeaders = ref<Header[]>([]);
const showSaveDialog = ref(false);
const responseHeaders = ref<Record<string, string>>({});
const favoriteForm = reactive({
  name: "",
});

const rpcServices = ref<RpcService[]>([]);
const rpcMethods = ref<RpcMethod[]>([]);
const selectedService = ref("");
const loadingServices = ref(false);
const loadingMethods = ref(false);

// 选中的方法（级联选择的值）
const selectedMethod = ref<string>("");

// 服务和方法的级项
const serviceMethodOptions = computed(() => {
  return rpcServices.value.map((service) => ({
    name: service.name,
    methods: service.methods.map((method) => ({
      name: method.name,
      inputType: method.inputType,
      outputType: method.outputType,
      inputExample: method.inputExample,
    })),
  }));
});

// 监听类型变化
watch(
  () => requestForm.value.type,
  (newType) => {
    console.log("Type changed:", newType);
    if (newType === "rpc" && requestForm.value.url) {
      loadServices();
    }
  }
);

// 授权相关的状态
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

// 在发送请求前处理授权信息
const getAuthHeaders = () => {
  const headers: Record<string, string> = {};

  switch (authType.value) {
    case "apikey":
      if (auth.apiKey.in === "header") {
        headers[auth.apiKey.key] = auth.apiKey.value;
      }
      break;
    case "bearer":
      if (auth.bearer.token) {
        headers["Authorization"] = `Bearer ${auth.bearer.token}`;
      }
      break;
    case "basic":
      if (auth.basic.username || auth.basic.password) {
        const credentials = btoa(
          `${auth.basic.username}:${auth.basic.password}`
        );
        headers["Authorization"] = `Basic ${credentials}`;
      }
      break;
  }

  return headers;
};

const sendRequest = async () => {
  loading.value = true;
  const startTime = Date.now();
  response.value = ""; // 清除之前的响应

  try {
    // 验证必要
    if (!requestForm.value.url) {
      throw new Error("请输入请求地址");
    }

    if (requestForm.value.type === "rpc") {
      console.log("Current RPC method:", requestForm.value.rpcMethod);
      if (!selectedMethod.value) {
        throw new Error("请选择服务和方法");
      }
    }

    let result;
    const params = requestForm.value.params
      ? JSON.parse(requestForm.value.params)
      : {};

    // 合并请求头授权头
    const headers = {
      ...requestHeaders.value
        .filter((h) => h.enabled)
        .reduce((acc, h) => ({ ...acc, [h.name]: h.value }), {}),
      ...getAuthHeaders(),
    };

    if (requestForm.value.type === "http") {
      result = await axios({
        method: requestForm.value.method,
        url: `${requestForm.value.protocol}://${requestForm.value.url}`,
        data: requestForm.value.method !== "GET" ? params : undefined,
        params: requestForm.value.method === "GET" ? params : undefined,
        headers,
      });

      response.value = JSON.stringify(result.data, null, 2);
      responseHeaders.value = result.headers;
    } else {
      // RPC 请求
      const [serviceName, methodName] = selectedMethod.value.split("|");
      if (!serviceName || !methodName) {
        throw new Error("请选择服务和方法");
      }

      console.log("Sending RPC request:", {
        url: requestForm.value.url,
        serviceName,
        methodName,
        params,
      });

      const rpcResult = await RpcClient.sendRequest(
        requestForm.value.url,
        serviceName,
        methodName,
        params
      );

      console.log("RPC response:", rpcResult);

      // 确保响应数据正确设置
      if (rpcResult && typeof rpcResult === "object") {
        response.value = JSON.stringify(rpcResult, null, 2);
      } else {
        response.value = String(rpcResult);
      }
      responseHeaders.value = {};
    }

    responseTime.value = Date.now() - startTime;

    // 添加历史记录
    requestHistory.value.unshift({
      type: requestForm.value.type,
      url: requestForm.value.url,
      method:
        requestForm.value.type === "http"
          ? requestForm.value.method
          : requestForm.value.rpcMethod,
      params: requestForm.value.params,
    });
  } catch (error: any) {
    console.error("Request failed:", error);
    ElMessage.error(`请求错误: ${error.message}`);
    response.value = `错误: ${error.message}`;
    responseHeaders.value = {};
  } finally {
    loading.value = false;
  }
};

const saveToFavorites = () => {
  if (!favoriteForm.name) {
    ElMessage.warning("请输入称");
    return;
  }

  FavoriteService.saveFavorite({
    name: favoriteForm.name,
    type: requestForm.value.type,
    protocol: requestForm.value.protocol,
    url: requestForm.value.url,
    method: requestForm.value.method,
    rpcMethod: requestForm.value.rpcMethod,
    params: requestForm.value.params,
    headers: requestHeaders.value,
  });

  showSaveDialog.value = false;
  favoriteForm.name = "";
  ElMessage.success("保存成功");
};

const loadFromFavorite = (favorite: FavoriteRequest) => {
  requestForm.value.type = favorite.type;
  requestForm.value.protocol = favorite.protocol;
  requestForm.value.url = favorite.url;
  requestForm.value.method = favorite.method;
  requestForm.value.rpcMethod = favorite.rpcMethod || "";
  requestForm.value.params = favorite.params;
  requestHeaders.value = favorite.headers;
  activeTab.value = "request";
};

const clearResponse = () => {
  response.value = "";
  responseTime.value = null;
  responseHeaders.value = {};
};

const loadRequest = (historyItem: any) => {
  requestForm.value.type = historyItem.type;
  requestForm.value.url = historyItem.url;
  requestForm.value.method = historyItem.method;
  requestForm.value.params = historyItem.params;
  activeTab.value = "request";
};

const loadServices = async () => {
  if (!requestForm.value.url || requestForm.value.type !== "rpc") return;

  loadingServices.value = true;
  try {
    const url = requestForm.value.url.trim();
    console.log("Loading services for URL:", url);
    const services = await RpcClient.getServices(url);

    // 初始化服务列表
    rpcServices.value = services.map((service) => ({
      name: service.name,
      methods: [], // 初始化空方法列表
    }));

    // 自动加载所有服务方法
    await Promise.all(
      rpcServices.value.map(async (service) => {
        try {
          const methods = await RpcClient.getServiceMethods(url, service.name);
          const serviceIndex = rpcServices.value.findIndex(
            (s) => s.name === service.name
          );
          if (serviceIndex !== -1) {
            rpcServices.value[serviceIndex].methods = methods;
          }
        } catch (error) {
          console.error(`Failed to load methods for ${service.name}:`, error);
        }
      })
    );

    console.log("Loaded all services and methods:", rpcServices.value);
  } catch (error: any) {
    console.error("Failed to load services:", error);
    ElMessage.error(`加载服务失败: ${error.message}`);
    rpcServices.value = [];
  } finally {
    loadingServices.value = false;
  }
};

const handleServiceChange = async (serviceName: string) => {
  if (!serviceName) return;

  loadingMethods.value = true;
  try {
    const url = requestForm.value.url.trim();
    console.log("Loading methods for service:", serviceName);
    const methods = await RpcClient.getServiceMethods(url, serviceName);

    // 更新服务的方法列表
    const serviceIndex = rpcServices.value.findIndex(
      (s) => s.name === serviceName
    );
    if (serviceIndex !== -1) {
      // 将方法转换树节点格式
      rpcServices.value[serviceIndex].methods = methods.map((method) => ({
        name: method.name,
        label: method.name,
        inputType: method.inputType,
        outputType: method.outputType,
        inputExample: method.inputExample,
        isMethod: true, // 标记这是一个方法节点
      }));
    }

    rpcMethods.value = methods;
    console.log("Updated service methods:", rpcServices.value[serviceIndex]);
  } catch (error: any) {
    console.error("Failed to load methods:", error);
    ElMessage.error(`加载方法失败: ${error.message}`);
  } finally {
    loadingMethods.value = false;
  }
};

const handleMethodChange = (methodName: string) => {
  const method = rpcMethods.value.find((m) => m.name === methodName);
  if (method && method.inputExample) {
    // 使用成示
    requestForm.value.params = JSON.stringify(method.inputExample, null, 2);
  }
};

// 添加标签页
const addTab = () => {
  const newTabId = String(tabs.value.length + 1);
  tabs.value.push({
    id: newTabId,
    name: "New Request",
    form: reactive({ ...baseForm }),
    response: "",
    responseTime: null,
    responseHeaders: {},
  });
  activeTab.value = newTabId;
};

// 关闭标签页
const removeTab = (targetName: string) => {
  const tab = tabs.value.find((tab) => tab.id === targetName);
  if (!tab) return;

  const tabIndex = tabs.value.indexOf(tab);
  tabs.value = tabs.value.filter((tab) => tab.id !== targetName);

  if (activeTab.value === targetName) {
    activeTab.value = tabs.value[tabIndex - 1]?.id || tabs.value[0]?.id;
  }
};

// 处理节点点击
const handleNodeClick = (data: any) => {
  console.log("Node clicked:", data);
  if (!data.methods) {
    // 点击��是服务节点
    selectedService.value = data.name;
    handleServiceChange(data.name);
  } else {
    // 点击的是方法节点
    requestForm.value.rpcMethod = data.name;
    handleMethodChange(data.name);
  }
};

// 调用方法
const invokeMethod = (method: any) => {
  console.log("Invoking method:", method);
  requestForm.value.rpcMethod = method.name;
  if (method.inputExample) {
    requestForm.value.params = JSON.stringify(method.inputExample, null, 2);
  }
  sendRequest();
};

// 处理方法选择
const handleMethodSelect = (value: string) => {
  console.log("Method selected:", value); // 添加日志
  if (!value) return;

  const [serviceName, methodName] = value.split("|");
  if (!serviceName || !methodName) return;

  console.log("Parsed service and method:", { serviceName, methodName }); // 添加日志

  // 更新选中的服务
  selectedService.value = serviceName;

  // 更新选中的方法
  requestForm.value.rpcMethod = methodName;

  // 自动生成示例参数
  const service = rpcServices.value.find((s) => s.name === serviceName);
  const method = service?.methods?.find((m) => m.name === methodName);

  console.log("Found method:", method); // 添加日志

  if (method?.inputExample) {
    requestForm.value.params = JSON.stringify(method.inputExample, null, 2);
  }
};

// 添加生成示例参数的方法
const generateExample = () => {
  if (!selectedMethod.value) return;

  const [serviceName, methodName] = selectedMethod.value.split("|");
  if (!serviceName || !methodName) return;

  const service = rpcServices.value.find((s) => s.name === serviceName);
  const method = service?.methods?.find((m) => m.name === methodName);

  if (method?.inputExample) {
    requestForm.value.params = JSON.stringify(method.inputExample, null, 2);
    ElMessage.success("已生成示例参数");
  } else {
    ElMessage.warning("该方法没有示例参数");
  }
};

// 添加 onMounted 钩子
onMounted(() => {
  console.log("Component mounted");
  if (requestForm.value.type === "rpc" && requestForm.value.url) {
    console.log("Loading services on mount");
    loadServices();
  }
});

// 获取简化的服务名（去掉包名前缀）
const getSimpleServiceName = (fullName: string) => {
  const parts = fullName.split(".");
  return parts[parts.length - 1]; // 返回最后一个部分作为服务名
};

const activePane = ref("message"); //设置默认选中的标签页
</script>

<style scoped>
/* 主布局 */
.main-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f0f2f5;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 侧边栏 */
.sidebar {
  width: 300px;
  background-color: #fff;
  box-shadow: none;
  border-right: 1px solid #e4e7ed;
}

/* 右侧主内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 请求表单 */
.request-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;
}

/* 请求类型切换 */
.request-type-switch {
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

/* RPC 工作区 */
.rpc-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 工具栏 */
.rpc-toolbar {
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.url-section {
  flex: 2;
  min-width: 0;
}

.method-section {
  flex: 3;
  min-width: 0;
}

.server-url {
  width: 100%;
}

.method-select {
  width: 100%;
}

/* 请求响应区域 */
.request-response-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  height: calc(100vh - 140px);
  overflow: auto;
  padding-bottom: 60px;
}

/* 请求区域 */
.request-section {
  flex: 0 0 400px; /* 固定高度 */
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

/* 响应区域 */
.response-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  min-height: calc(100vh - 600px);
  margin-bottom: 0px;
}

.section-header {
  flex-shrink: 0;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-content {
  flex: 1;
  position: relative;
  overflow: hidden;
  padding-bottom: 20px;
}

/* Monaco 编辑器容器样式 */
.section-content :deep(.monaco-editor-container) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100% !important;
}

/* 标签页样式 */
.request-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs--border-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  flex-shrink: 0;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 内容区域样式 */
.tab-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-header {
  flex-shrink: 0;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.editor-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 32px;
}

/* Monaco 编辑器容器样式 */
:deep(.monaco-editor-container) {
  height: 100% !important;
}

/* 底部按钮区域 */
.message-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px;
  padding: 4px 16px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 响应区域标题栏 */
.section-header {
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-content {
  flex: 1;
  overflow: hidden;
  padding: 0;
}

/* 代码编辑器 */
.code-editor {
  height: 100%;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
}

:deep(.el-textarea__inner) {
  height: 100% !important;
  font-family: inherit;
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 12px;
  line-height: 1.6;
}

/* 按钮样式 */
.invoke-button {
  width: 100px;
  flex-shrink: 0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* 标签页样式 */
:deep(.el-tabs--border-card) {
  box-shadow: none;
  height: 100%;
}

:deep(.el-tabs__content) {
  padding: 0;
  height: calc(100% - 40px);
}

:deep(.el-tab-pane) {
  height: 100%;
}

/* 下拉框样式 */
:deep(.el-select-dropdown) {
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-select-group__title) {
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  background-color: #f5f7fa;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 12px;
  font-size: 13px;
}

/* 响应时间标签 */
.header-info .el-tag {
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
  border-radius: 4px;
}

/* 内容区域样式 */
.tab-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-header {
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.content-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Monaco 编辑器容器样式 */
:deep(.monaco-editor-container) {
  flex: 1;
}

/* 标签页容器样式 */
:deep(.el-tabs) {
  height: 100%;
}

:deep(.el-tabs__content) {
  height: calc(100% - 40px);
  padding: 0;
}

/* 工具栏布局调整 */
.toolbar-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.url-section {
  flex: 2;
  min-width: 0;
}

.method-section {
  flex: 3;
  min-width: 0;
}

/* 移除 URL 输入框前缀 */
:deep(.el-input-group__prepend) {
  display: none;
}

/* 服务选择下拉框样式 */
:deep(.el-select-dropdown) {
  min-width: 400px !important;
}

/* 调整下拉选项的宽度 */
:deep(.el-select-dropdown__item) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 请求内容区域 */
.request-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
