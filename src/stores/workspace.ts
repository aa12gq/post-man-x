import { defineStore } from 'pinia';
import { PersistenceOptions } from 'pinia-plugin-persistedstate';
import { ref } from 'vue';
import { ApiResponse, get, post } from '../api/fetch';
import router from '../router';
import { Collection, CreateWorkspaceResponse, GetCollectionListResponse } from '../types/workspace';
import { displayNotification } from '../utils/message';


export const useWorkspaceStore = defineStore('workspace', () => {
  // 创建workspace页面
  const createWorkspacePage = ref<string>('blank');
  // 当前workspace的collection列表
  const collectionList = ref<Collection[]>([]);
  // 当前workspace信息
  const currentWorkspaceInfo = ref<CreateWorkspaceResponse>({
    id: '',
    name: '',
  });


  const folderName = ref<string>('');
  const collectionName = ref<string>('');
  const createWorkSpaceName = ref<string>('');
  function setCreateWorkspacePage(page: string) {
    createWorkspacePage.value = page;
  }

  const initWorkspace = async () => {
    handleGetCollectionList()
  }

  const handleCreateWorkspace = async () => {
    try {
      const resp = await post<ApiResponse<CreateWorkspaceResponse>>('/workspaces/create', {
        name: createWorkSpaceName.value,
      })
      if (resp.success) {
        currentWorkspaceInfo.value.id = resp.data.id;
        currentWorkspaceInfo.value.name = resp.data.name;
        router.push({ path: '/request' });
        displayNotification("创建成功", 'success')
      }
    } catch (error) {
      displayNotification("创建失败", 'error')
    }
  }

  const handleAddFolder = async () => {
    console.log("111");
  }

  // 获取collection列表
  const handleGetCollectionList = async () => {
    console.log(currentWorkspaceInfo.value);
    try {
      const resp = await get<ApiResponse<GetCollectionListResponse>>('/collections/list', {
        workspace_id: currentWorkspaceInfo.value.id,
      })
      if (resp.success) {
        collectionList.value = resp.data.list;
      }

    } catch (error) {
      console.log(error);
    }
  }

  const handleCreateCollection = async () => {
    try {
      const resp = await post<ApiResponse<null>>('/collections/create', {
        name: collectionName.value,
        workspace_id: currentWorkspaceInfo.value.id,
      });
      console.log(resp);
      if (resp.success) {
        handleGetCollectionList();
        displayNotification("创建成功", 'success')
      }
    } catch (error) {
      console.log(error);
      displayNotification("创建失败", 'error')
    }
  }

  return {
    folderName,
    createWorkSpaceName,
    collectionName,
    currentWorkspaceInfo,
    collectionList,
    createWorkspacePage,
    setCreateWorkspacePage,
    handleCreateWorkspace,
    handleAddFolder,
    handleGetCollectionList,
    initWorkspace,
    handleCreateCollection
  };
}, {
  persist: {
    key: "workspace-store",
    storage: localStorage,
    paths: ["workspaceInfo"],
  } as PersistenceOptions,
});
