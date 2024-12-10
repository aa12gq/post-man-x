<template>
  <div class="request-panel">
    <EnvironmentManager />
    <el-tabs v-model="activeTab">
      <el-tab-pane label="请求" name="request">
        <el-form :model="requestForm" label-width="100px">
          <!-- 请求类型选择 -->
          <el-form-item label="请求类型">
            <el-select v-model="requestForm.type">
              <el-option label="HTTP" value="http" />
              <el-option label="RPC" value="rpc" />
            </el-select>
          </el-form-item>

          <!-- URL输入 -->
          <el-form-item label="URL">
            <el-input v-model="requestForm.url" placeholder="请输入请求地址">
              <template #prepend>
                <el-select v-model="requestForm.protocol" style="width: 100px">
                  <el-option label="HTTP" value="http" />
                  <el-option label="HTTPS" value="https" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>

          <!-- HTTP 方法选择 -->
          <el-form-item v-if="requestForm.type === 'http'" label="方法">
            <el-select v-model="requestForm.method">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
            </el-select>
          </el-form-item>

          <!-- RPC 方法选择 -->
          <el-form-item v-if="requestForm.type === 'rpc'" label="服务">
            <div class="rpc-service-selector">
              <el-select
                v-model="selectedService"
                placeholder="选择服务"
                @change="handleServiceChange"
                :loading="loadingServices"
              >
                <el-option
                  v-for="service in rpcServices"
                  :key="service.name"
                  :label="service.name"
                  :value="service.name"
                />
              </el-select>
              <el-button
                type="primary"
                @click="loadServices"
                :loading="loadingServices"
              >
                刷新服务
              </el-button>
            </div>
          </el-form-item>

          <el-form-item v-if="requestForm.type === 'rpc' && selectedService" label="方法">
            <el-select
              v-model="requestForm.rpcMethod"
              placeholder="选择方法"
              @change="handleMethodChange"
              :loading="loadingMethods"
            >
              <el-option
                v-for="method in rpcMethods"
                :key="method.name"
                :label="method.name"
                :value="method.name"
              >
                <div class="method-option">
                  <span>{{ method.name }}</span>
                  <small class="method-types">
                    参数: {{ method.parameterType }} | 返回: {{ method.returnType }}
                  </small>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 请求参数 -->
          <el-form-item label="请求参数">
            <el-input
              v-model="requestForm.params"
              type="textarea"
              :rows="5"
              placeholder="请输入 JSON 格式的请求参数"
            />
          </el-form-item>

          <!-- Headers管理 -->
          <el-form-item label="Headers">
            <HeadersManager v-model="requestHeaders" />
          </el-form-item>

          <!-- 发送按钮 -->
          <div class="request-actions">
            <el-button
              type="primary"
              @click="sendRequest"
              :loading="loading"
            >
              发送请求
            </el-button>
            <el-button @click="clearResponse">
              清除响应
            </el-button>
            <el-button
              type="success"
              @click="showSaveDialog = true"
              :disabled="!requestForm.url"
            >
              保存到收藏夹
            </el-button>
          </div>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="历史记录" name="history">
        <el-table :data="requestHistory" style="width: 100%">
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="url" label="URL" />
          <el-table-column prop="method" label="方法" width="100" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button @click="loadRequest(scope.row)" size="small">
                加载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="收藏夹" name="favorites">
        <FavoriteManager @load="loadFromFavorite" />
      </el-tab-pane>
    </el-tabs>

    <!-- 响应结果 -->
    <div class="response-section" v-if="response || responseHeaders">
      <ResponseViewer
        v-if="response"
        :response="response"
        :response-time="responseTime"
      />
      <ResponseHeaders
        v-if="responseHeaders && Object.keys(responseHeaders).length > 0"
        :headers="responseHeaders"
      />
    </div>

    <!-- 保存收藏对话框 -->
    <el-dialog
      v-model="showSaveDialog"
      title="保存到收藏夹"
      width="500px"
    >
      <el-form :model="favoriteForm">
        <el-form-item label="名称" required>
          <el-input v-model="favoriteForm.name" placeholder="请输入名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSaveDialog = false">取消</el-button>
        <el-button type="primary" @click="saveToFavorites">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue'
import axios from 'axios'
import RpcClient, { RpcService, RpcMethod } from '../services/RpcService'
import { ElMessage } from 'element-plus'
import EnvironmentManager from './EnvironmentManager.vue'
import HeadersManager from './HeadersManager.vue'
import EnvironmentService from '../services/EnvironmentService'
import type { Header } from './HeadersManager.vue'
import ResponseViewer from './ResponseViewer.vue'
import FavoriteManager from './FavoriteManager.vue'
import ResponseHeaders from './ResponseHeaders.vue'
import FavoriteService from '../services/FavoriteService'
import type { FavoriteRequest } from '../services/FavoriteService'

const activeTab = ref('request')
const loading = ref(false)
const responseTime = ref<number | null>(null)

const requestForm = reactive({
  type: 'http',
  protocol: 'http',
  url: '',
  method: 'GET',
  rpcMethod: '',
  params: ''
})

const response = ref('')
const requestHistory = ref<any[]>([])
const requestHeaders = ref<Header[]>([])

const showSaveDialog = ref(false)
const responseHeaders = ref<Record<string, string>>({})
const favoriteForm = reactive({
  name: ''
})

const rpcServices = ref<RpcService[]>([])
const rpcMethods = ref<RpcMethod[]>([])
const selectedService = ref('')
const loadingServices = ref(false)
const loadingMethods = ref(false)

// 监听 URL 变化，自动加载服务
watch(() => requestForm.url, (newUrl) => {
  if (requestForm.type === 'rpc' && newUrl) {
    loadServices()
  }
})

// 监听类型变化
watch(() => requestForm.type, (newType) => {
  if (newType === 'rpc' && requestForm.url) {
    loadServices()
  }
})

const sendRequest = async () => {
  loading.value = true
  const startTime = Date.now()
  response.value = ''  // 清除之前的响应
  
  try {
    // 验证必要的字段
    if (!requestForm.url) {
      throw new Error('请输入请求地址')
    }

    if (requestForm.type === 'rpc' && !requestForm.rpcMethod) {
      throw new Error('请选择 RPC 方法')
    }

    let result
    const params = requestForm.params ? JSON.parse(requestForm.params) : {}
    const headers = requestHeaders.value
      .filter(h => h.enabled)
      .reduce((acc, h) => ({ ...acc, [h.name]: h.value }), {})
    
    if (requestForm.type === 'http') {
      result = await axios({
        method: requestForm.method,
        url: `${requestForm.protocol}://${requestForm.url}`,
        data: requestForm.method !== 'GET' ? params : undefined,
        params: requestForm.method === 'GET' ? params : undefined,
        headers
      })

      response.value = JSON.stringify(result.data, null, 2)
      responseHeaders.value = result.headers
    } else {
      // 获取当前选中的服务
      const service = rpcServices.value.find(s => s.name === selectedService.value)
      if (!service) {
        throw new Error('请选择服务')
      }

      console.log('Sending RPC request:', {
        url: requestForm.url,
        service: service.name,
        method: requestForm.rpcMethod,
        params
      })

      const rpcResult = await RpcClient.sendRequest(
        requestForm.url,
        service.name,
        requestForm.rpcMethod,
        params
      )

      console.log('RPC response:', rpcResult)

      // 确保响应数据正确设置
      if (rpcResult && typeof rpcResult === 'object') {
        response.value = JSON.stringify(rpcResult, null, 2)
      } else {
        response.value = String(rpcResult)
      }
      responseHeaders.value = {}
    }
    
    responseTime.value = Date.now() - startTime
    
    // 添加到历史记录
    requestHistory.value.unshift({
      type: requestForm.type,
      url: requestForm.url,
      method: requestForm.type === 'http' ? requestForm.method : requestForm.rpcMethod,
      params: requestForm.params
    })
  } catch (error: any) {
    console.error('Request failed:', error)
    ElMessage.error(`请求错误: ${error.message}`)
    response.value = `错误: ${error.message}`
    responseHeaders.value = {}
  } finally {
    loading.value = false
  }
}

const saveToFavorites = () => {
  if (!favoriteForm.name) {
    ElMessage.warning('请输入名称')
    return
  }

  FavoriteService.saveFavorite({
    name: favoriteForm.name,
    type: requestForm.type,
    protocol: requestForm.protocol,
    url: requestForm.url,
    method: requestForm.method,
    rpcMethod: requestForm.rpcMethod,
    params: requestForm.params,
    headers: requestHeaders.value
  })

  showSaveDialog.value = false
  favoriteForm.name = ''
  ElMessage.success('保存成功')
}

const loadFromFavorite = (favorite: FavoriteRequest) => {
  requestForm.type = favorite.type
  requestForm.protocol = favorite.protocol
  requestForm.url = favorite.url
  requestForm.method = favorite.method
  requestForm.rpcMethod = favorite.rpcMethod || ''
  requestForm.params = favorite.params
  requestHeaders.value = favorite.headers
  activeTab.value = 'request'
}

const clearResponse = () => {
  response.value = ''
  responseTime.value = null
  responseHeaders.value = {}
}

const loadRequest = (historyItem: any) => {
  requestForm.type = historyItem.type
  requestForm.url = historyItem.url
  requestForm.method = historyItem.method
  requestForm.params = historyItem.params
  activeTab.value = 'request'
}

const loadServices = async () => {
  if (!requestForm.url || requestForm.type !== 'rpc') return

  loadingServices.value = true
  try {
    // 确保 URL 格式正确
    const url = requestForm.url.trim()
    console.log('Loading services for URL:', url)
    rpcServices.value = await RpcClient.getServices(url)
  } catch (error: any) {
    console.error('Failed to load services:', error)
    ElMessage.error(`加载服务失败: ${error.message}`)
    rpcServices.value = []
  } finally {
    loadingServices.value = false
  }
}

const handleServiceChange = async (serviceName: string) => {
  if (!serviceName) return

  loadingMethods.value = true
  try {
    // 确保 URL 格式正确
    const url = requestForm.url.trim()
    rpcMethods.value = await RpcClient.getServiceMethods(url, serviceName)
  } catch (error: any) {
    console.error('Failed to load methods:', error)
    ElMessage.error(`加载方法失败: ${error.message}`)
  } finally {
    loadingMethods.value = false
  }
}

const handleMethodChange = (methodName: string) => {
  const method = rpcMethods.value.find(m => m.name === methodName)
  if (method && method.inputExample) {
    // 使用生成的示例据
    requestForm.params = JSON.stringify(method.inputExample, null, 2)
  }
}
</script>

<style scoped>
.request-panel {
  padding: 20px;
}

.response-section {
  margin-top: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  background-color: #fff;
}

.response-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.response-time {
  color: #666;
  font-size: 14px;
}

.rpc-service-selector {
  display: flex;
  gap: 10px;
}

.method-option {
  display: flex;
  flex-direction: column;
}

.method-types {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}
</style> 