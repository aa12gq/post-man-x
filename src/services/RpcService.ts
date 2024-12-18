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
  metadata: Record<string, string>;
  trailers: Record<string, string>;
  debug?: string;
  command?: string;
}

export interface GrpcResponse {
  payload: any;
  metadata: Record<string, string>;
  trailers: Record<string, string>;
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

  async invoke(serviceName: string, methodName: string, params: any, options?: { metadata?: Record<string, string> }): Promise<RpcResponse> {
    try {
      const metadataArgs = options?.metadata 
        ? Object.entries(options.metadata).map(([key, value]) => 
            `-H "${key}: ${value.replace(/"/g, '\\"')}"`
          )
        : [];

      const requestParams = {
        url: this.url,
        serviceName,
        methodName,
        params: JSON.parse(JSON.stringify(params)),
        metadata: options?.metadata,
        metadataArgs
      };

      const command = [
        'grpcurl',
        '-plaintext',
        ...metadataArgs,
        '-d', '@',
        this.url,
        `${serviceName}/${methodName}`
      ];

      console.log('Sending RPC request:', requestParams);
      console.log('Command:', command.join(' '));

      const response = await window.electron.invoke('rpc-request', requestParams);

      if (!response.success) {
        throw new Error(response.error);
      }

      return {
        data: response.data,
        headers: response.headers || {},
        metadata: response.metadata || {},
        trailers: response.trailers || {},
        debug: response.debug || '',
        command: command.join(' ')
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
