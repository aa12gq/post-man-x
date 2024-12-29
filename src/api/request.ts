import axios from 'axios'
import { $t } from '../locales'
import { displayNotification } from '../utils/message'

const request = axios.create({
  baseURL: 'http://vtyug.cn:8080/api',
  // baseURL: 'http://127.0.0.1:8080/api',
  timeout: 6000,
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = JSON.parse(localStorage.getItem('token') || '{}').token
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }

    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (resp: any) => {
    // 响应成功的拦截
    console.log(resp)
    if (resp) {
      if (resp.data.code === 1003) {
        displayNotification('请先登录', 'error')
        return Promise.reject(new Error('请先登录'))
      } else if (resp.data.code !== 200) {
        return Promise.reject(new Error(resp.data.error))
      }
    }
    return resp.data
    // return Promise.reject(new Error(resp.data.error))
  },
  error => {
    console.log(error)
    // 处理错误信息
    if (error) {
      if (error.code === 'ERR_NETWORK') {
        displayNotification($t('common.error.network'), 'error')
        return Promise.reject(error)
      } else if (error.code === 'ECONNABORTED') {
        displayNotification($t('common.error.server'), 'error')
        return Promise.reject(error)
      }

      return Promise.reject(error)
    }
    return Promise.reject(new Error('未知错误'))
  },
)

export default request
