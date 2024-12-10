import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";

const execAsync = promisify(exec);

declare const __dirname: string;
declare const process: NodeJS.Process;

interface RpcRequest {
  jsonrpc: string;
  method: string;
  params: any;
  id: number | string;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.cwd(), 
      process.platform === 'darwin' 
        ? 'build/icons/icon.icns'
        : process.platform === 'win32'
          ? 'build/icons/icon.ico'
          : 'build/icons/icon.png'
    ),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// 获取 RPC 服务列表
ipcMain.handle("get-rpc-services", async (event, params) => {
  try {
    if (!params?.url) {
      throw new Error("URL is required");
    }

    const cleanUrl = params.url.toString().replace(/^(http|https):\/\//, "");
    console.log("Getting services for:", cleanUrl);

    const { stdout, stderr } = await execAsync(
      `grpcurl -plaintext ${cleanUrl} list`
    );

    if (stderr) {
      console.error("grpcurl stderr:", stderr);
      throw new Error(stderr);
    }

    // 解析服务列表
    const services = stdout
      .split("\n")
      .filter(Boolean) // 移除空行
      .map((name) => ({ name }));

    return { success: true, data: services };
  } catch (error: any) {
    console.error("Failed to get services:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// 获取 RPC 方法列表和类型定义
ipcMain.handle("get-rpc-methods", async (event, params) => {
  try {
    if (!params?.url || !params?.serviceName) {
      throw new Error("URL and serviceName are required");
    }

    const cleanUrl = params.url.toString().replace(/^(http|https):\/\//, "");
    console.log("Getting methods for service:", params.serviceName);

    // 获取服务定义
    const { stdout: serviceInfo, stderr: serviceErr } = await execAsync(
      `grpcurl -plaintext ${cleanUrl} describe ${params.serviceName}`
    );

    if (serviceErr) {
      console.error("grpcurl stderr:", serviceErr);
      throw new Error(serviceErr);
    }

    // 解析方法列表
    const methodRegex =
      /rpc\s+(\w+)\s*\(\s*\.([^\s]+)\s*\)\s*returns\s*\(\s*\.([^\s]+)/g;
    const methods = [];
    let match;

    while ((match = methodRegex.exec(serviceInfo)) !== null) {
      const [, methodName, inputType, outputType] = match;
      console.log(`Processing method: ${methodName}, input: ${inputType}`);

      // 获取请求消息类型的详细定义
      const { stdout: typeInfo, stderr: typeErr } = await execAsync(
        `grpcurl -plaintext ${cleanUrl} describe ${inputType}`
      );

      if (typeErr) {
        console.error(`Error getting type info for ${inputType}:`, typeErr);
        continue;
      }

      console.log(`Type info for ${inputType}:`, typeInfo);

      // 解析字段定义
      const fields = [];
      // 修改正则表达式以更准确地匹配字段
      const messageRegex = /message\s+\w+\s*{([^}]+)}/;
      const fieldRegex = /\s*(\w+)\s+(\w+)\s*=\s*(\d+)/g;

      const messageMatch = messageRegex.exec(typeInfo);
      if (messageMatch) {
        const messageContent = messageMatch[1];
        console.log("Message content:", messageContent);

        let fieldMatch;
        while ((fieldMatch = fieldRegex.exec(messageContent)) !== null) {
          const [, fieldType, fieldName, fieldNumber] = fieldMatch;
          console.log("Field match:", { fieldType, fieldName, fieldNumber });
          fields.push({
            name: fieldName,
            type: fieldType,
            number: parseInt(fieldNumber),
          });
        }
      }

      console.log("Parsed fields:", fields);

      // 生成示例输入参数
      const inputExample = {};
      for (const field of fields) {
        inputExample[field.name] = generateFieldValue(field.type, field.name);
      }

      console.log("Generated example:", inputExample);

      methods.push({
        name: methodName,
        inputType: inputType.split(".").pop(),
        outputType: outputType.split(".").pop(),
        inputExample,
      });
    }

    return { success: true, data: methods };
  } catch (error: any) {
    console.error("Failed to get methods:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// 生成示例数据
function generateExampleData(typeName: string, messages: Map<string, any[]>) {
  console.log("Generating example for type:", typeName);
  const messageFields = messages.get(typeName);
  if (!messageFields) {
    console.log("No fields found for type:", typeName);
    return {};
  }

  console.log("Fields found:", messageFields);
  const example = {};
  for (const field of messageFields) {
    example[field.name] = generateFieldValue(field.type);
  }
  return example;
}

// 生成字段值
function generateFieldValue(type: string): any {
  // 移除包名前缀和修饰符
  const cleanType = type.replace(/^repeated\s+/, "").replace(/^map<.+>/, "");
  const isRepeated = type.startsWith("repeated");
  const isMap = type.startsWith("map<");

  let value = null;
  switch (cleanType.toLowerCase()) {
    case "string":
      value = "example string";
      break;
    case "int32":
    case "int64":
    case "sint32":
    case "sint64":
    case "uint32":
    case "uint64":
    case "fixed32":
    case "fixed64":
      value = 123;
      break;
    case "double":
    case "float":
      value = 3.14;
      break;
    case "bool":
      value = true;
      break;
    case "bytes":
      value = "base64_encoded_data";
      break;
    case "timestamp":
      value = new Date().toISOString();
      break;
    case "duration":
      value = "1h30m";
      break;
    default:
      if (cleanType.toLowerCase().endsWith("type") || type.includes("enum")) {
        value = 1; // 枚举类型默认值
      } else {
        value = {}; // 其他消息类型
      }
  }

  if (isMap) {
    return { key1: value, key2: value };
  }
  return isRepeated ? [value, value] : value;
}

// 处理 RPC 请求
ipcMain.handle("rpc-request", async (event, params) => {
  try {
    if (!params?.url || !params?.serviceName || !params?.methodName) {
      throw new Error("URL, serviceName, and methodName are required");
    }

    const cleanUrl = params.url.toString().replace(/^(http|https):\/\//, "");
    console.log("Making RPC request:", {
      serviceName: params.serviceName,
      methodName: params.methodName,
      params: params.params,
    });

    // 将参数写入临时文件
    const tmpFile = path.join(app.getPath("temp"), "rpc-request.json");
    await fs.promises.writeFile(tmpFile, JSON.stringify(params.params || {}));

    // 构建完整的服务方法名
    const fullMethodName = `${params.serviceName}/${params.methodName}`;
    console.log("Full method name:", fullMethodName);

    const { stdout, stderr } = await execAsync(
      `grpcurl -plaintext -d @ ${cleanUrl} "${fullMethodName}" < ${tmpFile}`
    );

    if (stderr) {
      console.error("grpcurl stderr:", stderr);
      throw new Error(stderr);
    }

    // 解析响应
    const response = JSON.parse(stdout);

    return { success: true, data: response };
  } catch (error: any) {
    console.error("Failed to make RPC request:", error);
    return {
      success: false,
      error: error.message,
    };
  } finally {
    // 清理临时文件
    try {
      const tmpFile = path.join(app.getPath("temp"), "rpc-request.json");
      await fs.promises.unlink(tmpFile);
    } catch (error) {
      console.error("Failed to clean up temp file:", error);
    }
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
