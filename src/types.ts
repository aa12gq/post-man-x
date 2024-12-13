export interface RequestTab {
  id: string;
  name: string;
  type: "http" | "rpc";
  url: string;
  method?: string;
  params: any;
  headers?: Record<string, string>;
  metadata?: Record<string, string>;
  authType: "noauth" | "basic" | "bearer";
  basicAuth?: {
    username: string;
    password: string;
  };
  bearerToken?: string;
}

export interface ResponseData {
  status: number | string;
  data: any;
  headers: Record<string, string>;
}

export interface HistoryItem {
  id: string;
  type: "http" | "rpc";
  url: string;
  method?: string;
  serviceMethod?: string;
  params?: any;
  timestamp: number;
  response: ResponseData;
  requestMessage: string;
  debugInfo: string;
  debugCommand: string;
}

export interface Method {
  name: string;
  requestType: string;
  responseType: string;
  requestStream: boolean;
  responseStream: boolean;
}

export interface Service {
  name: string;
  methods: Method[];
}

export interface BasicAuth {
  username: string;
  password: string;
}

export interface AuthConfig {
  type: "noauth" | "basic" | "bearer";
  basicAuth?: BasicAuth;
  bearerToken?: string;
}

export interface RequestOptions {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  params?: any;
  metadata?: Record<string, string>;
  authType?: "noauth" | "basic" | "bearer";
  basicAuth?: BasicAuth;
  bearerToken?: string;
  body?: any;
}

export interface RequestMessage {
  url: string;
  method: string;
  headers: Record<string, string>;
  params?: any;
}

export interface Header {
  name: string;
  value: string;
  enabled: boolean;
}

export interface FavoriteRequest {
  id: string;
  name: string;
  type: "http" | "rpc";
  protocol: string;
  url: string;
  method: string;
  rpcMethod?: string;
  params: any;
  headers: Header[];
}

export interface Settings {
  theme: "light" | "dark" | "system";
  fontSize: number;
  autoSave: boolean;
  maxHistoryItems: number;
}
