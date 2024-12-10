<template>
  <div class="main-layout">
    <!-- 左侧边栏 -->
    <div class="sidebar">
      <el-tabs>
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
                  <!-- 顶部操作栏 -->
                  <div class="rpc-toolbar">
                    <div class="url-section">
                      <el-input
                        v-model="requestForm.url"
                        placeholder="gRPC Server URL (e.g. localhost:9000)"
                        class="server-url"
                      >
                        <template #append>
                          <el-button @click="loadServices" :loading="loadingServices">
                            Connect
                          </el-button>
                        </template>
                      </el-input>
                    </div>
                    <div class="method-section">
                      <el-select
                        v-model="selectedMethod"
                        placeholder="Select Service/Method"
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
                            :label="method.name"
                            :value="`${service.name}|${method.name}`"
                          >
                            <div class="method-option">
                              <span class="method-name">{{ method.name }}</span>
                            </div>
                          </el-option>
                        </el-option-group>
                      </el-select>
                    </div>
                    <el-button
                      type="primary"
                      @click="sendRequest"
                      :loading="loading"
                    >
                      Invoke
                    </el-button>
                  </div>

                  <!-- 请求/响应区域 -->
                  <div class="request-response-panel">
                    <!-- 请求区域 -->
                    <div class="request-section">
                      <div class="section-header">
                        <div class="header-left">
                          <span>Request Message</span>
                        </div>
                        <div class="header-right">
                          <el-button 
                            size="small"
                            type="primary"
                            plain
                            @click="generateExample"
                            :disabled="!selectedMethod"
                          >
                            生成示例参数
                          </el-button>
                        </div>
                      </div>
                      <div class="section-content">
                        <el-input
                          v-model="requestForm.params"
                          type="textarea"
                          :rows="8"
                          placeholder="Enter request message"
                        />
                      </div>
                    </div>

                    <!-- 响应区域 -->
                    <div class="response-section" v-if="response">
                      <div class="section-header">
                        <span>Response</span>
                        <span class="response-time" v-if="responseTime">
                          {{ responseTime }}ms
                        </span>
                      </div>
                      <div class="section-content">
                        <ResponseViewer
                          :response="response"
                          :response-time="responseTime"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- HTTP 请求区域 -->
              <template v-else>
                <!-- 原有的 HTTP 请求内容 -->
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

// 基础状态
const loading = ref(false);
const responseTime = ref<number | null>(null);

// 请求表单的基本结构
const baseForm = {
  type: "http",
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
    name: "新请求",
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

// 选中的方法（级联选择器的值）
const selectedMethod = ref<string>('');

// 服务和方法的级联选项
const serviceMethodOptions = computed(() => {
  return rpcServices.value.map(service => ({
    name: service.name,
    methods: service.methods.map(method => ({
      name: method.name,
      inputType: method.inputType,
      outputType: method.outputType,
      inputExample: method.inputExample
    }))
  }));
});

// 监听 URL 变化，自动加载服务
watch(
  () => requestForm.value.url,
  (newUrl) => {
    console.log("URL changed:", newUrl);
    if (requestForm.value.type === "rpc" && newUrl) {
      loadServices();
    }
  }
);

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

const sendRequest = async () => {
  loading.value = true;
  const startTime = Date.now();
  response.value = '';  // 清除之前的响应

  try {
    // 验证必要的字段
    if (!requestForm.value.url) {
      throw new Error('请输入请求地址');
    }

    if (requestForm.value.type === 'rpc') {
      console.log('Current RPC method:', requestForm.value.rpcMethod);  // 添加日志
      if (!selectedMethod.value) {
        throw new Error('请选择服务和方法');
      }
    }

    let result;
    const params = requestForm.value.params
      ? JSON.parse(requestForm.value.params)
      : {};
    const headers = requestHeaders.value
      .filter((h) => h.enabled)
      .reduce((acc, h) => ({ ...acc, [h.name]: h.value }), {});

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
    } else {  // RPC 请求
      const [serviceName, methodName] = selectedMethod.value.split('|');
      if (!serviceName || !methodName) {
        throw new Error('请选择服务和方法');
      }

      console.log('Sending RPC request:', {
        url: requestForm.value.url,
        serviceName,
        methodName,
        params
      });

      const rpcResult = await RpcClient.sendRequest(
        requestForm.value.url,
        serviceName,
        methodName,
        params
      );

      console.log('RPC response:', rpcResult);

      // 确保响应数据正确设置
      if (rpcResult && typeof rpcResult === 'object') {
        response.value = JSON.stringify(rpcResult, null, 2);
      } else {
        response.value = String(rpcResult);
      }
      responseHeaders.value = {};
    }

    responseTime.value = Date.now() - startTime;

    // 添加到历史记录
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
    ElMessage.warning("请输入名称");
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
  if (!requestForm.value.url || requestForm.value.type !== 'rpc') return;

  loadingServices.value = true;
  try {
    const url = requestForm.value.url.trim();
    console.log('Loading services for URL:', url);
    const services = await RpcClient.getServices(url);
    
    // 初始化服务列表
    rpcServices.value = services.map(service => ({
      name: service.name,
      methods: []  // 初���化空方法列表
    }));
    
    // 自动加载所有服务的方法
    await Promise.all(
      rpcServices.value.map(async service => {
        try {
          const methods = await RpcClient.getServiceMethods(url, service.name);
          const serviceIndex = rpcServices.value.findIndex(s => s.name === service.name);
          if (serviceIndex !== -1) {
            rpcServices.value[serviceIndex].methods = methods;
          }
        } catch (error) {
          console.error(`Failed to load methods for ${service.name}:`, error);
        }
      })
    );
    
    console.log('Loaded all services and methods:', rpcServices.value);
  } catch (error: any) {
    console.error('Failed to load services:', error);
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
      // 将方法转换为树节点格式
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
    // 使用生成的示例据
    requestForm.value.params = JSON.stringify(method.inputExample, null, 2);
  }
};

// 添加标签页
const addTab = () => {
  const newTabId = String(tabs.value.length + 1);
  tabs.value.push({
    id: newTabId,
    name: "新请求",
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
    // 点击的是服务节点
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
  console.log('Method selected:', value);  // 添加日志
  if (!value) return;
  
  const [serviceName, methodName] = value.split('|');
  if (!serviceName || !methodName) return;
  
  console.log('Parsed service and method:', { serviceName, methodName });  // 添加日志
  
  // 更新选中的服务
  selectedService.value = serviceName;
  
  // 更新选中的方法
  requestForm.value.rpcMethod = methodName;
  
  // 自动生成示例参数
  const service = rpcServices.value.find(s => s.name === serviceName);
  const method = service?.methods?.find(m => m.name === methodName);
  
  console.log('Found method:', method);  // 添加日志
  
  if (method?.inputExample) {
    requestForm.value.params = JSON.stringify(method.inputExample, null, 2);
  }
};

// 添加生成示例参数的方法
const generateExample = () => {
  if (!selectedMethod.value) return;
  
  const [serviceName, methodName] = selectedMethod.value.split('|');
  if (!serviceName || !methodName) return;
  
  const service = rpcServices.value.find(s => s.name === serviceName);
  const method = service?.methods?.find(m => m.name === methodName);
  
  if (method?.inputExample) {
    requestForm.value.params = JSON.stringify(method.inputExample, null, 2);
    ElMessage.success('已生成示例参数');
  } else {
    ElMessage.warning('该方法没有示例参数');
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
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 300px;
  border-right: 1px solid #dcdfe6;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.sidebar-content {
  padding: 10px;
  height: 100%;
  overflow-y: auto;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.request-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 0;
}

.request-header {
  padding: 10px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #fff;
  flex-shrink: 0;
}

.request-type-url {
  display: flex;
  gap: 10px;
  align-items: center;
}

.request-type-select {
  width: 120px;
}

.protocol-select {
  width: 100px;
}

.url-input {
  flex: 1;
}

.send-button {
  width: 80px;
}

.request-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: #fff;
}

.rpc-request-area {
  width: 400px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #dcdfe6;
  flex-shrink: 0;
}

.service-url-section {
  padding: 10px;
  border-bottom: 1px solid #dcdfe6;
}

.services-section {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.params-response-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
}

.service-name {
  font-weight: bold;
  font-size: 14px;
}

.method-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 0;
}

.method-name {
  color: #666;
  font-size: 13px;
}

.response-section {
  flex: 1;
  border-top: 1px solid #dcdfe6;
  padding: 20px;
  background-color: #fff;
  overflow: auto;
}

.params-response-area :deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.params-response-area :deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 0;
}

:deep(.el-tree-node.is-expanded > .el-tree-node__children) {
  padding-left: 20px;
}

.url-input :deep(.el-input__wrapper) {
  box-shadow: none;
}

.url-input :deep(.el-input-group__append) {
  padding: 0;
}

.url-input :deep(.el-input-group__append) button {
  border: none;
  margin: -1px;
  border-radius: 0 4px 4px 0;
}

.add-tab-button {
  margin: 0 10px;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 10px;
}

:deep(.el-tabs__content) {
  height: 100%;
  padding: 0;
}

:deep(.el-tab-pane) {
  height: 100%;
}

/* RPC 工作区样式 */
.rpc-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #fff;
}

/* 顶部具栏 */
.rpc-toolbar {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #f5f7fa;
}

.url-section {
  flex: 3; /* 增加 URL 输入框的宽度比例 */
}

.method-section {
  flex: 2; /* 增加方法选择框的宽度比例 */
}

.server-url,
.method-select {
  width: 100%;
}

/* 请求/响应区域 */
.request-response-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.request-section,
.response-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #dcdfe6;
}

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
  padding: 16px;
  overflow: auto;
}

/* 树形控件样式 */
.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.node-label {
  font-size: 14px;
  color: #666;
}

.node-label.is-service {
  font-weight: bold;
  color: #2c3e50;
}

/* 响应时间样式 */
.response-time {
  color: #666;
  font-size: 12px;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-tree-node__content) {
  height: auto;
  padding: 4px 0;
}

:deep(.el-tree-node.is-expanded > .el-tree-node__children) {
  padding-left: 24px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__wrapper) {
  box-shadow: none !important;
  border: 1px solid #dcdfe6;
}

:deep(.el-button--small) {
  padding: 8px 16px;
}

/* 确保内容区填满可用空间 */
.request-form {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.request-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.method-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.method-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.method-type {
  font-size: 12px;
  color: #666;
}

.service-name {
  font-weight: bold;
  color: #2c3e50;
}

/* 方法选择器样式 */
:deep(.el-select-dropdown.el-popper) {
  margin-top: 4px !important;
  min-width: 400px !important;
}

:deep(.el-select-dropdown__wrap) {
  max-height: 400px;
}

:deep(.el-select-group__title) {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: bold;
  color: #2c3e50;
  background-color: #f5f7fa;
  position: sticky;
  top: 0;
  z-index: 1;
}

:deep(.el-select-dropdown__item) {
  height: auto;
  padding: 8px 12px;
  line-height: 1.4;
}

.method-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.method-name {
  font-size: 13px;
  color: #2c3e50;
  flex-shrink: 0;
}

.method-type {
  font-size: 12px;
  color: #666;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
