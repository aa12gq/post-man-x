<template>
  <div class="tab-manager">
    <el-tabs
      v-model="activeTab"
      type="card"
      closable
      @tab-remove="handleTabRemove"
      @tab-click="handleTabClick"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.id"
        :name="tab.id"
      >
        <template #label>
          <div class="tab-label">
            {{ tab.title }}
            <span
              v-if="unsavedTabs?.has(tab.id)"
              class="unsaved-indicator"
              title="Unsaved changes"
            />
          </div>
        </template>
      </el-tab-pane>

      <div class="add-tab-button" @click="$emit('add')">
        <el-icon><Plus /></el-icon>
      </div>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import type { TabPaneName } from 'element-plus';

const props = defineProps<{
  modelValue: string;
  tabs: Array<{
    id: string;
    title: string;
  }>;
  unsavedTabs?: Set<string>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  add: [];
  remove: [id: string];
}>();

const activeTab = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const handleTabClick = (tab: any) => {
  activeTab.value = tab.props.name;
};

const handleTabRemove = (name: TabPaneName) => {
  if (typeof name === 'string') {
    emit("remove", name);
  }
};
</script>

<style scoped>
.tab-manager {
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

.tab {
  background-color: var(--bg-color-light);
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.tab.active {
  background-color: var(--bg-color);
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
}

.tab:hover {
  background-color: var(--hover-color);
}

.tab-close {
  color: var(--text-color-secondary);
}

.tab-close:hover {
  color: var(--danger-color);
}

.unsaved-indicator {
  color: var(--primary-color);
}

:deep(.el-tabs) {
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  margin: 0;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--border-color);
}

:deep(.el-tabs__content) {
  padding: 0;
  display: none;
}

:deep(.el-tab-pane) {
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 8px;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  border-bottom: none;
  background-color: var(--header-bg);
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

:deep(.el-tabs__item.is-active) {
  background-color: var(--bg-color);
  border-bottom: 2px solid var(--el-color-primary);
}

.add-tab-button {
  display: flex;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
  color: var(--text-color);
  height: 40px;
}

.add-tab-button:hover {
  color: var(--el-color-primary);
}

.tab-label {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
