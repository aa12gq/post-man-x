// 定义请求和响应的接口
interface CreateWorkspaceRequest {
  name: string;
}

interface CreateWorkspaceResponse {
  id: string;
  name: string;
}

interface CreateCollectionRequest {
  name: string;
  workspace_id: string;
}

interface GetCollectionListResponse {
  collections: Collection[];
}

interface Collection {
  id: string;
  name: string;
  workspace_id: string;
  collection_id: string;
  created_at: string;
}