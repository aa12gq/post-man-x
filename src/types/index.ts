// 请求类型
export type RequestType = 'http' | 'rpc'

// 认证类型
export type AuthType = 'noauth' | 'basic' | 'bearer'

// 基础认证信息
export interface BasicAuth {
  username: string
  password: string
}

// 请求标签页
export interface RequestTab {
  id: string
  name: string
  type: RequestType
  url: string
  method: string
  headers: Record<string, string>
  params: Record<string, any>
  body: any
  authType: AuthType
  basicAuth: BasicAuth
  bearerToken: string
  metadata: Record<string, string>
}

// 响应数据
export interface ResponseData {
  status: number | null
  data: any
  headers: Record<string, string>
}

// 历史记录项
export interface HistoryItem {
  id: string
  timestamp: number
  type: RequestType
  url: string
  method: string
  headers: Record<string, string>
  params: Record<string, any>
  body: any
  response: ResponseData
}

// 收藏夹项目
export interface FavoriteItem extends Omit<HistoryItem, 'timestamp' | 'response'> {
  name: string
  folder?: string
  tags?: string[]
}

// 环境变量
export interface Environment {
  id: string
  name: string
  variables: Record<string, string>
  isActive?: boolean
}

// RPC 方法
export interface Method {
  name: string
  inputType: string
  outputType: string
  description?: string
}

// RPC 服务
export interface Service {
  name: string
  methods: Method[]
}

// 应用设置
export interface Settings {
  theme: 'light' | 'dark' | 'system'
  fontSize: number
  autoSave: boolean
  maxHistoryItems: number
}
