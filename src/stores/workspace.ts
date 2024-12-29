import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ApiResponse, del, get, post, put } from '../api/fetch'
import {
  Collection,
  CreateCollectionRequest,
  CreateWorkspaceRequest,
  CreateWorkspaceResponse,
  DeleteWorkspaceRequest,
  EditWorkspaceRequest,
  GetAllWorkspaceResponse,
  GetCollectionListResponse,
  Workspace,
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
    // 创建workspace数据
    const createWorkspaceData = ref<CreateWorkspaceRequest>({
      name: '',
    })

    // 是否正在加载
    const isLoading = ref<boolean>(false)
    const selectedCollectionInfo = ref<{
      id: string
      collection_id: string
      folder_id: string
      name: string
      type: string
    }>({
      id: '',
      collection_id: '',
      folder_id: '',
      name: '',
      type: '',
    })

    // 弹窗显示
    const dialogVisible = ref({
      // 添加文件夹
      addFolder: false,
      // 添加request
      addRequest: false,
      // 编辑workspace
      editWorkspace: false,
      // 创建workspace
      createWorkspace: false,
      // 创建project
      createProject: false,
      // 删除project
      deleteProject: false,
    })

    // 创建project数据
    const createProjectData = ref<CreateCollectionRequest>({
      name: '',
      description: '',
      workspace_id: '',
      protocol: 'gRPC',
    })
    // 删除project的id
    const deleteProjectId = ref<string>('')

    // 当前workspace的文件夹列表
    const folderList = ref<any[]>([])

    // workspace列表
    const workspaceList = ref<Workspace[]>([])
    // 文件夹名称
    const folderName = ref<string>('')
    // collection名称
    const collectionName = ref<string>('')
    // workspace名称
    const createWorkSpaceName = ref<string>('')

    function setCreateWorkspacePage(page: string) {
      createWorkspacePage.value = page
    }

    const editWorkspaceData = ref<EditWorkspaceRequest>({
      id: '',
      name: '',
      description: '',
      owner_id: '',
    })

    const initWorkspace = () => {
      // handleGetAllWorkspaceList() // 获取所有workspace
      // handleGetCollectionList() // 获取collection列表
    }

    const handleCreateWorkspace = async () => {
      try {
        const result = await post<ApiResponse<CreateWorkspaceResponse>>('/workspaces/create', {
          name: createWorkspaceData.value.name,
        })
        console.log(result)
        if (result.success) {
          handleGetAllWorkspaceList()
          dialogVisible.value.createWorkspace = false
          createWorkspaceData.value.name = ''
          displayNotification('创建成功', 'success')
        }
      } catch (error) {
        displayNotification('创建失败', 'error')
        createWorkspaceData.value.name = ''
        dialogVisible.value.createWorkspace = false
      }
    }

    const handleAddFolder = async () => {
      try {
        const resp = await post<ApiResponse<null>>('/folder/create', {
          name: selectedCollectionInfo.value.name,
          collection_id: selectedCollectionInfo.value.collection_id,
          folder_id: selectedCollectionInfo.value.folder_id,
        })
        console.log(resp)
        if (resp.success) {
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
        type: '',
      }
    }

    // 获取collection列表
    const handleGetCollectionList = async (workspaceId: string, workspaceName?: string) => {
      isLoading.value = true
      currentWorkspaceInfo.value.id = workspaceId
      currentWorkspaceInfo.value.name = workspaceName || ''
      try {
        const resp = await get<ApiResponse<GetCollectionListResponse>>('/collections/list', {
          workspace_id: workspaceId,
        })
        if (resp.success) {
          collectionList.value = resp.data.list
          isLoading.value = false
        }
      } catch (error) {
        isLoading.value = false
        console.log(error)
      }
    }

    const handleCreateCollection = async () => {
      try {
        const resp = await post<ApiResponse<null>>('/collections/create', {
          name: createProjectData.value.name,
          workspace_id: String(currentWorkspaceInfo.value.id),
          description: createProjectData.value.description,
          protocol: createProjectData.value.protocol,
        })
        if (resp.success) {
          handleGetCollectionList(currentWorkspaceInfo.value.id)
          dialogVisible.value.createProject = false
          createProjectData.value = {
            name: '',
            description: '',
            workspace_id: '',
            protocol: '',
          }
          displayNotification('创建成功', 'success')
        }
      } catch (error) {
        createProjectData.value = {
          name: '',
          description: '',
          workspace_id: '',
          protocol: '',
        }
        dialogVisible.value.createProject = false
        displayNotification('创建失败', 'error')
      }
    }

    // 获取所有工作空间
    const handleGetAllWorkspaceList = async () => {
      try {
        const result = await get<ApiResponse<GetAllWorkspaceResponse>>('/workspaces/list')
        if (result.success) {
          workspaceList.value = result.data.list
        }
      } catch (error) {
        console.log(error)
      }
    }

    // 获取文件夹列表
    const handleGetFolderList = async (collectionId: string) => {
      console.log(collectionId)
      try {
        const result = await get<ApiResponse<null>>('/folder/list', {
          collection_id: collectionId,
        })
        console.log(result)
        if (result.success) {
          console.log(result.data.list)
          folderList.value = result.data.list
        }
      } catch (error) {
        console.log(error)
      }
    }

    // 创建request
    const handleCreateRequest = async () => {
      try {
        const data = {
          name: selectedCollectionInfo.value.name || '',
          collection_id: selectedCollectionInfo.value.collection_id,
          folder_id: selectedCollectionInfo.value.folder_id,
          method: 'GET',
          type: selectedCollectionInfo.value.type,
        }
        const result = await post<ApiResponse<null>>('/request/create', data)
        if (result.success) {
          displayNotification('创建成功', 'success')
          resetSelectedCollectionInfo()
        }
      } catch (error) {
        console.log(error)
        displayNotification('创建失败', 'error')
      }
    }

    const handleDeleteWorkspace = async (workspaceId: string) => {
      try {
        const data: DeleteWorkspaceRequest = {
          id: workspaceId,
        }
        const result = await del<ApiResponse<null>>('/workspaces/delete', data)
        console.log(result)
        if (result.success) {
          handleGetAllWorkspaceList()
          displayNotification('删除成功', 'success')
        }
      } catch (error) {
        console.log(error)
      }
    }

    const handleEditWorkspace = async () => {
      try {
        console.log(editWorkspaceData.value)
        const result = await put<ApiResponse<null>>('/workspaces/edit', editWorkspaceData.value)
        if (result.success) {
          handleGetAllWorkspaceList()
          dialogVisible.value.editWorkspace = false
          editWorkspaceData.value.name = ''
          displayNotification('编辑成功', 'success')
        }
      } catch (error) {
        displayNotification('编辑失败', 'error')
        dialogVisible.value.editWorkspace = false
        editWorkspaceData.value.name = ''
      }
    }

    const handleDeleteCollection = async () => {
      try {
        const result = await del<ApiResponse<null>>('/collections/delete', {
          id: deleteProjectId.value,
        })
        if (result.success) {
          displayNotification('删除成功', 'success')
          dialogVisible.value.deleteProject = false
          deleteProjectId.value = ''
          handleGetCollectionList(currentWorkspaceInfo.value.id)
        }
      } catch (error) {
        dialogVisible.value.deleteProject = false
        deleteProjectId.value = ''
        displayNotification('删除失败', 'error')
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
      isLoading,
      createWorkspacePage,
      selectedCollectionInfo,
      dialogVisible,
      editWorkspaceData,
      createWorkspaceData,
      createProjectData,
      deleteProjectId,
      initWorkspace, // 初始化workspace
      setCreateWorkspacePage, // 设置创建workspace页面
      handleCreateWorkspace, // 创建workspace
      handleGetAllWorkspaceList, // 获取所有workspace
      handleDeleteWorkspace, // 删除workspace
      handleEditWorkspace, // 编辑workspace
      handleGetFolderList, // 获取文件夹列表
      handleCreateRequest, // 创建请求
      handleDeleteCollection, // 删除collection
      handleGetCollectionList, // 获取collection列表
      handleCreateCollection, // 创建collection
      handleAddFolder, // 添加文件夹
    }
  },
  {
    persist: {
      enabled: true,
      // strategies: [
      //   {
      //     key: 'workspace',
      //     storage: localStorage,
      //     paths: ['collectionList'],
      //   },
      // ],
    },
  },
)
