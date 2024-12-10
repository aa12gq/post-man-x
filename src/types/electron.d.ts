export {}

declare global {
  interface Window {
    electronAPI: {
      getRpcServices: (params: { url: string }) => Promise<any>
      getRpcMethods: (params: { url: string, serviceName: string }) => Promise<any>
      rpcRequest: (params: { 
        url: string, 
        serviceName: string, 
        methodName: string, 
        params: any 
      }) => Promise<any>
    }
  }
} 