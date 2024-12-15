import { ref, onMounted, nextTick, watch } from "vue";
import { storage } from "../services/storage";
import type { HistoryItem } from "../types";
import { nanoid } from "nanoid";

function generateId(): string {
  return nanoid();
}

// 扩展 HistoryItem 类型
interface RequestHistoryItem extends HistoryItem {
  name: string;
  folderId?: string;
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
}

export function useRequestHistory() {
  const history = ref<RequestHistoryItem[]>([]);
  const folders = ref<Folder[]>([]);

  // 添加对 history 的深度监听
  watch(
    history,
    (newHistory) => {

      // 使用公共方法更新历史记录
      storage.updateHistory(newHistory);
    },
    { deep: true }
  );

  // 加载历史记录
  const loadHistory = () => {
    const items = storage.getHistory();
    const newHistory = items.map((item) => ({
      ...item,
      name: item.name || item.url,
    }));
    history.value = newHistory;
  };

  // 加载文件夹
  const loadFolders = () => {
    folders.value = storage.getFolders();
  };

  // 保存文件夹
  const saveFolders = () => {
    storage.saveFolders(folders.value);
  };

  // 添加新文件夹
  function addFolder(name: string, parentId?: string) {
    const folder: Folder = {
      id: generateId(),
      name,
      parentId,
    };
    folders.value.push(folder);
    sortFolders();
    saveFolders();
    return folder;
  }

  // 重命名请求或文件夹
  function rename(id: string, newName: string, isFolder = false) {
    if (isFolder) {
      const folder = folders.value.find((f) => f.id === id);
      if (folder) {
        folder.name = newName;
        saveFolders();
      }
    } else {
      const item = history.value.find((h) => h.id === id);
      if (item) {
        item.name = newName;
        // 直接更新响应式状态
        history.value = history.value.map((h) =>
          h.id === id ? { ...h, name: newName } : h
        );
        // watch 会自动调用 updateHistory
      }
    }
  }

  // 移动请求到文件夹
  function moveToFolder(requestId: string, folderId?: string) {
    const item = history.value.find((h) => h.id === requestId);
    if (item) {
      item.folderId = folderId;
      storage.saveRequestFolder(requestId, folderId);
      history.value = [...history.value];
    }
  }

  // 添加历史记录
  const addHistoryItem = (item: HistoryItem) => {

    // 保存到存储并获取完整的新项
    const savedItem = storage.addHistoryItem(item);

    // 直接修改响应式数组
    const newHistory = [savedItem as RequestHistoryItem, ...history.value];
    history.value = newHistory;

    // 如果有文件夹ID，确保保存文件夹关联
    if (savedItem.folderId) {
      storage.saveRequestFolder(savedItem.id, savedItem.folderId);
      // 强制新视图
      nextTick(() => {
        // 重新获取文件夹请求
        getFolderRequests(savedItem.folderId!);
      });
    }

  };

  // 删除历史记录项
  const removeHistoryItem = (id: string) => {
    storage.removeHistoryItem(id);
    // 立即更新本地状态，不等待 loadHistory
    history.value = history.value.filter((item) => item.id !== id);
  };

  // 清空历史记录
  const clearHistory = () => {
    storage.clearHistory();
    history.value = [];
  };

  // 在组件挂载时加载数据
  onMounted(() => {
    loadHistory();
    loadFolders();
  });

  // 添加文件夹排序功能
  const sortFolders = () => {
    folders.value.sort((a, b) => {
      if (!a.parentId && b.parentId) return -1;
      if (a.parentId && !b.parentId) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  // 在 useRequestHistory 函数中添加
  function getSubFolders(parentId: string) {
    return folders.value.filter((f) => f.parentId === parentId);
  }

  // 在 useRequestHistory 函数中添加
  function deleteFolder(folderId: string) {
    // 获取所有子文件夹
    const subFolders = folders.value.filter((f) => f.parentId === folderId);

    // 递归删除子文件夹
    subFolders.forEach((folder) => {
      deleteFolder(folder.id);
    });

    // 删除当前文件夹
    const index = folders.value.findIndex((f) => f.id === folderId);
    if (index !== -1) {
      folders.value.splice(index, 1);
    }

    // 移除该文件夹下的所有请求的文件夹关
    history.value.forEach((item) => {
      if (item.folderId === folderId) {
        item.folderId = undefined;
        storage.saveRequestFolder(item.id, undefined);
      }
    });

    // 保存更新后的文件夹列表
    saveFolders();
  }

  // 添加获取文件夹路径的方法
  function getFolderPath(folderId?: string): Folder[] {
    const path: Folder[] = [];
    let currentFolder = folderId
      ? folders.value.find((f) => f.id === folderId)
      : undefined;

    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = folders.value.find(
        (f) => f.id === currentFolder?.parentId
      );
    }

    return path;
  }

  // getFolderRequests 方法
  function getFolderRequests(folderId: string) {
    console.log("Getting requests for folder:", folderId);
    // 强制创建新数组以触发响应式更新
    const currentHistory = [...history.value];
    const requests = currentHistory.filter((req) => {
      console.log(
        "Checking request:",
        req,
        "folderId:",
        req.folderId,
        "target:",
        folderId
      );
      return req.folderId === folderId;
    });
    console.log("Filtered requests:", requests);
    return requests;
  }

  return {
    history,
    folders,
    addFolder,
    rename,
    moveToFolder,
    loadHistory,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
    getSubFolders,
    deleteFolder,
    getFolderPath,
    getFolderRequests,
  };
}
