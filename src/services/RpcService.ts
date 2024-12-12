export interface RpcService {
  name: string;
  methods: RpcMethod[];
}

export interface RpcMethod {
  name: string;
  inputType: string;
  outputType: string;
}

export interface RpcResponse {
  data: any;
  headers: Record<string, string>;
}

export default class RpcClient {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async listServices(): Promise<RpcService[]> {
    try {
      if (!window.electron) {
        throw new Error("Electron API not available");
      }
      const response = await window.electron.invoke("get-rpc-services", {
        url: this.url,
      });
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error("Failed to list services:", error);
      throw error;
    }
  }

  async generateExample(method: string): Promise<any> {
    try {
      if (!window.electron) {
        throw new Error("Electron API not available");
      }
      const response = await window.electron.invoke("get-rpc-example", {
        url: this.url,
        method,
      });
      console.log('generateExample response:', response);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error("Failed to generate example:", error);
      throw error;
    }
  }

  async invoke(serviceName: string, methodName: string, params: any) {
    try {
      const response = await window.electron.invoke('rpc-request', {
        url: this.url,
        serviceName,
        methodName,
        params
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      // 返回完整的响应对象，包括调试信息
      return {
        data: response.data,
        headers: response.headers || {},
        debug: response.debug || '',    // 调试日志
        command: response.command || '' // 执行的命令
      };
    } catch (error: any) {
      console.error('RPC request failed:', error);
      throw error;
    }
  }

  async getMethods(serviceName: string): Promise<RpcMethod[]> {
    try {
      if (!window.electron) {
        throw new Error("Electron API not available");
      }
      const response = await window.electron.invoke("get-rpc-methods", {
        url: this.url,
        serviceName,
      });
      console.log('getMethods response:', response);
      if (!response.success) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error("Failed to get methods:", error);
      throw error;
    }
  }
}
