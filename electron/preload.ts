import { contextBridge, ipcRenderer } from 'electron'

// 确保这些 API 在渲染进程中可用
contextBridge.exposeInMainWorld('electronAPI', {
  getRpcServices: (params: { url: string }) => 
    ipcRenderer.invoke('get-rpc-services', params),
    
  getRpcMethods: (params: { url: string, serviceName: string }) => 
    ipcRenderer.invoke('get-rpc-methods', params),
    
  rpcRequest: (params: { url: string, serviceName: string, methodName: string, params: any }) => 
    ipcRenderer.invoke('rpc-request', params)
}) 