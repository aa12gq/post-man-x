import { contextBridge, ipcRenderer } from 'electron'

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, data: any) => {
    const validChannels = [
      'get-rpc-services',
      'get-rpc-methods',
      'get-rpc-example',
      'rpc-request'
    ]
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data)
    }
    throw new Error(`Invalid channel: ${channel}`)
  }
}) 