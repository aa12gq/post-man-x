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
        :label="tab.title"
        :name="tab.id"
      />

      <!-- 将按钮放回 el-tabs 内部 -->
      <template #suffix>
        <el-button
          class="add-tab-button"
          size="small"
          @click="handleAddTab"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
      </template>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus } from "@element-plus/icons-vue";

const props = defineProps<{
  modelValue: string;
  tabs: Array<{
    id: string;
    title: string;
  }>;
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

const handleTabRemove = (tabId: string) => {
  emit("remove", tabId);
};

const handleAddTab = () => {
  emit("add");
};
</script>

<style scoped>
.tab-manager {
  height: 40px;
  background-color: var(--header-bg);
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 8px;
}

:deep(.el-tabs__item) {
  padding: 0 16px !important;
  height: 40px;
  line-height: 40px;
}

/* 添加按钮样式 */
:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__extra-content) {
  height: 40px;
  display: flex;
  align-items: center;
}

.add-tab-button {
  margin: 0 8px;
  padding: 8px;
  border: none;
  background: transparent;
  height: 32px;
  display: flex;
  align-items: center;
}

.add-tab-button:hover {
  color: var(--el-color-primary);
}
</style>
