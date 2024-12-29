import request from './request'

// 定义请求参数的接口
interface RequestParams {
  [key: string]: any
}

// 定义基础响应格式
interface BaseResponse {
  code: number
  message: string
  success: boolean
  data?: any
  error?: string
}

// 将基础响应和具体数据结合的泛型类型
export type ApiResponse<T> = BaseResponse & {
  data?: T
}

/**
 * 通用GET请求方法
 * @param url 请求地址
 * @param params 请求参数
 * @returns Promise<ApiResponse<T>>
 */
export const get = <T = any>(url: string, params?: RequestParams): Promise<ApiResponse<T>> => {
  return request({
    method: 'GET',
    url,
    params,
  })
}

/**
 * 通用POST请求方法
 * @param url 请求地址
 * @param data 请求数据
 * @param params 查询参数（可选）
 * @returns Promise<ApiResponse<T>>
 */
export const post = <T = any>(
  url: string,
  data?: RequestParams,
  params?: RequestParams,
): Promise<ApiResponse<T>> => {
  return request({
    method: 'POST',
    url,
    data,
    params,
  })
}

/**
 * 通用PUT请求方法
 * @param url 请求地址
 * @param data 请求数据
 * @param params 查询参数（可选）
 * @returns Promise<ApiResponse<T>>
 */
export const put = <T = any>(
  url: string,
  data?: RequestParams,
  params?: RequestParams,
): Promise<ApiResponse<T>> => {
  return request({
    method: 'PUT',
    url,
    data,
    params,
  })
}

/**
 * 通用DELETE请求方法
 * @param url 请求地址
 * @param params 查询参数（可选）
 * @returns Promise<ApiResponse<T>>
 */
export const del = <T = any>(url: string, params?: RequestParams): Promise<ApiResponse<T>> => {
  return request({
    method: 'DELETE',
    url,
    params,
  })
}
