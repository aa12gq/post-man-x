<template>
  <div class="metadata-editor">
    <div class="editor-header">
      <div class="header-content">
        <el-checkbox
          v-if="metadataList.length"
          v-model="isAllSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        />
        <span class="header-title">Metadata</span>
        <div class="header-stats">
          <el-tag size="small" type="info" class="count-tag">
            {{ activeCount }} Headers
          </el-tag>
        </div>
      </div>
      <div class="header-actions">
        <template v-if="selectedItems.length">
          <span class="selected-count"
            >{{ selectedItems.length }} selected</span
          >
          <el-button link type="danger" @click="removeSelected">
            <el-icon><Delete /></el-icon>
            Delete Selected
          </el-button>
        </template>
        <el-tooltip content="Add Header" placement="top">
          <el-button link type="primary" @click="addMetadata">
            <el-icon><Plus /></el-icon>
            Add Header
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <div class="metadata-list" v-if="metadataList.length">
      <el-scrollbar>
        <TransitionGroup name="metadata-item">
          <div
            v-for="(item, index) in metadataList"
            :key="item.id"
            class="metadata-item"
            :class="{
              'is-disabled': !item.enabled,
              'is-selected': selectedItems.includes(item.id),
            }"
            @click="toggleSelect(item)"
          >
            <div class="item-status">
              <el-checkbox
                v-model="item.selected"
                @change="handleItemSelect"
                @click.stop
              />
            </div>
            <el-input
              v-model="item.key"
              placeholder="Header Name"
              class="metadata-key"
              @change="emitChange"
              size="default"
              :prefix-icon="Document"
              :status="item.key.trim() === '' ? 'error' : ''"
            />
            <el-input
              v-model="item.value"
              placeholder="Header Value"
              class="metadata-value"
              @change="emitChange"
              size="default"
              :prefix-icon="Edit"
            />
            <div class="item-actions">
              <el-button link type="danger" @click="removeMetadata(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </TransitionGroup>
      </el-scrollbar>
    </div>

    <div v-else class="empty-state">
      <div class="empty-content">
        <h3>No Headers</h3>
        <p>Add custom headers to your request</p>
        <el-button type="primary" plain @click="addMetadata">
          <el-icon><Plus /></el-icon>
          Add Header
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Plus, Delete, Document, Edit } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

interface MetadataItem {
  key: string;
  value: string;
  enabled: boolean;
  id: string;
  selected?: boolean;
}

const props = defineProps<{
  initialMetadata?: Record<string, string>;
}>();

const emit = defineEmits(["update:metadata"]);

const metadataList = ref<MetadataItem[]>([]);

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

watch(
  () => props.initialMetadata,
  (newMetadata) => {
    if (newMetadata) {
      metadataList.value = Object.entries(newMetadata).map(([key, value]) => ({
        key,
        value,
        enabled: true,
        id: generateId(),
      }));
    }
  },
  { immediate: true }
);

const addMetadata = () => {
  metadataList.value.push({
    key: "",
    value: "",
    enabled: true,
    id: generateId(),
  });
};

const removeMetadata = (index: number) => {
  metadataList.value.splice(index, 1);
  emitChange();
};

const emitChange = () => {
  const metadata: Record<string, string> = {};
  metadataList.value.forEach((item) => {
    if (item.enabled && item.key.trim()) {
      metadata[item.key.trim()] = item.value;
    }
  });
  emit("update:metadata", metadata);
};

const activeCount = computed(
  () => metadataList.value.filter((item) => item.enabled).length
);

const isAllSelected = ref(false);
const isIndeterminate = ref(false);

const selectedItems = computed(() =>
  metadataList.value.filter((item) => item.selected).map((item) => item.id)
);

const handleSelectAll = (val: boolean | string | number) => {
  metadataList.value.forEach((item) => {
    item.selected = Boolean(val);
  });
  isIndeterminate.value = false;
};

const handleItemSelect = () => {
  const checkedCount = metadataList.value.filter(
    (item) => item.selected
  ).length;
  const totalCount = metadataList.value.length;

  isAllSelected.value = checkedCount === totalCount;
  isIndeterminate.value = checkedCount > 0 && checkedCount < totalCount;
};

const toggleSelect = (item: MetadataItem) => {
  item.selected = !item.selected;
  handleItemSelect();
};

const removeSelected = async () => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete ${selectedItems.value.length} selected items?`,
      "Warning",
      {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      }
    );
    metadataList.value = metadataList.value.filter(
      (item) => !selectedItems.value.includes(item.id)
    );
    emitChange();
  } catch {
    // User cancelled
  }
};
</script>

<style scoped>
.metadata-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--background);
}

.editor-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.count-tag {
  font-size: 12px;
  height: 20px;
  line-height: 18px;
  padding: 0 8px;
  background-color: var(--el-color-info-light-9);
  border: none;
  color: var(--text-secondary);
}

.metadata-list {
  flex: 1;
  overflow: hidden;
  padding: 12px;
}

.metadata-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.metadata-item:hover {
  background-color: var(--background-light);
}

.metadata-item.is-disabled {
  opacity: 0.6;
}

.metadata-item.is-selected {
  background-color: var(--selected);
}

.metadata-item.is-selected:hover {
  background-color: var(--selected-hover);
}

.item-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
}

:deep(.el-checkbox.is-checked .el-checkbox__inner) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

:deep(.el-checkbox__inner) {
  background-color: var(--background);
  border-color: var(--border);
}

:deep(.el-checkbox__inner:hover) {
  border-color: var(--el-color-primary);
}

.metadata-key {
  width: 180px;
}

.metadata-value {
  flex: 1;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid var(--border);
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--el-color-primary);
}

:deep(.el-input__prefix-inner) {
  color: var(--text-secondary);
}

.item-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.metadata-item:hover .item-actions {
  opacity: 1;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  text-align: center;
}

.empty-content h3 {
  margin: 0 0 4px;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
}

.empty-content p {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 13px;
}

.selected-count {
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 8px;
}

:deep(.el-button) {
  color: var(--text-secondary);
}

:deep(.el-button--primary.is-link) {
  color: var(--el-color-primary);
}

:deep(.el-button--primary.is-link:hover) {
  color: var(--el-color-primary-light-3);
}

:deep(.el-button--danger.is-link) {
  color: var(--el-color-danger);
}

:deep(.el-button--danger.is-link:hover) {
  color: var(--el-color-danger-light-3);
}

/* ... transition animations ... */
</style>
