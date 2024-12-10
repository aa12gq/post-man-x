import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'

const execAsync = promisify(exec)

declare const __dirname: string
declare const process: NodeJS.Process

interface RpcRequest {
  jsonrpc: string
  method: string
  params: any
  id: number | string
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// 获取 RPC 服务列表
ipcMain.handle('get-rpc-services', async (event, params) => {
  try {
    if (!params?.url) {
      throw new Error('URL is required')
    }

    const cleanUrl = params.url.toString().replace(/^(http|https):\/\//, '')
    console.log('Getting services for:', cleanUrl)
    
    const { stdout, stderr } = await execAsync(`grpcurl -plaintext ${cleanUrl} list`)
    
    if (stderr) {
      console.error('grpcurl stderr:', stderr)
      throw new Error(stderr)
    }

    // 解析服务列表
    const services = stdout.split('\n')
      .filter(Boolean)  // 移除空行
      .map(name => ({ name }))

    return { success: true, data: services }
  } catch (error: any) {
    console.error('Failed to get services:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
})

// 获取 RPC 方法列表
ipcMain.handle('get-rpc-methods', async (event, params) => {
  try {
    if (!params?.url || !params?.serviceName) {
      throw new Error('URL and serviceName are required')
    }

    const cleanUrl = params.url.toString().replace(/^(http|https):\/\//, '')
    console.log('Getting methods for service:', params.serviceName)
    
    const { stdout, stderr } = await execAsync(`grpcurl -plaintext ${cleanUrl} describe ${params.serviceName}`)
    
    if (stderr) {
      console.error('grpcurl stderr:', stderr)
      throw new Error(stderr)
    }

    // 解析方法列表
    const methodRegex = /rpc\s+(\w+)\s*\(([^)]+)\)\s+returns\s+\(([^)]+)\)/g
    const methods = []
    let match

    while ((match = methodRegex.exec(stdout)) !== null) {
      methods.push({
        name: match[1],
        inputType: match[2].trim(),
        outputType: match[3].trim()
      })
    }

    return { success: true, data: methods }
  } catch (error: any) {
    console.error('Failed to get methods:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
})

// 处理 RPC 请求
ipcMain.handle('rpc-request', async (event, params) => {
  try {
    if (!params?.url || !params?.serviceName || !params?.methodName) {
      throw new Error('URL, serviceName, and methodName are required')
    }

    const cleanUrl = params.url.toString().replace(/^(http|https):\/\//, '')
    console.log('Making RPC request:', { 
      serviceName: params.serviceName, 
      methodName: params.methodName, 
      params: params.params 
    })
    
    // 将参数写入临时文件
    const tmpFile = path.join(app.getPath('temp'), 'rpc-request.json')
    await fs.promises.writeFile(tmpFile, JSON.stringify(params.params || {}))

    const { stdout, stderr } = await execAsync(
      `grpcurl -plaintext -d @ ${cleanUrl} ${params.serviceName}/${params.methodName} < ${tmpFile}`
    )
    
    if (stderr) {
      console.error('grpcurl stderr:', stderr)
      throw new Error(stderr)
    }

    // 解析响应
    const response = JSON.parse(stdout)

    return { success: true, data: response }
  } catch (error: any) {
    console.error('Failed to make RPC request:', error)
    return { 
      success: false, 
      error: error.message 
    }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
}) 