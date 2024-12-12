import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

interface BasicAuth {
  username: string
  password: string
}

interface RequestOptions {
  url: string
  method?: string
  headers?: Record<string, string>
  params?: Record<string, any>
  body?: any
  authType?: string
  basicAuth?: BasicAuth
  bearerToken?: string
  metadata?: Record<string, string>
}

export class RequestService {
  private static createAuthHeader(authType: string, basicAuth?: BasicAuth, bearerToken?: string): Record<string, string> {
    switch (authType) {
      case 'basic':
        if (basicAuth?.username && basicAuth?.password) {
          const credentials = btoa(`${basicAuth.username}:${basicAuth.password}`)
          return { 'Authorization': `Basic ${credentials}` }
        }
        break
      case 'bearer':
        if (bearerToken) {
          return { 'Authorization': `Bearer ${bearerToken}` }
        }
        break
    }
    return {}
  }

  private static async makeHttpRequest(options: RequestOptions): Promise<AxiosResponse> {
    const config: AxiosRequestConfig = {
      url: options.url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...this.createAuthHeader(options.authType || 'noauth', options.basicAuth, options.bearerToken)
      },
      params: options.params
    }

    if (options.body) {
      config.data = options.body
    }

    return axios(config)
  }

  private static async makeRPCRequest(options: RequestOptions): Promise<AxiosResponse> {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      ...this.createAuthHeader(options.authType || 'noauth', options.basicAuth, options.bearerToken),
      ...options.metadata
    }

    return axios({
      url: options.url,
      method: 'POST',
      headers,
      data: options.params // For RPC, we use the params as the message body
    })
  }

  static async sendRequest(type: 'http' | 'rpc', options: RequestOptions): Promise<AxiosResponse> {
    try {
      if (type === 'rpc') {
        return await this.makeRPCRequest(options)
      } else {
        return await this.makeHttpRequest(options)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If there's a response, return it (even with error status)
        if (error.response) {
          return error.response
        }
        // If no response (network error etc), throw a formatted error
        throw {
          status: 0,
          data: {
            error: error.message,
            details: error.code || 'NETWORK_ERROR'
          },
          headers: {}
        }
      }
      // For non-Axios errors, throw a generic error response
      throw {
        status: 500,
        data: {
          error: 'Internal Error',
          details: error instanceof Error ? error.message : 'Unknown error occurred'
        },
        headers: {}
      }
    }
  }
}
