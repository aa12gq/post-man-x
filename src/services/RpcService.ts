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

class RpcClient {
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

  async invoke(
    serviceName: string,
    methodName: string,
    params: any,
    metadata?: any
  ): Promise<RpcResponse> {
    try {
      if (!window.electron) {
        throw new Error("Electron API not available");
      }

      // 确保参数是可序列化的
      const safeParams = JSON.parse(JSON.stringify(params));
      const safeMetadata = metadata ? JSON.parse(JSON.stringify(metadata)) : undefined;

      const response = await window.electron.invoke("rpc-request", {
        url: this.url,
        serviceName,
        methodName,
        params: safeParams,
        metadata: safeMetadata,
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      return {
        data: response.data,
        headers: response.headers || {},
      };
    } catch (error) {
      console.error("Failed to invoke method:", error);
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

export default RpcClient;
