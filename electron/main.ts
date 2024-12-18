import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import { join } from "path";

const execAsync = promisify(exec);

declare const __dirname: string;
declare const process: NodeJS.Process;

interface RpcRequest {
  jsonrpc: string;
  method: string;
  params: any;
  id: number | string;
}

interface ExampleResult {
  [key: string]: any;
}

function createWindow() {
  // 禁用 CoreText 警告
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
  app.commandLine.appendSwitch("no-sandbox");

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(
      process.cwd(),
      process.platform === "darwin"
        ? "build/icons/icon.icns"
        : process.platform === "win32"
        ? "build/icons/icon.ico"
        : "build/icons/icon.png"
    ),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  // 设置更严格的 CSP
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net; " +
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
            "img-src 'self' data: blob: https://cdn.jsdelivr.net; " +
            "font-src 'self' data: https://cdn.jsdelivr.net; " +
            "connect-src 'self' ws: wss: https://cdn.jsdelivr.net; " +
            "worker-src 'self' blob: https://cdn.jsdelivr.net;",
        ],
        "Cross-Origin-Opener-Policy": ["same-origin"],
        "Cross-Origin-Embedder-Policy": ["require-corp"],
      },
    });
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

    // 获取服务列表
    const { stdout, stderr } = await execAsync(
      `grpcurl -plaintext ${cleanUrl} list`
    );

    if (stderr) {
      console.error("grpcurl stderr:", stderr);
      throw new Error(stderr);
    }

    // 打印命令
    console.log("Executing command:", `grpcurl -plaintext ${cleanUrl} list`);
    // 解析服务列表
    const services = stdout
      .split("\n")
      .filter(Boolean)
      .map((name) => ({ name }));

    // 并行获取所有服务的方法列表
    const servicesWithMethods = await Promise.all(
      services.map(async (service) => {
        try {
          const { stdout: serviceInfo, stderr: serviceErr } = await execAsync(
            `grpcurl -plaintext ${cleanUrl} describe ${service.name}`
          );

          if (serviceErr) {
            console.error(
              `Error getting methods for ${service.name}:`,
              serviceErr
            );
            return null; // 返回 null 表示这个服务不可用
          }

          // 解析方法列表
          const methodRegex =
            /rpc\s+(\w+)\s*\(\s*\.([^\s]+)\s*\)\s*returns\s*\(\s*\.([^\s]+)/g;
          const methods = [];
          let match;

          while ((match = methodRegex.exec(serviceInfo)) !== null) {
            const [, methodName, inputType, outputType] = match;
            methods.push({
              name: methodName,
              inputType: inputType,
              outputType: outputType,
              fullName: `${service.name}/${methodName}`,
            });
          }

          // 只返回服务名和方法列表
          if (methods.length > 0) {
            return {
              name: service.name,
              methods,
            };
          }
          return null; // 没有方法的服务返回 null
        } catch (error) {
          console.error(`Failed to get methods for ${service.name}:`, error);
          return null; // 出错的服务返回 null
        }
      })
    );

    // 过滤掉 null 值，只保留有效服务
    const validServices = servicesWithMethods.filter(Boolean);

    return { success: true, data: validServices };
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

    const { stdout: serviceInfo, stderr: serviceErr } = await execAsync(
      `grpcurl -plaintext ${cleanUrl} describe ${params.serviceName}`
    );

    // 打印命令
    console.log(
      "Executing command:",
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
      console.log(`Found method: ${methodName}`);
      methods.push({
        name: methodName,
        inputType: inputType,
        outputType: outputType,
        fullName: `${params.serviceName}/${methodName}`,
      });
    }

    console.log("Parsed methods:", methods);
    return { success: true, data: methods };
  } catch (error: any) {
    console.error("Failed to get methods:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// 添加一些辅助函数来生成更真实数据
function generateRandomString(prefix: string = ""): string {
  const adjectives = [
    "happy",
    "clever",
    "bright",
    "swift",
    "calm",
    "gentle",
    "bold",
  ];
  const nouns = [
    "user",
    "customer",
    "product",
    "service",
    "item",
    "account",
    "profile",
  ];
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${prefix}${randomAdjective}_${randomNoun}`;
}

function generateRandomEmail(): string {
  const domains = ["example.com", "test.org", "demo.net", "sample.io"];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `${generateRandomString()}@${randomDomain}`;
}

function generateRandomDate(): string {
  const start = new Date(2020, 0, 1);
  const end = new Date();
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString();
}

function generateRandomPhoneNumber(): string {
  return `+1${Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0")}`;
}

function generateRandomUrl(): string {
  const protocols = ["http", "https"];
  const domains = ["api", "service", "app", "dev", "test"];
  const tlds = ["com", "org", "io", "net"];

  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const tld = tlds[Math.floor(Math.random() * tlds.length)];

  return `${protocol}://${domain}.${tld}`;
}

function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}
//  generateFieldValue
function generateFieldValue(type: string, fieldName: string = ""): any {
  // 移除包名前缀和修饰符
  const cleanType = type.replace(/^repeated\s+/, "").replace(/^map<.+>/, "");
  const isRepeated = type.startsWith("repeated");
  const isMap = type.startsWith("map<");

  // 根据字段名推测类型
  const nameLower = fieldName.toLowerCase();

  let value: any;

  // 首先根据字段名判断
  if (nameLower.includes("email")) {
    value = generateRandomEmail();
  } else if (nameLower.includes("phone")) {
    value = generateRandomPhoneNumber();
  } else if (nameLower.includes("url") || nameLower.includes("link")) {
    value = generateRandomUrl();
  } else if (nameLower.includes("id")) {
    value = generateRandomId();
  } else if (nameLower.includes("date") || nameLower.includes("time")) {
    value = generateRandomDate();
  } else if (nameLower.includes("name")) {
    value = generateRandomString("name_");
  } else {
    // 如果字段名没有特殊含义，则根据类型生成
    switch (cleanType.toLowerCase()) {
      case "string":
        if (nameLower.includes("description")) {
          value = `This is a sample description for ${generateRandomString()}`;
        } else if (nameLower.includes("title")) {
          value = `Sample Title: ${generateRandomString()}`;
        } else {
          value = generateRandomString();
        }
        break;
      case "int32":
      case "int64":
      case "sint32":
      case "sint64":
      case "uint32":
      case "uint64":
      case "fixed32":
      case "fixed64":
        if (nameLower.includes("age")) {
          value = Math.floor(Math.random() * 80) + 18;
        } else if (nameLower.includes("year")) {
          value = Math.floor(Math.random() * 23) + 2000;
        } else if (
          nameLower.includes("count") ||
          nameLower.includes("number")
        ) {
          value = Math.floor(Math.random() * 1000);
        } else {
          value = Math.floor(Math.random() * 10000);
        }
        break;
      case "double":
      case "float":
        if (nameLower.includes("price") || nameLower.includes("amount")) {
          value = +(Math.random() * 1000).toFixed(2);
        } else if (nameLower.includes("rate") || nameLower.includes("ratio")) {
          value = +Math.random().toFixed(4);
        } else {
          value = +Math.random().toFixed(2);
        }
        break;
      case "bool":
        value = Math.random() > 0.5;
        break;
      case "bytes":
        value = "base64_encoded_data_" + generateRandomId();
        break;
      case "timestamp":
        value = generateRandomDate();
        break;
      case "duration":
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        value = `${hours}h${minutes}m`;
        break;
      default:
        if (cleanType.toLowerCase().endsWith("type") || type.includes("enum")) {
          value = Math.floor(Math.random() * 5); // 枚举类型随机值
        } else {
          value = {}; // 其他消息类型
        }
    }
  }

  if (isMap) {
    const result: ExampleResult = {};
    for (let i = 1; i <= 2; i++) {
      result[`key${i}`] = value;
    }
    return result;
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
      metadata: params.metadata,
      metadataArgs: params.metadataArgs
    });

    // 将参数写入临时文件
    const tmpFile = path.join(app.getPath("temp"), "rpc-request.json");
    await fs.promises.writeFile(tmpFile, JSON.stringify(params.params || {}));

    // 构建完整的服务方法名
    const fullMethodName = `${params.serviceName}/${params.methodName}`;

    // 构建命令数组，包含元数据参数
    const args = [
      'grpcurl',
      '-plaintext',
      ...(params.metadataArgs || []), // 添加元数据参数
      '-d', '@',
      cleanUrl,
      `"${fullMethodName}"`
    ];

    // 执行带调试信息的请求
    const { stdout, stderr } = await execAsync(
      `${args.join(' ')} < ${tmpFile}`,
      {
        env: {
          ...process.env,
          GRPC_GO_LOG_SEVERITY_LEVEL: "info",
          GRPC_GO_LOG_VERBOSITY_LEVEL: "99",
        },
      }
    );

    // 解析响应和调试信息
    let response;
    try {
      response = JSON.parse(stdout);
    } catch {
      response = stdout;
    }

    // 确保返回所有必要的信息
    return {
      success: true,
      data: response,
      debug: stderr || "", 
      command: args.join(' '),
    };
  } catch (error: any) {
    console.error("Failed to make RPC request:", error);
    return {
      success: false,
      error: error.message,
      debug: error.stderr || error.message || "",
      command: "",
    };
  }
});

// IPC 处理程序
ipcMain.handle("rpc:list-services", async (event, params) => {
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
      .filter(Boolean)
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

ipcMain.handle("rpc:invoke", async (event, params) => {
  try {
    if (!params?.url || !params?.method) {
      throw new Error("URL and method are required");
    }

    const cleanUrl = params.url.toString().replace(/^(http|https):\/\//, "");
    console.log("Making RPC request:", {
      method: params.method,
      params: params.params,
    });

    // 将参数写入临时文件
    const tmpFile = path.join(app.getPath("temp"), "rpc-request.json");
    await fs.promises.writeFile(tmpFile, JSON.stringify(params.params || {}));

    const { stdout, stderr } = await execAsync(
      `grpcurl -plaintext -d @ ${cleanUrl} "${params.method}" < ${tmpFile}`
    );

    if (stderr) {
      console.error("grpcurl stderr:", stderr);
      throw new Error(stderr);
    }

    // 解析响应
    const response = JSON.parse(stdout);

    return {
      success: true,
      data: response,
      headers: {}, // 如果需要的话可以添加响应头
    };
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

// 添加 get-rpc-example 处理程序
ipcMain.handle("get-rpc-example", async (event, params) => {
  try {
    if (!params?.url || !params?.method) {
      throw new Error("URL and method are required");
    }

    const cleanUrl = params.url.toString().replace(/^(http|https):\/\//, "");
    const methodParts = params.method.split(".");
    const serviceName = methodParts.slice(0, -1).join(".");
    const methodName = methodParts[methodParts.length - 1];

    console.log("Generating example for:", { serviceName, methodName });

    // 获取服务描述
    const { stdout: serviceInfo, stderr: serviceErr } = await execAsync(
      `grpcurl -plaintext ${cleanUrl} describe ${serviceName}`
    );

    if (serviceErr) {
      console.error("grpcurl stderr:", serviceErr);
      throw new Error(serviceErr);
    }

    // 找到方法的输入类型
    const methodRegex = new RegExp(
      `rpc\\s+${methodName}\\s*\\(\\s*\\.([^\\s]+)\\s*\\)\\s*returns`
    );
    const match = methodRegex.exec(serviceInfo);
    if (!match) {
      throw new Error(
        `Method ${methodName} not found in service ${serviceName}`
      );
    }

    const inputType = match[1];
    console.log("Input type:", inputType);

    // 获取输入类型的描述
    const { stdout: typeInfo, stderr: typeErr } = await execAsync(
      `grpcurl -plaintext ${cleanUrl} describe ${inputType}`
    );

    if (typeErr) {
      console.error("grpcurl stderr:", typeErr);
      throw new Error(typeErr);
    }

    // 解析字段定义
    const fields = [];
    const messageRegex = /message\s+\w+\s*{([^}]+)}/;
    const fieldRegex = /\s*(\w+)\s+(\w+)\s*=\s*(\d+)/g;

    const messageMatch = messageRegex.exec(typeInfo);
    if (messageMatch) {
      const messageContent = messageMatch[1];
      let fieldMatch;
      while ((fieldMatch = fieldRegex.exec(messageContent)) !== null) {
        const [, type, name] = fieldMatch;
        fields.push({ type, name });
      }
    }

    console.log("Parsed fields:", fields);

    // 生成示例数据
    const example: ExampleResult = {};
    for (const field of fields) {
      example[field.name] = generateFieldValue(field.type);
    }

    console.log("Generated example:", example);
    return { success: true, data: example };
  } catch (error: any) {
    console.error("Failed to generate example:", error);
    return {
      success: false,
      error: error.message,
    };
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
