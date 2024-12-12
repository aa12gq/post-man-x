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
      >
        <slot :name="tab.id"></slot>
      </el-tab-pane>

      <!-- 添加新标签页的按钮 -->
      <el-button
        class="add-tab-button"
        size="small"
        circle
        @click="handleAddTab"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
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
  display: flex;
  flex-direction: column;
  height: 100%;
}

:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}

.add-tab-button {
  margin: 4px 8px;
}
</style>
