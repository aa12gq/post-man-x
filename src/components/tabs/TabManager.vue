<template>
  <div
    class="bg-surface-2 border-b border-border"
    :class="{
      'layout-modern': layoutStore.settings.currentLayout === 'modern',
      'layout-classic': layoutStore.settings.currentLayout === 'classic',
      'position-left': position === 'left',
      'position-bottom': position === 'bottom',
    }"
  >
    <div class="flex items-center w-full h-8 bg-surface-3">
      <el-tabs
        v-model="activeTab"
        type="card"
        @tab-remove="handleTabRemove"
        @tab-click="handleTabClick"
        class="flex-1 h-full"
      >
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.id"
          :name="tab.id"
          :class="{ 'is-unsaved': unsavedTabs?.has(tab.id) }"
        >
          <template #label>
            <el-tooltip
              :content="`${tab.title}${tab.url ? '\n' + tab.url : ''}`"
              placement="top"
              :enterable="false"
              :show-after="500"
            >
              <div class="flex items-center gap-1 max-w-full relative">
                <div class="text-secondary flex items-center">
                  <el-icon
                    class="text-xs transition-colors"
                    :style="{ color: themeStore.currentTheme.colors.primary }"
                  >
                    <component :is="getTabIcon(tab)" />
                  </el-icon>
                </div>
                <div class="min-w-0 flex-1">
                  <span class="text-xs truncate block">{{ tab.title }}</span>
                </div>
                <div
                  v-if="unsavedTabs?.has(tab.id)"
                  class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"
                />
                <div
                  class="w-4 h-4 flex items-center justify-center hover:bg-surface-1 hover:text-primary rounded-full cursor-pointer ml-1"
                  @click.stop="handleTabRemove(tab.id)"
                >
                  <el-icon class="text-xs"><Close /></el-icon>
                </div>
              </div>
            </el-tooltip>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div class="flex items-center px-2 border-l border-border">
        <div
          class="w-7 h-7 flex items-center justify-center cursor-pointer text-text rounded hover:bg-surface-2 hover:text-primary transition-colors"
          @click="$emit('add')"
          title="New Tab"
        >
          <el-icon><Plus /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus, Close, Document, Connection } from "@element-plus/icons-vue";
import type { TabPaneName } from "element-plus";
import { useLayoutStore } from "../../stores/layout";
import { useThemeStore } from "../../stores/theme";

const layoutStore = useLayoutStore();
const themeStore = useThemeStore();

const props = defineProps<{
  modelValue: string;
  tabs: Array<{
    id: string;
    title: string;
    url?: string;
    type: "http" | "rpc";
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

const getTabIcon = (tab: any) => {
  return tab.type === "rpc" ? Connection : Document;
};
</script>

<style scoped>
:deep(.el-tabs__header) {
  margin: 0;
  height: 100%;
  background-color: var(--surface-3);
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
  height: 32px;
  line-height: 32px;
  padding: 0 24px 0 10px;
  background-color: transparent;
  border: none !important;
  transition: all 0.2s ease;
  position: relative;
  margin: 0 1px;
  max-width: 160px;
  min-width: 80px;
  width: auto;
  font-size: 12px;

  :deep(.el-icon-close) {
    position: absolute !important;
    right: 5px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin: 0 !important;
    height: 14px !important;
    width: 14px !important;
    line-height: 14px !important;
    border-radius: 50% !important;

    &:hover {
      background-color: var(--surface-1) !important;
      color: var(--el-color-primary) !important;
    }
  }

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
    background-color: var(--surface-2);
  }

  &.is-active {
    background-color: var(--surface-2);

    &::after {
      opacity: 1;
    }
  }
}

/* Modern Layout 样式 */
.layout-modern {
  @apply h-full flex flex-row;

  .tabs-container {
    @apply w-[200px] h-full p-0 flex flex-col border-r border-border;
  }

  :deep(.el-tabs) {
    @apply flex-1 flex flex-col;
  }

  :deep(.el-tabs__header) {
    @apply m-0 p-0 flex-1;
  }

  :deep(.el-tabs__nav-wrap) {
    @apply p-0 h-full;
  }

  :deep(.el-tabs__nav-scroll) {
    @apply h-full overflow-y-auto;
  }

  :deep(.el-tabs__nav) {
    @apply flex-col w-full h-auto border-none !flex;
  }

  :deep(.el-tabs__item) {
    @apply !h-10 min-h-[40px] !leading-10 !p-3 !m-0 rounded-none w-full max-w-none flex items-center !bg-transparent !box-border !border-none relative;

    &::after {
      @apply content-[''] absolute top-0 bottom-0 left-0 w-0.5 h-auto right-auto bg-primary opacity-0 transition-opacity;
    }

    &.is-active {
      @apply bg-surface-1;
      &::after {
        @apply opacity-100;
      }
    }

    &:hover:not(.is-active) {
      @apply bg-surface-2;
    }
  }
}

/* Classic Layout 样式 */
.layout-classic {
  .tabs-container {
    @apply w-full h-8 flex flex-row items-center;
  }

  :deep(.el-tabs__item) {
    @apply h-8 leading-8 px-4 bg-transparent border-none m-0 relative;

    &::after {
      @apply content-[''] absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-0 transition-opacity;
    }

    &.is-active {
      @apply bg-surface-1;
      &::after {
        @apply opacity-100;
      }
    }

    &:hover:not(.is-active) {
      @apply bg-surface-2;
    }
  }
}

:deep(.el-tabs__content) {
  @apply !hidden;
}
</style>
