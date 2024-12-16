<template>
  <div
    class="tab-manager"
    :class="{
      'layout-modern': layoutStore.settings.currentLayout === 'modern',
      'layout-classic': layoutStore.settings.currentLayout === 'classic',
      'position-left': position === 'left',
      'position-bottom': position === 'bottom',
    }"
  >
    <div class="tabs-container">
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
          :class="{ 'is-unsaved': unsavedTabs?.has(tab.id) }"
        >
          <template #label>
            <div class="tab-label">
              <div class="tab-icon">
                <el-icon :size="14">
                  <component :is="getTabIcon(tab)" />
                </el-icon>
              </div>
              <div class="tab-text">{{ tab.title }}</div>
              <div v-if="unsavedTabs?.has(tab.id)" class="unsaved-indicator" />
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div class="tab-actions">
        <div class="add-tab-button" @click="$emit('add')" title="New Tab">
          <el-icon><Plus /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus, Document, Connection } from "@element-plus/icons-vue";
import type { TabPaneName } from "element-plus";
import { useLayoutStore } from "../../stores/layout";

const layoutStore = useLayoutStore();

const props = defineProps<{
  modelValue: string;
  tabs: Array<{
    id: string;
    title: string;
  }>;
  unsavedTabs?: Set<string>;
  position?: "top" | "left" | "bottom";
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
  if (typeof name === "string") {
    emit("remove", name);
  }
};

// 根据标签类型返回对应图标
const getTabIcon = (tab: any) => {
  return tab.type === "rpc" ? Connection : Document;
};
</script>

<style scoped>
.tab-manager {
  background-color: var(--background);
  border-bottom: 1px solid var(--border-color);
}

.tabs-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  background-color: var(--header-bg);
}

:deep(.el-tabs) {
  flex: 1;
  height: 100%;
}

:deep(.el-tabs__header) {
  margin: 0;
  height: 100%;
  background-color: var(--header-bg);
  border: none;
}

:deep(.el-tabs__nav-wrap) {
  height: 100%;
  padding: 0 4px;
}

:deep(.el-tabs__nav-scroll) {
  height: 100%;
}

:deep(.el-tabs__nav) {
  height: 100%;
  border: none !important;
  &::before,
  &::after {
    display: none !important;
  }
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  background-color: transparent;
  border: none !important;
  transition: all 0.2s ease;
  position: relative;
  margin: 0 1px;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--el-color-primary);
    opacity: 0;
    transition: opacity 0.2s;
  }

  &:hover {
    background-color: var(--hover-color);
  }

  &.is-active {
    background-color: var(--background);

    &::after {
      opacity: 1;
    }
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-right: 20px;
}

.tab-icon {
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.tab-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.unsaved-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  flex-shrink: 0;
}

.tab-actions {
  display: flex;
  align-items: center;
  padding: 0 8px;
  border-left: 1px solid var(--border-color);
}

.add-tab-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-color);
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-color);
    color: var(--el-color-primary);
  }
}

/* 现代布局样式 */
.layout-modern {
  height: 100%;
  display: flex;
  flex-direction: row;

  .tabs-container {
    width: 200px;
    height: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border-color);
  }

  :deep(.el-tabs) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0;
    flex: 1;
  }

  :deep(.el-tabs__nav-wrap) {
    padding: 0;
    height: 100%;
  }

  :deep(.el-tabs__nav-scroll) {
    height: 100%;
    overflow-y: auto;
  }

  :deep(.el-tabs__nav) {
    flex-direction: column;
    width: 100%;
    height: auto;
    border: none;
    display: flex !important;
  }

  :deep(.el-tabs__content) {
    display: none !important;
  }

  :deep(.el-tabs__item) {
    height: 40px !important;
    min-height: 40px;
    line-height: 40px !important;
    padding: 0 12px !important;
    margin: 0 !important;
    border-radius: 0;
    width: 100%;
    max-width: none;
    display: flex;
    align-items: center;
    background-color: transparent !important;
    box-sizing: border-box !important;
    border: none !important;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 2px;
      height: auto;
      right: auto;
      background-color: var(--el-color-primary);
      opacity: 0;
      transition: opacity 0.2s;
    }

    &.is-active {
      background-color: var(--el-color-primary-light-9) !important;
      height: 40px !important;

      &::after {
        opacity: 1;
      }
    }

    &:hover:not(.is-active) {
      background-color: var(--hover-color) !important;
    }
  }

  .tab-label {
    width: 100%;
    padding-right: 24px;
    white-space: normal;
    word-break: break-word;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .tab-actions {
    border-left: none;
    border-top: 1px solid var(--border-color);
    padding: 8px;
    height: auto;
    justify-content: flex-end;
  }
}

/* 经典布局样式 */
.layout-classic {
  .tabs-container {
    width: 100%;
    height: 40px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  :deep(.el-tabs) {
    flex: 1;
  }

  :deep(.el-tabs__header) {
    margin: 0;
  }

  :deep(.el-tabs__nav) {
    border: none !important;
  }

  :deep(.el-tabs__item) {
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    background-color: transparent;
    border: none !important;
    margin: 0;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--el-color-primary);
      opacity: 0;
      transition: opacity 0.2s;
    }

    &.is-active {
      background-color: var(--background);
      &::after {
        opacity: 1;
      }
    }

    &:hover:not(.is-active) {
      background-color: var(--hover-color);
    }
  }

  .tab-actions {
    border-left: 1px solid var(--border-color);
    padding: 0 8px;
  }
}

/* 添加内容区域的样式 */
:deep(.el-tab-pane) {
  height: 100%;
  overflow: auto;
  padding: 16px;
}

/* 内容区域样式 - 移到最前面，作为基础样式 */
:deep(.el-tabs__content) {
  display: none !important; /* 默认隐藏所有布局下的内容区域 */
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow: auto;
  padding: 0 !important; /* 强制移除所有布局下的内边距 */
}

/* 移除重复的样式定义 */
.layout-classic :deep(.el-tabs__content),
.layout-modern :deep(.el-tabs__content),
.layout-compact :deep(.el-tabs__content),
.layout-minimal :deep(.el-tabs__content) {
  display: none !important;
}

/* 标签页面板样式 */
:deep(.el-tab-pane) {
  height: 100%;
  overflow: auto;
}
</style>
