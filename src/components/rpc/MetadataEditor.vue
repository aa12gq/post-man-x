<template>
  <div class="metadata-editor">
    <div class="editor-header">
      <span class="header-title">Metadata</span>
      <div class="header-actions">
        <el-button size="small" @click="addMetadata">
          <el-icon><Plus /></el-icon>
          Add Metadata
        </el-button>
      </div>
    </div>

    <div class="metadata-list">
      <div
        v-for="(item, index) in metadataList"
        :key="index"
        class="metadata-item"
      >
        <el-input
          v-model="item.key"
          placeholder="Key"
          class="metadata-key"
          @change="emitChange"
        />
        <el-input
          v-model="item.value"
          placeholder="Value"
          class="metadata-value"
          @change="emitChange"
        />
        <el-button
          type="danger"
          size="small"
          circle
          @click="removeMetadata(index)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Plus, Delete } from "@element-plus/icons-vue";

interface MetadataItem {
  key: string;
  value: string;
}

const props = defineProps<{
  initialMetadata?: Record<string, string>;
}>();

const emit = defineEmits(["update:metadata"]);

const metadataList = ref<MetadataItem[]>([]);

// 初始化元数据列表
watch(
  () => props.initialMetadata,
  (newMetadata) => {
    if (newMetadata) {
      metadataList.value = Object.entries(newMetadata).map(([key, value]) => ({
        key,
        value,
      }));
    }
  },
  { immediate: true }
);

const addMetadata = () => {
  metadataList.value.push({ key: "", value: "" });
};

const removeMetadata = (index: number) => {
  metadataList.value.splice(index, 1);
  emitChange();
};

const emitChange = () => {
  const metadata: Record<string, string> = {};
  metadataList.value.forEach((item) => {
    if (item.key.trim()) {
      metadata[item.key.trim()] = item.value;
    }
  });
  emit("update:metadata", metadata);
};
</script>

<style scoped>
.metadata-editor {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--background);
  color: var(--text);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.metadata-list {
  flex: 1;
  overflow-y: auto;
}

.metadata-item {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.metadata-key {
  width: 200px;
}

.metadata-value {
  flex: 1;
}

:deep(.el-input__wrapper) {
  background-color: var(--background-light);
  border-color: var(--border);
}

:deep(.el-input__inner) {
  color: var(--text);
}
</style>
