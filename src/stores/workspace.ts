import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiResponse, get, post } from '../api/fetch'
import router from '../router'
import {
  Collection,
  CreateWorkspaceResponse,
  GetAllWorkspaceResponse,
  GetCollectionListResponse,
} from '../types/workspace'
import { displayNotification } from '../utils/message'

export const useWorkspaceStore = defineStore(
  'workspace',
  () => {
    // 创建workspace页面
    const createWorkspacePage = ref<string>('blank')
    // 当前workspace的collection列表
    const collectionList = ref<Collection[]>([])
    // 当前workspace信息
    const currentWorkspaceInfo = ref<CreateWorkspaceResponse>({
      id: '',
      name: '',
    })

    const selectedCollectionInfo = ref<{
      id: string
      collection_id: string
      folder_id: string
      name: string
    }>({
      id: '',
      collection_id: '',
      folder_id: '',
      name: '',
    })

    // 弹窗显示
    const dialogVisible = ref({
      addFolder: false,
    })

    // 当前workspace的文件夹列表
    const folderList = ref<any[]>([])

    // workspace列表
    const workspaceList = ref<GetAllWorkspaceResponse[]>([])

    const folderName = ref<string>('')
    const collectionName = ref<string>('')
    const createWorkSpaceName = ref<string>('')
    function setCreateWorkspacePage(page: string) {
      createWorkspacePage.value = page
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
          currentWorkspaceInfo.value.id = resp.data.id
          currentWorkspaceInfo.value.name = resp.data.name
          router.push({ path: '/request' })
          displayNotification('创建成功', 'success')
        }
      } catch (error) {
        displayNotification('创建失败', 'error')
      }
    }

    const handleAddFolder = async () => {
      try {
        const resp = await post<ApiResponse<null>>('/folder/create', {
          name: selectedCollectionInfo.value.name,
          collection_id: selectedCollectionInfo.value.collection_id,
          parent_id: selectedCollectionInfo.value.folder_id,
        })
        console.log(resp)
        if (resp.success) {
          initWorkspace()
          displayNotification('创建成功', 'success')
          resetSelectedCollectionInfo()
          dialogVisible.value.addFolder = false
        }
      } catch (error) {
        console.log(error)
        displayNotification('创建失败', 'error')
        resetSelectedCollectionInfo()
        dialogVisible.value.addFolder = false
      }
    }

    const resetSelectedCollectionInfo = () => {
      selectedCollectionInfo.value = {
        id: '',
        collection_id: '',
        folder_id: '',
        name: '',
      }
    }

    // 获取collection列表
    const handleGetCollectionList = async () => {
      try {
        const resp = await get<ApiResponse<GetCollectionListResponse>>('/collections/list', {
          workspace_id: currentWorkspaceInfo.value.id,
        })
        console.log(resp)
        if (resp.success) {
          collectionList.value = resp.data.list
        }
      } catch (error) {
        console.log(error)
      }
    }

    const handleCreateCollection = async () => {
      try {
        console.log(currentWorkspaceInfo.value.id)
        const resp = await post<ApiResponse<null>>('/collections/create', {
          name: collectionName.value,
          workspace_id: String(currentWorkspaceInfo.value.id),
        })
        console.log(resp)
        if (resp.success) {
          handleGetCollectionList()
          displayNotification('创建成功', 'success')
        }
      } catch (error) {
        console.log(error)
        displayNotification('创建失败', 'error')
      }
    }

    // 获取所有工作空间
    const handleGetAllWorkspaceList = async () => {
      try {
        const resp = await get<ApiResponse<GetAllWorkspaceResponse>>('/workspaces/list')
        if (resp.success) {
          workspaceList.value = resp.data.list
        }
      } catch (error) {
        console.log(error)
      }
    }

    // 获取文件夹列表
    const handleGetFolderList = async (collectionId: string) => {
      console.log(collectionId)
      try {
        const resp = await get<ApiResponse<null>>('/folder/list', {
          collection_id: collectionId,
        })
        console.log(resp)
        if (resp.success) {
          console.log(resp.data.list)
          folderList.value = resp.data.list
        }
      } catch (error) {
        console.log(error)
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
      selectedCollectionInfo,
      dialogVisible,
      setCreateWorkspacePage,
      handleCreateWorkspace,
      handleAddFolder,
      handleGetCollectionList,
      initWorkspace,
      handleCreateCollection,
      handleGetAllWorkspaceList,
      handleGetFolderList,
    }
  },
  {
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
      ],
    },
  },
)
