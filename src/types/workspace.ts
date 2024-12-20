// 定义请求和响应的接口
export interface CreateWorkspaceRequest {
  name: string
}

export interface CreateWorkspaceResponse {
  id: string
  name: string
}

export interface CreateCollectionRequest {
  name: string
  workspace_id: string
}

export interface GetCollectionListResponse {
  list: Collection[]
}

export interface Collection {
  id: string
  name: string
  type?: string
  method?: string
  request_id?: string
  workspace_id: string
  collection_id: string
  folder_id?: string
  kind?: string
  children?: Collection[]
}

export interface GetAllWorkspaceResponse {
  list: Workspace[]
}

export interface Workspace {
  id: string
  name: string
  description: string
  owner_id: string
}
