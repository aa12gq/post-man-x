import { ElMessage } from 'element-plus'

export const displayNotification = (message: string, type: 'success' | 'warning' | 'info' | 'error' = 'info') => {
  ElMessage({
    message,
    type,
    duration: 3000, // 消息显示时间
  })
}