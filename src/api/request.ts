import axios from 'axios'
import { displayNotification } from '../utils/message'
import { $t } from '../i18n'

const request = axios.create({
  baseURL: 'http://vtyug.cn:8080/api',
  timeout: 6000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (resp: any) => {
    // 响应成功的拦截
    if (resp) {
      return resp.data
    }
  },
  (error) => {
    // 处理错误信息
    if (error) {
      if (error.code === 'ERR_NETWORK') {
        displayNotification($t('common.error.network'), 'error')
        return Promise.reject(error.response)
      } else if (error.code === 'ECONNABORTED') {
        displayNotification($t('common.error.server'), 'error')
        return Promise.reject(error.response)
      }
      const message = error.response.data.message
      displayNotification(message, 'error')
      return Promise.reject(error.response.data)
    }
  }
)

export default request