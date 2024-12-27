// 注册请求参数接口
export interface RegisterRequest {
  username: string
  password: string
}

// 登录请求参数接口
export interface LoginRequest {
  username: string
  password: string
  email: string
  captcha: string
  phone: string
}

// 注册响应接口
export interface RegisterResponse {
  code: number
  message: string
  success: boolean
  error?: string
}

// 登录响应接口
export interface LoginResponse {
  code: number
  message: string
  success: boolean
  data?: {
    token: string
  }
  error?: string
}
