export interface RpcMethod {
  name: string
  inputType: string
  outputType: string
  description?: string
  inputExample?: any
}

export interface RpcService {
  name: string
  methods?: RpcMethod[]
}

export class RpcClient {
  private static instance: RpcClient

  private constructor() {}

  public static getInstance(): RpcClient {
    if (!RpcClient.instance) {
      RpcClient.instance = new RpcClient()
    }
    return RpcClient.instance
  }

  public async getServices(url: string): Promise<RpcService[]> {
    const result = await window.electronAPI.getRpcServices({ url })
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }

  public async getServiceMethods(url: string, serviceName: string): Promise<RpcMethod[]> {
    const result = await window.electronAPI.getRpcMethods({ url, serviceName })
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data
  }

  public async sendRequest(
    url: string,
    serviceName: string,
    methodName: string,
    params: any
  ): Promise<any> {
    console.log('RpcClient.sendRequest:', { url, serviceName, methodName, params })
    const result = await window.electronAPI.rpcRequest({
      url,
      serviceName,
      methodName,
      params
    })
    console.log('RpcClient response:', result)
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.data || {}
  }
}

export default RpcClient.getInstance() 