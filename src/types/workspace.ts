// 定义请求和响应的接口
export interface CreateWorkspaceRequest {
  name: string
}

export interface CreateWorkspaceResponse {
  id: string
  name: string
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

export interface CreateCollectionRequest {
  name: string
  workspace_id: string
  description: string
  protocol: string
}

export interface GetCollectionListResponse {
  list: Collection[]
}

export interface Collection {
  id: string
  name: string
  protocol: string
  owner: string
  description: string
  workspace_id: string
  collection_id: string
  members_count: number
  created_at: string
}

export interface EditWorkspaceRequest {
  id: string
  name: string
  description: string
  owner_id: string
}

export interface DeleteWorkspaceRequest {
  id: string
}

//   request_id?: string
//   workspace_id: string
//   collection_id: string
//   folder_id?: string
//   kind?: string
//   children?: Collection[]
// }
