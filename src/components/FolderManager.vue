<template>
  <div class="folder-manager">
    <div
      v-for="folder in topLevelFolders"
      :key="folder.id"
      class="folder-item"
      :data-folder-id="folder.id"
      @dragover.prevent
      @drop="onDrop"
    >
      <div class="folder-header">
        <div class="folder-info" @click="toggleFolder(folder.id)">
          <el-icon
            class="expand-icon"
            :class="{ 'is-expanded': isExpanded(folder.id) }"
            v-if="hasChildren(folder.id)"
          >
            <CaretRight />
          </el-icon>
          <el-icon><Folder /></el-icon>
          <div
            v-if="!isEditing(folder.id)"
            class="folder-name"
            @dblclick="startEditing(folder.id)"
          >
            {{ folder.name }}
          </div>
          <div v-else class="editing-container">
            <el-input
              v-model="editingName"
              class="editing-input"
              size="small"
              ref="editInput"
              v-focus
              @keyup.enter="finishEditing(folder.id)"
              @keyup.esc="cancelEditing"
            />
            <div class="editing-actions">
              <el-button
                type="primary"
                size="small"
                circle
                @click.stop="finishEditing(folder.id)"
              >
                <el-icon><Check /></el-icon>
              </el-button>
              <el-button
                type="danger"
                size="small"
                circle
                @click.stop="cancelEditing"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <el-dropdown trigger="click" @command="handleCommand($event, folder)">
          <el-button link class="folder-more">
            <el-icon><More /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="!folder.parentId" command="refresh">
                <el-icon><Refresh /></el-icon>
                Refresh
              </el-dropdown-item>
              <el-dropdown-item
                v-if="!folder.parentId"
                divided
              ></el-dropdown-item>
              <el-dropdown-item command="newRequest"
                >New Request</el-dropdown-item
              >
              <el-dropdown-item command="newSubfolder"
                >New Subfolder</el-dropdown-item
              >
              <el-dropdown-item command="rename">Rename</el-dropdown-item>
              <el-dropdown-item command="delete" divided
                >Delete</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div v-if="isExpanded(folder.id)" class="folder-content">
        <div
          v-for="subFolder in getSubFolders(folder.id)"
          :key="subFolder.id"
          class="folder-item"
          :data-folder-id="subFolder.id"
          @dragover.prevent
          @drop="onDrop"
        >
          <div class="folder-header">
            <div class="folder-info" @click="toggleFolder(subFolder.id)">
              <el-icon
                class="expand-icon"
                :class="{ 'is-expanded': isExpanded(subFolder.id) }"
                v-if="hasChildren(subFolder.id)"
              >
                <CaretRight />
              </el-icon>
              <el-icon><Folder /></el-icon>
              <div
                v-if="!isEditing(subFolder.id)"
                class="folder-name"
                @dblclick="startEditing(subFolder.id)"
              >
                {{ subFolder.name }}
              </div>
              <div v-else class="editing-container">
                <el-input
                  v-model="editingName"
                  class="editing-input"
                  size="small"
                  ref="editInput"
                  v-focus
                  @keyup.enter="finishEditing(subFolder.id)"
                  @keyup.esc="cancelEditing"
                />
                <div class="editing-actions">
                  <el-button
                    type="primary"
                    size="small"
                    circle
                    @click.stop="finishEditing(subFolder.id)"
                  >
                    <el-icon><Check /></el-icon>
                  </el-button>
                  <el-button
                    type="danger"
                    size="small"
                    circle
                    @click.stop="cancelEditing"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <el-dropdown
              trigger="click"
              @command="handleCommand($event, subFolder)"
            >
              <el-button link class="folder-more">
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="newRequest"
                    >New Request</el-dropdown-item
                  >
                  <el-dropdown-item command="newSubfolder"
                    >New Subfolder</el-dropdown-item
                  >
                  <el-dropdown-item command="rename">Rename</el-dropdown-item>
                  <el-dropdown-item command="delete" divided
                    >Delete</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div v-if="isExpanded(subFolder.id)" class="folder-content">
            <div
              v-for="request in getFolderRequests(subFolder.id)"
              :key="request.id"
              class="request-item"
              draggable="true"
              @dragstart="onDragStart($event, request.id)"
              @click="openRequest(request)"
              @dblclick.stop="startEditingRequest(request)"
            >
              <div class="request-info" @click="openRequest(request)">
                <el-icon>
                  <component
                    :is="getRequestIcon(request.type).component"
                    :style="{ color: getRequestIcon(request.type).color }"
                  />
                </el-icon>
                <div v-if="!isEditingRequest(request.id)" class="request-name">
                  {{ request.name || request.url }}
                </div>
                <div v-else class="editing-container" @click.stop>
                  <el-input
                    v-model="editingName"
                    class="editing-input"
                    size="small"
                    ref="editInput"
                    v-focus
                    @keyup.enter="finishEditingRequest(request.id)"
                    @keyup.esc="cancelEditing"
                  />
                  <div class="editing-actions">
                    <el-button
                      type="primary"
                      size="small"
                      circle
                      @click.stop="finishEditingRequest(request.id)"
                    >
                      <el-icon><Check /></el-icon>
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      circle
                      @click.stop="cancelEditing"
                    >
                      <el-icon><Close /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
              <el-dropdown
                trigger="click"
                @command="(command: string) => handleRequestCommand(command, request)"
                @click.stop
              >
                <el-button link class="request-more" @click.stop>
                  <el-icon><More /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="open">Open</el-dropdown-item>
                    <el-dropdown-item command="rename">Rename</el-dropdown-item>
                    <el-dropdown-item command="delete" divided
                      >Delete</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <div
          v-for="request in getFolderRequests(folder.id)"
          :key="request.id"
          class="request-item"
          draggable="true"
          @dragstart="onDragStart($event, request.id)"
          @click="openRequest(request)"
          @dblclick.stop="startEditingRequest(request)"
        >
          <div class="request-info" @click="openRequest(request)">
            <el-icon>
              <component
                :is="getRequestIcon(request.type).component"
                :style="{ color: getRequestIcon(request.type).color }"
              />
            </el-icon>
            <div v-if="!isEditingRequest(request.id)" class="request-name">
              {{ request.name || request.url }}
            </div>
            <div v-else class="editing-container" @click.stop>
              <el-input
                v-model="editingName"
                class="editing-input"
                size="small"
                ref="editInput"
                v-focus
                @keyup.enter="finishEditingRequest(request.id)"
                @keyup.esc="cancelEditing"
              />
              <div class="editing-actions">
                <el-button
                  type="primary"
                  size="small"
                  circle
                  @click.stop="finishEditingRequest(request.id)"
                >
                  <el-icon><Check /></el-icon>
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click.stop="cancelEditing"
                >
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <el-dropdown
            trigger="click"
            @command="(command: string) => handleRequestCommand(command, request)"
            @click.stop
          >
            <el-button link class="request-more" @click.stop>
              <el-icon><More /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="open">Open</el-dropdown-item>
                <el-dropdown-item command="rename">Rename</el-dropdown-item>
                <el-dropdown-item command="delete" divided
                  >Delete</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from "vue";
import {
  Folder,
  Document,
  More,
  Check,
  Close,
  CaretRight,
  Link,
  Connection,
  Refresh,
} from "@element-plus/icons-vue";
import { useRequestHistory } from "../composables/useRequestHistory";
import { ElMessageBox, ElMessage } from "element-plus";
import { focus } from "../directives/focus";
import type { HistoryItem, Folder as FolderType } from "../types";

const {
  folders,
  history,
  rename,
  moveToFolder,
  addFolder,
  getSubFolders,
  deleteFolder,
  removeHistoryItem,
  loadHistory,
} = useRequestHistory();
const emit = defineEmits(["create-request", "open-request", "delete-request"]);

const expandedFolders = ref(new Set<string>());
const editingFolderId = ref<string | null>(null);
const editingRequestId = ref<string | null>(null);
const editingName = ref("");

const topLevelFolders = computed(() => {
  return folders.value.filter((folder) => !folder.parentId);
});

function toggleFolder(folderId: string) {
  if (expandedFolders.value.has(folderId)) {
    expandedFolders.value.delete(folderId);
  } else {
    expandedFolders.value.add(folderId);
  }
}

function isExpanded(folderId: string) {
  return expandedFolders.value.has(folderId);
}

function getFolderRequests(folderId: string) {
  return history.value.filter((req) => req.folderId === folderId);
}

function startEditing(folderId: string) {
  const folder = folders.value.find((f) => f.id === folderId);
  if (folder) {
    editingFolderId.value = folderId;
    editingName.value = folder.name;
    nextTick(() => {
      const input = document.querySelector(
        ".editing-input input"
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }
}

function finishEditing(folderId: string) {
  if (editingName.value.trim()) {
    rename(folderId, editingName.value, true);
  }
  editingFolderId.value = null;
  editingName.value = "";
}

function isEditing(folderId: string) {
  return editingFolderId.value === folderId;
}

function cancelEditing() {
  editingFolderId.value = null;
  editingRequestId.value = null;
  editingName.value = "";
}

const onDragStart = (event: DragEvent, requestId: string) => {
  if (!event.dataTransfer) return;
  event.dataTransfer.setData("requestId", requestId);
  event.dataTransfer.effectAllowed = "move";
};

const onDrop = (event: DragEvent) => {
  const requestId = event.dataTransfer?.getData("requestId");
  const target = event.target as HTMLDivElement;
  const folderItem = target.closest(".folder-item") as HTMLDivElement | null;
  const targetFolderId = folderItem?.dataset.folderId;

  if (requestId) {
    moveToFolder(requestId, targetFolderId);
  }
};

const handleCommand = async (command: string, folder: FolderType) => {
  switch (command) {
    case "refresh":
      isRefreshing.value = true;
      try {
        await loadHistory();
        ElMessage.success("Refreshed successfully");
      } catch (error) {
        ElMessage.error("Failed to refresh");
      } finally {
        isRefreshing.value = false;
      }
      break;
    case "newRequest":
      emit("create-request", folder.id);
      break;

    case "newSubfolder":
      try {
        const { value: name } = await ElMessageBox.prompt(
          "Enter subfolder name",
          "New Subfolder",
          {
            confirmButtonText: "Create",
            cancelButtonText: "Cancel",
            inputValidator: (value) => {
              if (!value) return "Folder name cannot be empty";
              return true;
            },
          }
        );

        if (name) {
          addFolder(name.trim(), folder.id);
          ElMessage.success(`Subfolder "${name}" created`);
        }
      } catch {}
      break;

    case "rename":
      startEditing(folder.id);
      break;

    case "delete":
      try {
        await ElMessageBox.confirm(
          "Are you sure you want to delete this folder? All subfolders and request associations will be removed.",
          "Delete Folder",
          {
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        );
        deleteFolder(folder.id);
        ElMessage.success("Folder deleted");
      } catch {}
      break;
  }
};

function openRequest(request: HistoryItem) {
  emit("open-request", request);
}

function startEditingRequest(request: any) {
  editingRequestId.value = request.id;
  editingName.value = request.name || request.url;
  nextTick(() => {
    const input = document.querySelector(
      ".editing-input input"
    ) as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
    }
  });
}

function finishEditingRequest(requestId: string) {
  if (editingName.value.trim()) {
    rename(requestId, editingName.value, false);
  }
  editingRequestId.value = null;
  editingName.value = "";
}

function isEditingRequest(requestId: string) {
  return editingRequestId.value === requestId;
}

function hasChildren(folderId: string): boolean {
  const subFolders = getSubFolders(folderId);
  const requests = getFolderRequests(folderId);
  return subFolders.length > 0 || requests.length > 0;
}

const vFocus = focus;

function getRequestIcon(type: string) {
  switch (type) {
    case "http":
      return {
        component: Link,
        color: "#67c23a",
      };
    case "rpc":
      return {
        component: Connection,
        color: "#409eff",
      };
    default:
      return {
        component: Document,
        color: "var(--text-color-secondary)",
      };
  }
}

const handleRequestCommand = async (command: string, request: HistoryItem) => {
  switch (command) {
    case "open":
      openRequest(request);
      break;
    case "rename":
      startEditingRequest(request);
      break;
    case "delete":
      try {
        await ElMessageBox.confirm(
          "Are you sure you want to delete this request?",
          "Delete Request",
          {
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            type: "warning",
          }
        );
        removeHistoryItem(request.id);
        emit("delete-request", request.id);
        ElMessage.success("Request deleted");
      } catch {}
      break;
  }
};

const isRefreshing = ref(false);
</script>

<style scoped>
.folder-manager {
  background-color: var(--background);
}

.folder {
  border-bottom: 1px solid var(--border-color);
}

.folder-header {
  background-color: var(--bg-color-light);
  color: var(--text-color);
}

.folder-header:hover {
  background-color: var(--hover-color);
}

.folder-header.active {
  background-color: var(--active-color);
  color: var(--primary-color);
}

.folder-name {
  color: var(--text-color);
}

.folder-actions {
  color: var(--text-color-secondary);
}

.folder-actions button:hover {
  color: var(--primary-color);
}

.request-item {
  background-color: var(--background);
  border-left: 2px solid transparent;
}

.request-item:hover {
  background-color: var(--hover-color);
}

.request-item.active {
  background-color: var(--selected-color);
  border-left-color: var(--primary-color);
}

.folder-item {
  margin-bottom: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  position: relative;
}

.folder-item:hover {
  background-color: var(--hover-color);
}

.folder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
}

.folder-info {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  padding-left: 20px;
}

.folder-info :deep(.el-icon) {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.folder-content {
  margin-left: 24px;
  padding: 4px 0;
  position: relative;
}

.folder-content::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: var(--border-color);
}

.folder-content .folder-item {
  position: relative;
  padding-left: 12px;
}

.folder-content .folder-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 16px;
  width: 12px;
  height: 1px;
  background-color: var(--border-color);
}

.folder-content .request-item {
  padding-left: 12px;
  position: relative;
}

.folder-content .request-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 16px;
  width: 12px;
  height: 1px;
  background-color: var(--border-color);
}

.folder-content > :last-child::after {
  content: "";
  position: absolute;
  left: -1px;
  top: 17px;
  bottom: 0;
  width: 1px;
  background-color: var(--background);
}

.request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  padding-left: 28px;
  margin: 2px 0;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  position: relative;
}

.request-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.request-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  font-size: 13px;
}

.request-item:hover {
  background-color: var(--hover-color);
}

:deep(.el-icon) {
  font-size: 16px;
  color: var(--text-color-secondary);
}

.editing-input {
  flex: 1;
  max-width: 200px;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-input__inner) {
  height: 24px;
}

.folder-more {
  opacity: 0;
  transition: opacity 0.2s;
  padding: 2px;
  height: 24px;
  width: 24px;
}

.folder-item:hover .folder-more {
  opacity: 1;
}

.folder-more:hover {
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-dropdown-menu__item) {
  font-size: 12px;
  padding: 5px 16px;
}

:deep(.el-dropdown-menu__item--divided) {
  margin-top: 4px;
  border-top-color: var(--border-color);
}

.editing-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.editing-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

:deep(.el-button.is-circle) {
  width: 24px;
  height: 24px;
  padding: 4px;
  min-width: 24px;
}

:deep(.el-input__wrapper) {
  padding: 0 8px;
}

:deep(.el-input__inner) {
  height: 24px;
}

.expand-icon {
  position: absolute;
  left: 4px;
  transition: transform 0.3s;
  width: 16px;
  height: 16px;
  color: var(--text-color-secondary);
}

.expand-icon.is-expanded {
  transform: rotate(90deg);
}

.request-item :deep(.el-icon) {
  font-size: 16px;
}

.request-item:has(.el-icon-link) :deep(.el-icon) {
  color: #67c23a;
}

.request-item:has(.el-icon-connection) :deep(.el-icon) {
  color: #409eff;
}

.request-more {
  opacity: 0;
  transition: opacity 0.2s;
  padding: 2px;
  height: 24px;
  width: 24px;
}

.request-item:hover .request-more {
  opacity: 1;
}

.request-more:hover {
  background-color: var(--el-color-primary-light-9);
}
</style>
