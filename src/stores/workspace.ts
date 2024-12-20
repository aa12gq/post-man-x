import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ApiResponse, get, post } from '../api/fetch';
import router from '../router';
import { Collection, CreateWorkspaceResponse, GetAllWorkspaceResponse, GetCollectionListResponse } from '../types/workspace';
import { displayNotification } from '../utils/message';


export const useWorkspaceStore = defineStore('workspace', () => {
  // 创建workspace页面
  const createWorkspacePage = ref<string>('blank');
  // 当前workspace的collection列表
  const collectionList = ref<Collection[]>([]);
  // 当前workspace信息
  const currentWorkspaceInfo = ref<CreateWorkspaceResponse>({
    id: "",
    name: "",
  });

  // 当前workspace的文件夹列表
  const folderList = ref<any[]>([]);

  // workspace列表
  const workspaceList = ref<GetAllWorkspaceResponse[]>([]);

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
      console.log(currentWorkspaceInfo.value.id);
      const resp = await post<ApiResponse<null>>('/collections/create', {
        name: collectionName.value,
        workspace_id: String(currentWorkspaceInfo.value.id),
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

  // 获取所有工作空间
  const handleGetAllWorkspaceList = async () => {
    try {
      const resp = await get<ApiResponse<GetAllWorkspaceResponse>>('/workspaces/list');
      if (resp.success) {
        workspaceList.value = resp.data.list;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // 创建文件夹
  const handleCreateFolder = async (name: string, collectionId: string) => {
    try {
      const resp = await post<ApiResponse<null>>('/folder/create', {
        name: name,
        collection_id: collectionId,
      });
      if (resp.success) {
        displayNotification("创建成功", 'success')
      }
    } catch (error) {
      console.log(error);
      displayNotification("创建失败", 'error')
    }
  }

  // 获取文件夹列表
  const handleGetFolderList = async (collectionId: string) => {
    console.log(collectionId);
    try {
      const resp = await get<ApiResponse<null>>('/folder/list', {
        collection_id: collectionId,
      });
      console.log(resp);
      if (resp.success) {
        console.log(resp.data.list);
        folderList.value = resp.data.list;
      }
    } catch (error) {
      console.log(error);
    }
  }

  return {
    folderName,
    createWorkSpaceName,
    collectionName,
    currentWorkspaceInfo,
    collectionList,
    workspaceList,
    folderList,
    createWorkspacePage,
    setCreateWorkspacePage,
    handleCreateWorkspace,
    handleAddFolder,
    handleGetCollectionList,
    initWorkspace,
    handleCreateCollection,
    handleGetAllWorkspaceList,
    handleCreateFolder,
    handleGetFolderList
  };
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'createWorkspacePage',
        storage: localStorage,
        paths: ['createWorkspacePage'],
      },
      {
        key: 'currentWorkspaceInfo',
        storage: localStorage,
        paths: ['currentWorkspaceInfo'],
      },
    ]
  },
});
