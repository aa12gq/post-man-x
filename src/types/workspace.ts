// 定义请求和响应的接口
export interface CreateWorkspaceRequest {
  name: string;
}

export interface CreateWorkspaceResponse {
  id: string;
  name: string;
}

export interface CreateCollectionRequest {
  name: string;
  workspace_id: string;
}

export interface GetCollectionListResponse {
  list: Collection[];
}

export interface Collection {
  id: string;
  name: string;
  workspace_id: string;
  collection_id: string;
  created_at: string;
}