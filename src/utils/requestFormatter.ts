interface RequestData {
  url: string
  method: string
  headers: Record<string, string>
  params?: any
}

interface Headers {
  [key: string]: string;
  'accept-encoding': string;
  'accept-language': string;
}

export const formatRequestMessage = (type: 'http' | 'rpc', data: RequestData): string => {
  let message = ""

  // 通用请求信息
  message += `请求网址:\n${data.url}\n\n`
  message += `请求方法:\n${data.method}\n\n`

  // 远程地址
  try {
    const urlObj = new URL(data.url)
    message += `远程地址:\n${urlObj.host}\n\n`
  } catch (error) {
    message += `远程地址:\n${data.url}\n\n`
  }

  // 引荐来源网址政策
  message += `引荐来源网址政策:\nstrict-origin-when-cross-origin\n\n`

  // 合并所有请求头
  const allHeaders: Headers = {
    // 基础请求头
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'connection': 'keep-alive',
    'origin': window.location.origin,
    'referer': window.location.href,
    'sec-ch-ua': '"Google Chrome";v="119"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) rpc-postman/0.0.1 Chrome/120.0.6099.291 Electron/28.3.3 Safari/537.36',
    // 自定义请求头
    ...data.headers,
  }

  if (type === 'rpc') {
    allHeaders['accept'] = 'application/grpc-web+proto'
  } else {
    allHeaders['accept'] = '*/*'
  }

  // 请求标头 (按字母顺序排序)
  message += `请求标头:\n`
  Object.entries(allHeaders)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
      message += `${key}: ${value}\n`
    })

  // 请求负载
  if (data.params) {
    message += `\n请求负载:\n${JSON.stringify(data.params, null, 2)}`
  }

  return message
}

export const getAuthHeaders = (authType: string, basicAuth?: { username: string, password: string }, bearerToken?: string): Record<string, string> => {
  const headers: Record<string, string> = {}

  switch (authType) {
    case 'basic':
      if (basicAuth?.username && basicAuth?.password) {
        const credentials = btoa(`${basicAuth.username}:${basicAuth.password}`)
        headers['Authorization'] = `Basic ${credentials}`
      }
      break
    case 'bearer':
      if (bearerToken) {
        headers['Authorization'] = `Bearer ${bearerToken}`
      }
      break
  }

  return headers
}
