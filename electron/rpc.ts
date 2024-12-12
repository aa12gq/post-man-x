import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

const execAsync = promisify(exec)

export async function listServices(url: string) {
  try {
    const cleanUrl = url.toString().replace(/^(http|https):\/\//, '')
    console.log('Getting services for:', cleanUrl)

    const { stdout, stderr } = await execAsync(`grpcurl -plaintext ${cleanUrl} list`)

    if (stderr) {
      console.error('grpcurl stderr:', stderr)
      throw new Error(stderr)
    }

    // 打印命令
    console.log("rpc.ts: Executing command:", `grpcurl -plaintext ${cleanUrl} list`);

    // 解析服务列表
    const services = stdout
      .split('\n')
      .filter(Boolean) // 移除空行
      .map(name => ({ 
        name,
        methods: [] // 初始化空的方法列表
      }))

    console.log('Parsed services:', services)
    return services
  } catch (error) {
    console.error('Error listing services:', error)
    throw error
  }
}

export async function getMethods(url: string, serviceName: string) {
  try {
    const cleanUrl = url.toString().replace(/^(http|https):\/\//, '')
    console.log('Getting methods for service:', serviceName)

    const { stdout: serviceInfo, stderr: serviceErr } = await execAsync(
      `grpcurl -plaintext ${cleanUrl} describe ${serviceName}`
    )

    // 打印命令
    console.log("rpc.ts: Executing command:", `grpcurl -plaintext ${cleanUrl} describe ${serviceName}`);

    if (serviceErr) {
      console.error('grpcurl stderr:', serviceErr)
      throw new Error(serviceErr)
    }

    // 解析方法列表
    const methodRegex = /rpc\s+(\w+)\s*\(\s*\.([^\s]+)\s*\)\s*returns\s*\(\s*\.([^\s]+)/g
    const methods = []
    let match

    while ((match = methodRegex.exec(serviceInfo)) !== null) {
      const [, methodName, inputType, outputType] = match
      methods.push({
        name: methodName,
        inputType: inputType.split('.').pop(),
        outputType: outputType.split('.').pop()
      })
    }

    return methods
  } catch (error) {
    console.error('Error getting methods:', error)
    throw error
  }
}

export async function invokeMethod(url: string, method: string, params: any, metadata?: any) {
  try {
    const cleanUrl = url.toString().replace(/^(http|https):\/\//, '')
    
    // 将参数写入临时文件
    const tmpFile = path.join(app.getPath('temp'), 'rpc-request.json')
    await fs.promises.writeFile(tmpFile, JSON.stringify(params || {}))

    // 打印命令
    console.log("rpc.ts: Executing command:", `grpcurl -plaintext -d @ ${cleanUrl} "${method}" < ${tmpFile}`);

    const { stdout, stderr } = await execAsync(
      `grpcurl -plaintext -d @ ${cleanUrl} "${method}" < ${tmpFile}`
    )

    if (stderr) {
      console.error('grpcurl stderr:', stderr)
      throw new Error(stderr)
    }

    // 解析响应
    const response = JSON.parse(stdout)
    return response
  } catch (error) {
    console.error('Error invoking method:', error)
    throw error
  } finally {
    // 清理临时文件
    try {
      const tmpFile = path.join(app.getPath('temp'), 'rpc-request.json')
      await fs.promises.unlink(tmpFile)
    } catch (error) {
      console.error('Failed to clean up temp file:', error)
    }
  }
} 