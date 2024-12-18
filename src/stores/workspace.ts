import { defineStore } from 'pinia';
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import { ref } from 'vue';

interface WorkspaceSettings {
  createWorkspacePage: string;
}

export const useWorkspaceStore = defineStore('workspace', () => {

  const workspaceConfig = ref<WorkspaceSettings>({
    createWorkspacePage: 'blank',
  });

  function setCreateWorkspacePage(page: string) {
    workspaceConfig.value.createWorkspacePage = page;
  }

  return {
    workspaceConfig,
    setCreateWorkspacePage,
  };
}, {
  persist: {
    key: "workspace-store",
    storage: localStorage,
    paths: ["workspaceConfig"],
  } as PersistenceOptions,
});
