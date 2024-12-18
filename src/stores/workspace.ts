import { defineStore } from 'pinia';
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import { ref } from 'vue';
import { ApiResponse, get, post } from '../api/fetch';
import router from '../router';
import { displayNotification } from '../utils/message';

interface WorkspaceSettings {
  createWorkspacePage: string;
}

export const useWorkspaceStore = defineStore('workspace', () => {

  const workspaceConfig = ref<WorkspaceSettings>({
    createWorkspacePage: 'blank',
  });

  const currentWorkspaceInfo = ref<CreateWorkspaceResponse>({
    id: '',
    name: '',
  });


  const folderName = ref<string>('');
  const collectionName = ref<string>('');
  const createWorkSpaceName = ref<string>('');
  function setCreateWorkspacePage(page: string) {
    workspaceConfig.value.createWorkspacePage = page;
  }

  const initWorkspace = async () => {
    getCollectionList()
  }

  const createWorkspace = async () => {
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
    try {
      const resp = await post<ApiResponse<null>>('/collections/create', {
        name: collectionName.value,
        workspace_id: currentWorkspaceInfo.value.id,
      });
      console.log(resp);
      if (resp.success) {
        getCollectionList();
        displayNotification("创建成功", 'success')
      }
    } catch (error) {
      console.log(error);
      displayNotification("创建失败", 'error')
    }
  }

  // 获取collection列表
  const getCollectionList = async () => {
    console.log(currentWorkspaceInfo.value);
    try {
      const resp = await get<ApiResponse<GetCollectionListResponse>>('/collections/list', {
        workspace_id: currentWorkspaceInfo.value.id,
      })
      console.log(resp);

    } catch (error) {
      console.log(error);
    }
  }

  return {
    workspaceConfig,
    folderName,
    createWorkSpaceName,
    collectionName,
    currentWorkspaceInfo,
    setCreateWorkspacePage,
    createWorkspace,
    handleAddFolder,
    getCollectionList,
    initWorkspace
  };
}, {
  persist: {
    key: "workspace-store",
    storage: localStorage,
    paths: ["workspaceConfig"],
  } as PersistenceOptions,
});
